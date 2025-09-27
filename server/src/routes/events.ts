import { Router, type Request, type Response } from "express"
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
router.get("/", async (req: Request, res: Response) => {
  const category = (req.query.category as string | undefined)?.trim()
  const where: any = { status: "published" }
  if (category && category.toLowerCase() !== "all") {
    where.audience = { contains: category, mode: "insensitive" }
  }
  const events = await (prisma as any).event.findMany({
    where,
    orderBy: { date: "asc" },
  })
  res.json(events)
})

// Public: get by id (only published, creators/admins may use admin endpoints)
router.get("/:id", async (req: Request, res: Response) => {
  const { id } = req.params
  const event = await (prisma as any).event.findUnique({ where: { id } })
  if (!event || event.status !== "published") return res.status(404).json({ error: "Event not found" })
  res.json(event)
})

// User proposals: list my events
router.get("/mine/list", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const list = await prisma.event.findMany({ where: { createdById: req.user!.id }, orderBy: { createdAt: "desc" } })
  res.json(list)
})

// Create event proposal (pending)
router.post("/", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
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

// Register current user for an event/masterclass
router.post("/:id/register", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params
  const event = await prisma.event.findUnique({ where: { id } })
  if (!event || event.status !== "published") return res.status(404).json({ error: "Event not available" })
  const phone = (req.body as any)?.contactPhone?.toString()?.trim()
  const reg = await (prisma as any).eventRegistration.upsert({
    where: { eventId_userId: { eventId: id, userId: req.user!.id } },
    update: { contactPhone: phone || undefined },
    create: { eventId: id, userId: req.user!.id, status: "pending", contactPhone: phone || undefined },
  })
  res.status(201).json({ status: reg.status })
})

// List my registrations
router.get("/mine/registrations", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const regs = await (prisma as any).eventRegistration.findMany({ where: { userId: req.user!.id } })
  res.json(regs)
})
