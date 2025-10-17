import { Router, type Request, type Response } from "express"
import { prisma } from "../db"
import { requireAuth } from "../middleware/auth"
import type { AuthenticatedRequest } from "../types"

export const router = Router()

// List teams with members count
router.get("/", async (_req: Request, res: Response) => {
  const teams = await prisma.team.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      captain: { select: { id: true, fullName: true } },
      _count: { select: { memberships: true } },
    },
  })
  res.json(
    teams.map((t) => ({
      id: t.id,
      name: t.name,
      description: t.description,
      captain: t.captain,
      membersCount: (t as any)._count?.memberships ?? 0,
      isActive: t.isActive,
      logoUrl: t.logoUrl,
      metadata: t.metadata || {},
    }))
  )
})

// Create team
router.post("/", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const {
    name,
    description,
    city,
    phone,
    educationalInstitution,
    mentorName,
    positionsWanted,
    competitions,
  } = req.body as any
  if (!name || !name.trim()) return res.status(400).json({ error: "Name required" })
  const team = await prisma.team.create({
    data: {
      name: name.trim(),
      description: description?.trim(),
      captainId: req.user!.id,
      metadata: (() => {
        const meta: any = {}
        if (city && String(city).trim()) meta.city = String(city).trim()
        if (phone && String(phone).trim()) meta.phone = String(phone).trim()
        if (educationalInstitution && String(educationalInstitution).trim()) meta.educationalInstitution = String(educationalInstitution).trim()
        if (mentorName && String(mentorName).trim()) meta.mentorName = String(mentorName).trim()
        if (Array.isArray(positionsWanted) && positionsWanted.length > 0) meta.positionsWanted = positionsWanted
        if (Array.isArray(competitions) && competitions.length > 0) meta.competitions = competitions
        return meta
      })(),
    },
  })
  // auto-add captain to membership
  await prisma.teamMembership.create({ data: { teamId: team.id, userId: req.user!.id, role: "captain", status: "active" } })
  res.status(201).json(team)
})

// Request to join team (pending)
router.post("/:teamId/join", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const { teamId } = req.params
  const { telegram, whatsapp } = (req.body || {}) as { telegram?: string; whatsapp?: string }
  const team = await prisma.team.findUnique({ where: { id: teamId } })
  if (!team) return res.status(404).json({ error: "Team not found" })

  // Upsert user's contact info into profile so captain/admins can see it
  try {
    const profile = await prisma.userProfile.findUnique({ where: { userId: req.user!.id } })
    const social: any = (() => {
      try { return profile?.socialLinks ? (profile!.socialLinks as any) : {} } catch { return {} }
    })()
    if (telegram && String(telegram).trim()) social.telegram = String(telegram).trim()
    if (whatsapp && String(whatsapp).trim()) social.whatsapp = String(whatsapp).trim()
    if (profile) {
      await prisma.userProfile.update({ where: { userId: req.user!.id }, data: { phone: whatsapp ? String(whatsapp).trim() : undefined, socialLinks: Object.keys(social).length ? social : undefined } })
    } else {
      await prisma.userProfile.create({ data: { userId: req.user!.id, phone: whatsapp ? String(whatsapp).trim() : undefined, socialLinks: Object.keys(social).length ? social : undefined } })
    }
  } catch {}

  const existing = await prisma.teamMembership.findFirst({ where: { teamId, userId: req.user!.id } })
  if (existing) return res.json({ status: existing.status })

  const membership = await prisma.teamMembership.create({
    data: { teamId, userId: req.user!.id, status: "pending", role: "member" },
  })
  res.status(201).json({ status: membership.status })
})

// List my team memberships
router.get("/mine", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const list = await prisma.teamMembership.findMany({
    where: { userId: req.user!.id },
    orderBy: { joinedAt: "desc" },
    include: { team: true },
  })
  res.json(list.map((m) => ({ id: m.id, role: m.role, status: m.status, joinedAt: m.joinedAt, team: { id: m.teamId, name: (m as any).team?.name, description: (m as any).team?.description } })))
})
