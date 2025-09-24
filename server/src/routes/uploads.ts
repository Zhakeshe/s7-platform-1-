import { Router } from "express"
import multer from "multer"
import path from "path"
import crypto from "crypto"
import { env } from "../env"
import { requireAuth, requireAdmin } from "../middleware/auth"
import type { AuthenticatedRequest } from "../types"
import { ensureDir } from "../utils/fs"

const storage = multer.diskStorage({
  destination: async (_req, _file, cb) => {
    try {
      await ensureDir(env.MEDIA_DIR)
      cb(null, env.MEDIA_DIR)
    } catch (error) {
      cb(error as Error, "")
    }
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname)
    const base = crypto.randomBytes(16).toString("hex")
    cb(null, `${base}${ext}`)
  },
})

const upload = multer({ storage })

export const router = Router()

router.use(requireAuth)

router.post("/media", upload.single("file"), (req: AuthenticatedRequest, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" })
  const relativePath = req.file.filename
  const url = `/media/${relativePath}`
  res.status(201).json({
    filename: req.file.originalname,
    mimeType: req.file.mimetype,
    size: req.file.size,
    storagePath: req.file.path,
    url,
  })
})

router.delete("/media", requireAdmin, async (req, res) => {
  const { storagePath } = req.body as { storagePath?: string }
  if (!storagePath) return res.status(400).json({ error: "storagePath required" })
  try {
    const fs = await import("fs/promises")
    await fs.unlink(storagePath)
    res.json({ success: true })
  } catch (error) {
    res.status(404).json({ error: "File not found" })
  }
})
