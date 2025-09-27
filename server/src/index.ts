import express from "express"
import cors from "cors"
import helmet from "helmet"
import rateLimit from "express-rate-limit"
import cookieParser from "cookie-parser"
import path from "path"
import { env } from "./env"
import { prisma } from "./db"
import { router as authRouter } from "./routes/auth"
import { router as courseRouter } from "./routes/courses"
import { router as adminRouter } from "./routes/admin"
import { router as eventsRouter } from "./routes/events"
import { router as submissionsRouter } from "./routes/submissions"
import { router as uploadRouter } from "./routes/uploads"
import { ensureDir } from "./utils/fs"

const app = express()

app.use(helmet())
app.use(cookieParser())
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: false }))
app.use(
  cors({
    origin: env.CORS_ORIGIN || true,
    credentials: true,
  })
)
app.use(rateLimit({ windowMs: 60_000, max: 200 }))

ensureDir(env.MEDIA_DIR).catch((err) => console.error("Failed to ensure media dir", err))
app.use("/media", express.static(path.resolve(env.MEDIA_DIR)))

app.get("/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`
    res.json({ status: "ok" })
  } catch (error) {
    res.status(500).json({ status: "error", error: String(error) })
  }
})

app.use("/auth", authRouter)
app.use("/courses", courseRouter)
app.use("/api/admin", adminRouter)
app.use("/events", eventsRouter)
app.use("/submissions", submissionsRouter)
app.use("/uploads", uploadRouter)

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err)
  res.status(err.status || 500).json({ error: err.message || "Internal Server Error" })
})

app.listen(env.PORT, () => {
  console.log(`Backend listening on port ${env.PORT}`)
})
