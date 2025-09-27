import { Router, type Request, type Response } from "express"
import { z } from "zod"
import { prisma } from "../db"
import { optionalAuth, requireAuth } from "../middleware/auth"
import type { AuthenticatedRequest } from "../types"

const purchaseSchema = z.object({
  amount: z.number().positive(),
  currency: z.string().default("KZT"),
  paymentMethod: z.string().default("kaspi"),
  transactionId: z.string().optional(),
  payerFullName: z.string().min(1).optional(),
  senderCode: z.string().min(3).max(64).optional(),
  metadata: z.record(z.any()).optional(),
})

const progressSchema = z.object({
  lessonId: z.string(),
  isCompleted: z.boolean().optional(),
  watchTimeSeconds: z.number().int().nonnegative().optional(),
})

export const router = Router()

// Published courses with optional search/filtering
router.get("/", async (req: Request, res: Response) => {
  const search = (req.query.search as string | undefined)?.trim()
  const filter = (req.query.filter as string | undefined) // 'free' | 'paid' | 'all'

  const where: any = { isPublished: true }
  if (search && search.length > 0) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ]
  }
  if (filter === "free") where.isFree = true
  if (filter === "paid") where.isFree = false

  const courses = await prisma.course.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      author: { select: { id: true, fullName: true } },
      modules: {
        orderBy: { orderIndex: "asc" },
        include: {
          lessons: {
            orderBy: { orderIndex: "asc" },
            select: { id: true, title: true, isFreePreview: true, duration: true },
          },
        },
      },
    },
  })

  res.json(
    courses.map((course) => ({
      id: course.id,
      title: course.title,
      description: course.description,
      difficulty: course.difficulty,
      coverImageUrl: course.coverImageUrl,
      price: course.price,
      isFree: course.isFree,
      estimatedHours: course.estimatedHours,
      author: course.author,
      modules: course.modules,
    }))
  )
})

// Continue list: courses where the user has completed at least 1 lesson
router.get("/continue", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const enrollments = (await prisma.enrollment.findMany({
    where: { userId: req.user!.id },
    orderBy: { updatedAt: "desc" },
    include: {
      lessonProgress: true,
      course: {
        include: {
          author: { select: { id: true, fullName: true } },
          modules: { orderBy: { orderIndex: "asc" }, include: { lessons: true } },
        },
      },
    },
  })) as any[]

  const items = enrollments
    .map((e: any) => {
      const completedLessons = (e.lessonProgress || []).filter((p: any) => p.isCompleted).length
      const totalLessons = (e.course?.modules || []).reduce((acc: number, m: any) => acc + (m.lessons?.length || 0), 0)
      const progress = typeof e.progressPercentage === "number" ? e.progressPercentage : totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0
      return {
        id: e.course.id,
        title: e.course.title,
        difficulty: e.course.difficulty,
        author: e.course.author,
        price: e.course.price,
        modules: (e.course.modules || []).map((m: any) => ({ id: m.id, title: m.title, lessons: m.lessons })),
        completedLessons,
        totalLessons,
        progress,
      }
    })
    .filter((it) => it.completedLessons >= 1)

  res.json(items)
})

router.get("/:courseId", optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  const courseId = req.params.courseId
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      author: { select: { id: true, fullName: true, email: true } },
      modules: {
        orderBy: { orderIndex: "asc" },
        include: {
          lessons: {
            orderBy: { orderIndex: "asc" },
          },
        },
      },
    },
  })
  if (!course) return res.status(404).json({ error: "Course not found" })

  const hasAccess = await userHasCourseAccess(req.user?.id, course)

  const safeModules = course.modules.map((module) => ({
    id: module.id,
    title: module.title,
    description: module.description,
    orderIndex: module.orderIndex,
    lessons: module.lessons.map((lesson) =>
      hasAccess || lesson.isFreePreview
        ? lesson
        : {
            id: lesson.id,
            title: lesson.title,
            duration: lesson.duration,
            isFreePreview: lesson.isFreePreview,
          }
    ),
  }))

  res.json({
    id: course.id,
    title: course.title,
    description: course.description,
    difficulty: course.difficulty,
    author: course.author,
    price: course.price,
    isFree: course.isFree,
    coverImageUrl: course.coverImageUrl,
    estimatedHours: course.estimatedHours,
    modules: safeModules,
    hasAccess,
  })
})

