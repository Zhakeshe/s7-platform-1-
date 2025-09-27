import { Router, type Response } from "express"
import { z } from "zod"
import { prisma } from "../db"
import { requireAdmin, requireAuth } from "../middleware/auth"
import type { AuthenticatedRequest } from "../types"

// Declare router early so it can be used by routes defined above/below
export const router = Router()

const slideSchema = z.object({
  title: z.string().optional(),
  url: z.string().url(),
  storagePath: z.string().optional(),
})

// Competitions CRUD (admin-only)
const competitionSchema = z.object({
  id: z.string().optional(),
  teamId: z.string(),
  name: z.string().min(1),
  description: z.string().optional(),
  competitionDate: z.union([z.string(), z.date()]),
  venue: z.string().optional(),
  awardsWon: z.string().optional(),
  status: z.string().optional(),
})

router.get("/competitions", async (_req: AuthenticatedRequest, res: Response) => {
  const list = await prisma.competition.findMany({ orderBy: { createdAt: "desc" } })
  res.json(list)
})

router.post("/competitions", async (req: AuthenticatedRequest, res: Response) => {
  const parsed = competitionSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })
  const data = parsed.data
  const created = await prisma.competition.create({
    data: {
      id: data.id,
      teamId: data.teamId,
      name: data.name,
      description: data.description,
      competitionDate: new Date(data.competitionDate as any),
      venue: data.venue,
      awardsWon: data.awardsWon,
      status: data.status ?? "upcoming",
    },
  })
  res.status(201).json(created)
})

router.put("/competitions/:competitionId", async (req: AuthenticatedRequest, res: Response) => {
  const { competitionId } = req.params
  const parsed = competitionSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })
  const data = parsed.data
  try {
    const updated = await prisma.competition.update({
      where: { id: competitionId },
      data: {
        teamId: data.teamId,
        name: data.name,
        description: data.description,
        competitionDate: new Date(data.competitionDate as any),
        venue: data.venue,
        awardsWon: data.awardsWon,
        status: data.status ?? undefined,
      },
    })
    res.json(updated)
  } catch (e) {
    res.status(404).json({ error: "Competition not found" })
  }
})

router.delete("/competitions/:competitionId", async (req: AuthenticatedRequest, res: Response) => {
  const { competitionId } = req.params
  await prisma.competition.delete({ where: { id: competitionId } }).catch(() => null)
  res.json({ success: true })
})

const lessonSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1),
  content: z.string().optional(),
  duration: z.string().optional(),
  orderIndex: z.number().int().min(0),
  isFreePreview: z.boolean().optional().default(false),
  videoUrl: z.string().optional(),
  videoStoragePath: z.string().optional(),
  presentationUrl: z.string().optional(),
  presentationStoragePath: z.string().optional(),
  slides: z.array(slideSchema).optional(),
  contentType: z.string().default("text"),
})

const moduleSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1),
  description: z.string().optional(),
  orderIndex: z.number().int().min(0),
  lessons: z.array(lessonSchema).default([]),
})

const courseSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1),
  description: z.string().min(1),
  difficulty: z.string().min(1),
  price: z.number().nonnegative().default(0),
  isFree: z.boolean().default(true),
  isPublished: z.boolean().default(false),
  coverImageUrl: z.string().optional(),
  estimatedHours: z.number().int().nonnegative().optional(),
  modules: z.array(moduleSchema).default([]),
})

const teamSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  description: z.string().optional(),
  captainId: z.string().optional(),
  logoUrl: z.string().optional(),
  maxMembers: z.number().int().positive().optional(),
  isActive: z.boolean().optional(),
  metadata: z.record(z.any()).optional(),
})

// router already declared above

router.use(requireAuth, requireAdmin)

// User management (admin-only)
const roleUpdateSchema = z.object({ role: z.enum(["ADMIN", "USER"]) })

router.get("/users", async (_req: AuthenticatedRequest, res: Response) => {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, email: true, role: true, fullName: true, createdAt: true },
  })
  res.json(users)
})

router.post("/users/:userId/role", async (req: AuthenticatedRequest, res: Response) => {
  const { userId } = req.params
  const parsed = roleUpdateSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })
  try {
    const updated = await prisma.user.update({ where: { id: userId }, data: { role: parsed.data.role } })
    return res.json({ id: updated.id, email: updated.email, role: updated.role })
  } catch {
    return res.status(404).json({ error: "User not found" })
  }
})

router.post("/users/:userId/promote", async (req: AuthenticatedRequest, res: Response) => {
  const { userId } = req.params
  try {
    const updated = await prisma.user.update({ where: { id: userId }, data: { role: "ADMIN" } })
    return res.json({ id: updated.id, email: updated.email, role: updated.role })
  } catch {
    return res.status(404).json({ error: "User not found" })
  }
})

router.post("/users/:userId/demote", async (req: AuthenticatedRequest, res: Response) => {
  const { userId } = req.params
  try {
    const updated = await prisma.user.update({ where: { id: userId }, data: { role: "USER" } })
    return res.json({ id: updated.id, email: updated.email, role: updated.role })
  } catch {
    return res.status(404).json({ error: "User not found" })
  }
})

