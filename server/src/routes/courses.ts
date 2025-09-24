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
})

const progressSchema = z.object({
  lessonId: z.string(),
  isCompleted: z.boolean().optional(),
  watchTimeSeconds: z.number().int().nonnegative().optional(),
})

export const router = Router()

router.get("/", async (_req: Request, res: Response) => {
  const courses = await prisma.course.findMany({
    where: { isPublished: true },
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
