import { Router } from "express"
import { z } from "zod"
import { prisma } from "../db"
import { optionalAuth, requireAuth } from "../middleware/auth"
import type { AuthenticatedRequest } from "../types"

export const router = Router()

const eventSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  audience: z.string().optional(),
  contact: z.string().optional(),
  date: z.union([z.string(), z.date()]).optional(),
  imageUrl: z.string().url().optional(),
})

// Public feed: only published events
router.get("/", async (_req, res) => {
  const events = await prisma.event.findMany({
    where: { status: "published" },
    orderBy: { createdAt: "desc" },
  })
  res.json(events)
})

// Public: get by id (only published, creators/admins may use admin endpoints)
router.get("/:id", async (req, res) => {
  const { id } = req.params
  const event = await prisma.event.findUnique({ where: { id } })
  if (!event || event.status !== "published") return res.status(404).json({ error: "Event not found" })
  res.json(event)
})

// User proposals: list my events
router.get("/mine/list", requireAuth, async (req: AuthenticatedRequest, res) => {
  const list = await prisma.event.findMany({ where: { createdById: req.user!.id }, orderBy: { createdAt: "desc" } })
  res.json(list)
})

// Create event proposal (pending)
router.post("/", requireAuth, async (req: AuthenticatedRequest, res) => {
  const parsed = eventSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })
  const data = parsed.data
  const created = await prisma.event.create({
    data: {
      title: data.title,
      description: data.description,
      audience: data.audience,
      contact: data.contact,
      date: data.date ? new Date(data.date as any) : undefined,
      imageUrl: data.imageUrl,
      status: "pending",
      createdById: req.user!.id,
    },
  })
  res.status(201).json(created)
})