// Award a simple ad-hoc achievement to a user (admin-only)
const awardSchema = z.object({ text: z.string().min(1) })

router.post("/users/:userId/achievements", async (req: AuthenticatedRequest, res: Response) => {
  const { userId } = req.params
  const parsed = awardSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })
  // Create a minimal achievement and link it to the user
  try {
    const achievement = await prisma.achievement.create({
      data: {
        title: "Достижение",
        description: parsed.data.text,
        criteriaType: "manual",
      },
    })
    const ua = await prisma.userAchievement.create({
      data: {
        userId,
        achievementId: achievement.id,
        awardedById: req.user!.id,
      },
    })
    return res.status(201).json(ua)
  } catch (e) {
    return res.status(400).json({ error: "Failed to create achievement" })
  }
})

// Enroll user to a course (admin-only)
const enrollSchema = z.object({ courseId: z.string().min(1) })

router.post("/users/:userId/enrollments", async (req: AuthenticatedRequest, res: Response) => {
  const { userId } = req.params
  const parsed = enrollSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })
  try {
    // ensure course exists
    const course = await prisma.course.findUnique({ where: { id: parsed.data.courseId } })
    if (!course) return res.status(404).json({ error: "Course not found" })

    const existing = await prisma.enrollment.findFirst({ where: { userId, courseId: parsed.data.courseId } })
    if (existing) return res.json(existing)

    const enr = await prisma.enrollment.create({
      data: {
        userId,
        courseId: parsed.data.courseId,
        status: "active",
      },
    })
    return res.status(201).json(enr)
  } catch (e) {
    return res.status(400).json({ error: "Failed to enroll" })
  }
})

router.get("/courses", async (_req: AuthenticatedRequest, res: Response) => {
  const courses = await prisma.course.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      modules: {
        orderBy: { orderIndex: "asc" },
        include: { lessons: { orderBy: { orderIndex: "asc" } } },
      },
    },
  })
  res.json(courses)
})

router.post("/courses", async (req: AuthenticatedRequest, res: Response) => {
  const parsed = courseSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })
  const data = parsed.data

  const course = await prisma.course.create({
    data: {
      title: data.title,
      description: data.description,
      difficulty: data.difficulty,
      authorId: req.user!.id,
      price: data.price,
      isFree: data.isFree,
      isPublished: data.isPublished,
      coverImageUrl: data.coverImageUrl,
      estimatedHours: data.estimatedHours,
      totalModules: data.modules.length,
      modules: {
        create: data.modules.map((module, moduleIndex) => ({
          id: module.id,
          title: module.title,
          description: module.description,
          orderIndex: module.orderIndex ?? moduleIndex,
          lessons: {
            create: module.lessons.map((lesson, lessonIndex) => ({
              id: lesson.id,
              title: lesson.title,
              content: lesson.content,
              duration: lesson.duration,
              orderIndex: lesson.orderIndex ?? lessonIndex,
              isFreePreview: lesson.isFreePreview ?? false,
              videoUrl: lesson.videoUrl,
              videoStoragePath: lesson.videoStoragePath,
              presentationUrl: lesson.presentationUrl,
              presentationStoragePath: lesson.presentationStoragePath,
              slides: lesson.slides ?? [],
              contentType: lesson.contentType,
            })),
          },
        })),
      },
    },
    include: {
      modules: { include: { lessons: true } },
    },
  })

  res.status(201).json(course)
})

router.put("/courses/:courseId", async (req: AuthenticatedRequest, res: Response) => {
  const { courseId } = req.params
  const parsed = courseSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })
  const data = parsed.data

  const existing = await prisma.course.findUnique({ where: { id: courseId } })
  if (!existing) return res.status(404).json({ error: "Course not found" })

  await prisma.$transaction([
    prisma.lesson.deleteMany({ where: { module: { courseId } } }),
    prisma.courseModule.deleteMany({ where: { courseId } }),
  ])

  const updated = await prisma.course.update({
    where: { id: courseId },
    data: {
      title: data.title,
      description: data.description,
      difficulty: data.difficulty,
      price: data.price,
      isFree: data.isFree,
      isPublished: data.isPublished,
      coverImageUrl: data.coverImageUrl,
      estimatedHours: data.estimatedHours,
      totalModules: data.modules.length,
      modules: {
        create: data.modules.map((module, moduleIndex) => ({
          id: module.id,
          title: module.title,
          description: module.description,
          orderIndex: module.orderIndex ?? moduleIndex,
          lessons: {
            create: module.lessons.map((lesson, lessonIndex) => ({
              id: lesson.id,
              title: lesson.title,
              content: lesson.content,
              duration: lesson.duration,
              orderIndex: lesson.orderIndex ?? lessonIndex,
              isFreePreview: lesson.isFreePreview ?? false,
              videoUrl: lesson.videoUrl,
              videoStoragePath: lesson.videoStoragePath,
              presentationUrl: lesson.presentationUrl,
              presentationStoragePath: lesson.presentationStoragePath,
              slides: lesson.slides ?? [],
              contentType: lesson.contentType,
            })),
          },
        })),
      },
    },
    include: {
      modules: { include: { lessons: true }, orderBy: { orderIndex: "asc" } },
    },
  })

  res.json(updated)
})

