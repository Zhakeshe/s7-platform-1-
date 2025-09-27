import { Router, type Request, type Response } from "express"
import { z } from "zod"
import { prisma } from "../db"
import { hashPassword, verifyPassword } from "../utils/password"
import { signAccessToken, signRefreshToken, verifyToken } from "../utils/jwt"
import { requireAuth } from "../middleware/auth"
import type { AuthenticatedRequest } from "../types"

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string().min(3),
  age: z.number().int().min(10).max(100).optional(),
  educationalInstitution: z.string().optional(),
  primaryRole: z.string().optional(),
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

const refreshSchema = z.object({
  refreshToken: z.string().min(1),
})

export const router = Router()

router.post("/register", async (req: Request, res: Response) => {
  const parsed = registerSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })
  const { email, password, fullName, age, educationalInstitution, primaryRole } = parsed.data

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) return res.status(409).json({ error: "Email already registered" })

  const passwordHash = await hashPassword(password)
  // Bootstrap: first user becomes ADMIN; also special admin email
  const anyAdmin = await prisma.user.findFirst({ where: { role: "ADMIN" } })
  const isBootstrapAdmin = !anyAdmin
  const isSpecialAdmin = email.trim().toLowerCase() === "ch.qynon@gmail.com"

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      fullName,
      age,
      educationalInstitution,
      primaryRole,
      role: isBootstrapAdmin || isSpecialAdmin ? "ADMIN" : undefined,
      profile: { create: {} },
    },
    select: {
      id: true,
      email: true,
      role: true,
      fullName: true,
    },
  })

  const accessToken = signAccessToken(user.id, user.role)
  const refreshToken = signRefreshToken(user.id, user.role)

  await prisma.session.create({
    data: {
      userId: user.id,
      refreshToken,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
    },
  })

  res.status(201).json({
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
    },
  })
})

router.post("/login", async (req: Request, res: Response) => {
  const parsed = loginSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })
  const { email, password } = parsed.data

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      role: true,
      fullName: true,
      passwordHash: true,
    },
  })
  if (!user) return res.status(401).json({ error: "Invalid credentials" })
  const valid = await verifyPassword(password, user.passwordHash)
  if (!valid) return res.status(401).json({ error: "Invalid credentials" })

  const accessToken = signAccessToken(user.id, user.role)
  const refreshToken = signRefreshToken(user.id, user.role)

  await prisma.session.create({
    data: {
      userId: user.id,
      refreshToken,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
    },
  })

  res.json({
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
    },
  })
})

router.post("/refresh", async (req: Request, res: Response) => {
  const parsed = refreshSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })
  const { refreshToken } = parsed.data

  const stored = await prisma.session.findUnique({ where: { refreshToken } })
  if (!stored || stored.expiresAt < new Date()) return res.status(401).json({ error: "Invalid refresh token" })

  let payload
  try {
    payload = verifyToken(refreshToken)
  } catch (error) {
    return res.status(401).json({ error: "Invalid refresh token" })
  }

  const accessToken = signAccessToken(payload.sub, payload.role)
  const newRefreshToken = signRefreshToken(payload.sub, payload.role)

  await prisma.session.update({
    where: { refreshToken },
    data: {
      refreshToken: newRefreshToken,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
    },
  })

  res.json({ accessToken, refreshToken: newRefreshToken })
})

router.post("/logout", async (req: Request, res: Response) => {
  const parsed = refreshSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })
  const { refreshToken } = parsed.data
  await prisma.session.delete({ where: { refreshToken }, select: { id: true } }).catch(() => null)
  res.json({ success: true })
})

router.get("/me", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" })
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    include: { profile: true },
  })
  if (!user) return res.status(404).json({ error: "User not found" })
  res.json({
    id: user.id,
    email: user.email,
    role: user.role,
    fullName: user.fullName,
    profile: user.profile,
  })
})

// Update current user's basic fields
const profileUpdateSchema = z.object({
  fullName: z.string().min(1).optional(),
  age: z.number().int().min(10).max(100).optional(),
  educationalInstitution: z.string().optional(),
  primaryRole: z.string().optional(),
})

router.put("/me", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" })
  const parsed = profileUpdateSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })
  const data = parsed.data
  try {
    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        fullName: data.fullName,
        age: data.age,
        educationalInstitution: data.educationalInstitution,
        primaryRole: data.primaryRole,
      },
      select: { id: true, email: true, role: true, fullName: true },
    })
    return res.json(updated)
  } catch (e) {
    return res.status(500).json({ error: "Failed to update profile" })
  }
})