router.get("/:courseId/lessons/:lessonId", optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  const { courseId, lessonId } = req.params
  const lesson = await prisma.lesson.findUnique({ where: { id: lessonId }, include: { module: { include: { course: true } } } })
  if (!lesson || lesson.module.courseId !== courseId) return res.status(404).json({ error: "Lesson not found" })

  const hasAccess = await userHasCourseAccess(req.user?.id, lesson.module.course)
  if (!hasAccess && !lesson.isFreePreview) return res.status(403).json({ error: "Lesson requires purchase" })

  res.json({
    id: lesson.id,
    title: lesson.title,
    content: lesson.content,
    duration: lesson.duration,
    videoUrl: lesson.videoUrl,
    presentationUrl: lesson.presentationUrl,
    slides: lesson.slides,
    isFreePreview: lesson.isFreePreview,
    moduleId: lesson.moduleId,
  })
})

router.post("/:courseId/purchase", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const { courseId } = req.params
  const parsed = purchaseSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })
  const course = await prisma.course.findUnique({ where: { id: courseId } })
  if (!course) return res.status(404).json({ error: "Course not found" })

  const purchase = await prisma.purchase.create({
    data: {
      userId: req.user!.id,
      courseId,
      amount: parsed.data.amount,
      currency: parsed.data.currency,
      paymentMethod: parsed.data.paymentMethod,
      transactionId: parsed.data.transactionId,
      payerFullName: parsed.data.payerFullName,
      senderCode: parsed.data.senderCode,
      metadata: parsed.data.metadata as any,
    },
  })

  res.status(201).json(purchase)
})

router.get("/:courseId/progress", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const { courseId } = req.params

  const enrollment = await prisma.enrollment.findFirst({
    where: { userId: req.user!.id, courseId },
    include: { lessonProgress: true },
  })
  if (!enrollment) return res.json({ completion: 0, lessons: [] })

  res.json({
    completion: enrollment.progressPercentage,
    lessons: enrollment.lessonProgress,
  })
})

router.post("/:courseId/lessons/:lessonId/progress", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const { courseId, lessonId } = req.params
  const parsed = progressSchema.safeParse({ ...req.body, lessonId })
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })

  const course = await prisma.course.findUnique({ where: { id: courseId }, include: { modules: { include: { lessons: true } } } })
  if (!course) return res.status(404).json({ error: "Course not found" })

  const hasAccess = await userHasCourseAccess(req.user!.id, course)
  if (!hasAccess) return res.status(403).json({ error: "No access" })

  let enrollment = await prisma.enrollment.findFirst({ where: { userId: req.user!.id, courseId } })
  if (!enrollment) {
    enrollment = await prisma.enrollment.create({ data: { userId: req.user!.id, courseId } })
  }

  const progress = await prisma.lessonProgress.upsert({
    where: { enrollmentId_lessonId: { enrollmentId: enrollment.id, lessonId } },
    create: {
      enrollmentId: enrollment.id,
      lessonId,
      isCompleted: parsed.data.isCompleted ?? false,
      watchTimeSeconds: parsed.data.watchTimeSeconds ?? 0,
    },
    update: {
      isCompleted: parsed.data.isCompleted ?? undefined,
      watchTimeSeconds: parsed.data.watchTimeSeconds ?? undefined,
      completedAt: parsed.data.isCompleted ? new Date() : undefined,
    },
  })

  await updateCourseProgress(enrollment.id)

  res.json(progress)
})

async function userHasCourseAccess(userId: string | undefined, course: { id: string; isFree: boolean; price: any }) {
  if (course.isFree || !course.price || Number(course.price) === 0) return true
  if (!userId) return false

  const enrollment = await prisma.enrollment.findFirst({ where: { userId, courseId: course.id, status: "active" } })
  if (enrollment) return true

  const purchase = await prisma.purchase.findFirst({ where: { userId, courseId: course.id, status: "approved" } })
  return Boolean(purchase)
}

async function updateCourseProgress(enrollmentId: string) {
  const enrollment = await prisma.enrollment.findUnique({
    where: { id: enrollmentId },
    include: {
      lessonProgress: true,
      course: { include: { modules: { include: { lessons: true } } } },
    },
  })
  if (!enrollment) return

  const totalLessons = enrollment.course.modules.reduce((count, module) => count + module.lessons.length, 0)
  if (totalLessons === 0) return
  const completed = enrollment.lessonProgress.filter((p) => p.isCompleted).length
  const percentage = (completed / totalLessons) * 100

  await prisma.enrollment.update({ where: { id: enrollmentId }, data: { progressPercentage: percentage } })
}