router.post("/courses/:courseId/publish", async (req: AuthenticatedRequest, res: Response) => {
  const { courseId } = req.params
  const { published } = z.object({ published: z.boolean().default(true) }).parse(req.body)
  const course = await prisma.course.update({ where: { id: courseId }, data: { isPublished: published } })
  res.json(course)
})

router.delete("/courses/:courseId", async (req: AuthenticatedRequest, res: Response) => {
  const { courseId } = req.params
  await prisma.course.delete({ where: { id: courseId } }).catch(() => null)
  res.json({ success: true })
})

router.get("/teams", async (_req: AuthenticatedRequest, res: Response) => {
  const teams = await prisma.team.findMany({ orderBy: { createdAt: "desc" } })
  res.json(teams)
})

router.post("/teams", async (req: AuthenticatedRequest, res: Response) => {
  const parsed = teamSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })
  const data = parsed.data

  const team = await prisma.team.create({
    data: {
      id: data.id,
      name: data.name,
      description: data.description,
      captainId: data.captainId ?? req.user!.id,
      logoUrl: data.logoUrl,
      maxMembers: data.maxMembers ?? 6,
      isActive: data.isActive ?? true,
      metadata: data.metadata ?? undefined,
    },
  })

  res.status(201).json(team)
})

router.put("/teams/:teamId", async (req: AuthenticatedRequest, res: Response) => {
  const { teamId } = req.params
  const parsed = teamSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })
  const data = parsed.data

  const team = await prisma.team.update({
    where: { id: teamId },
    data: {
      name: data.name,
      description: data.description,
      captainId: data.captainId ?? req.user!.id,
      logoUrl: data.logoUrl,
      maxMembers: data.maxMembers ?? 6,
      isActive: data.isActive ?? true,
      metadata: data.metadata ? JSON.stringify(data.metadata) : undefined,
    },
  })

  res.json(team)
})

router.delete("/teams/:teamId", async (req: AuthenticatedRequest, res: Response) => {
  const { teamId } = req.params
  await prisma.team.delete({ where: { id: teamId } }).catch(() => null)
  res.json({ success: true })
})

// ---- Events moderation ----
router.get("/events", async (_req: AuthenticatedRequest, res: Response) => {
  const events = await prisma.event.findMany({ orderBy: { createdAt: "desc" } })
  res.json(events)
})

router.put("/events/:eventId", async (req: AuthenticatedRequest, res: Response) => {
  const { eventId } = req.params
  const data = req.body as any
  try {
    const updated = await prisma.event.update({
      where: { id: eventId },
      data: {
        title: data.title,
        description: data.description,
        audience: data.audience,
        contact: data.contact,
        date: data.date ? new Date(data.date) : undefined,
        imageUrl: data.imageUrl,
      },
    })
    res.json(updated)
  } catch (e) {
    res.status(404).json({ error: "Event not found" })
  }
})

router.post("/events/:eventId/publish", async (req: AuthenticatedRequest, res: Response) => {
  const { eventId } = req.params
  const ev = await prisma.event.update({ where: { id: eventId }, data: { status: "published" } }).catch(() => null)
  if (!ev) return res.status(404).json({ error: "Event not found" })
  res.json(ev)
})

router.post("/events/:eventId/reject", async (req: AuthenticatedRequest, res: Response) => {
  const { eventId } = req.params
  const ev = await prisma.event.update({ where: { id: eventId }, data: { status: "rejected" } }).catch(() => null)
  if (!ev) return res.status(404).json({ error: "Event not found" })
  res.json(ev)
})

// ---- Competition submissions moderation ----
router.get("/competition-submissions", async (req: AuthenticatedRequest, res: Response) => {
  const status = (req.query.status as string | undefined) as any
  const where = status ? { status } : {}
  const list = await prisma.competitionSubmission.findMany({ where, orderBy: { createdAt: "desc" } })
  res.json(list)
})

router.put("/competition-submissions/:id", async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params
  const data = req.body as any
  try {
    const updated = await prisma.competitionSubmission.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        projectSummary: data.projectSummary,
        venue: data.venue,
        placement: data.placement,
        eventDate: data.eventDate ? new Date(data.eventDate) : undefined,
        imageUrl: data.imageUrl,
      },
    })
    res.json(updated)
  } catch (e) {
    res.status(404).json({ error: "Submission not found" })
  }
})

router.post("/competition-submissions/:id/approve", async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params
  const sub = await prisma.competitionSubmission.update({ where: { id }, data: { status: "approved" } }).catch(() => null)
  if (!sub) return res.status(404).json({ error: "Submission not found" })
  res.json(sub)
})

router.post("/competition-submissions/:id/reject", async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params
  const sub = await prisma.competitionSubmission.update({ where: { id }, data: { status: "rejected" } }).catch(() => null)
  if (!sub) return res.status(404).json({ error: "Submission not found" })
  res.json(sub)
})
