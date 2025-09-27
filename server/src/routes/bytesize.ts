import { Router, type Request, type Response } from "express"
import { prisma } from "../db"
import { optionalAuth, requireAuth } from "../middleware/auth"
import type { AuthenticatedRequest } from "../types"

export const router = Router()

// Feed: latest first, include like count and likedByMe
router.get("/", optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  const includeLiked = Boolean(req.user)
  const items = await prisma.byteSizeItem.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { likes: true } },
      ...(includeLiked ? { likes: { where: { userId: req.user!.id } } } : {}),
    } as any,
  })
  const tag = (req.query.tag as string | undefined)?.trim()
  const filtered = tag && tag.toLowerCase() !== "all"
    ? items.filter((it: any) => Array.isArray(it.tags) && it.tags.some((t: string) => String(t).toLowerCase() === tag.toLowerCase()))
    : items
  res.json(
    filtered.map((it: any) => ({
      id: it.id,
      title: it.title,
      description: it.description,
      videoUrl: it.videoUrl,
      coverImageUrl: it.coverImageUrl,
      tags: Array.isArray(it.tags) ? it.tags : [],
      createdAt: it.createdAt,
      likesCount: it._count?.likes ?? 0,
      likedByMe: Array.isArray(it.likes) ? it.likes.length > 0 : false,
    }))
  )
})

// Toggle like
router.post("/:id/like", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id
  const existing = await prisma.byteSizeLike.findUnique({ where: { itemId_userId: { itemId: id, userId: req.user!.id } } }).catch(
    () => null
  )
  if (existing) {
    await prisma.byteSizeLike.delete({ where: { id: existing.id } })
  } else {
    await prisma.byteSizeLike.create({ data: { itemId: id, userId: req.user!.id } })
  }
  const count = await prisma.byteSizeLike.count({ where: { itemId: id } })
  const liked = !existing
  res.json({ liked, likesCount: count })
})
