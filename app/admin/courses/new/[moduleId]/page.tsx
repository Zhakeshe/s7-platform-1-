"use client"
import { useEffect, useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { LogIn, Plus } from "lucide-react"

interface DraftLesson {
  id: number
  title: string
  time?: string
  slides?: string[]
  videoName?: string
}

interface DraftModule {
  id: number
  title: string
  lessons: DraftLesson[]
}

interface DraftCourse {
  title: string
  author: string
  modules: DraftModule[]
}

function readDraft(): DraftCourse | null {
  try {
    const raw = localStorage.getItem("s7_admin_course_draft")
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function writeDraft(d: DraftCourse) {
  try {
    localStorage.setItem("s7_admin_course_draft", JSON.stringify(d))
  } catch {}
}

export default function Page() {
  const params = useParams<{ moduleId: string }>()
  const router = useRouter()
  const moduleId = useMemo(() => Number(params.moduleId), [params.moduleId])
  const [course, setCourse] = useState<DraftCourse | null>(null)
  const [dragLessonId, setDragLessonId] = useState<number | null>(null)

  useEffect(() => {
    setCourse(readDraft())
  }, [])

  const module = course?.modules?.find((m) => m.id === moduleId)

  const addLesson = () => {
    if (!course || !module) return
    const nextId = module.lessons?.length ? Math.max(...module.lessons.map((l) => l.id)) + 1 : 1
    const newLesson: DraftLesson = { id: nextId, title: "Название урока", time: "" }
    const newModules = course.modules.map((m) => (m.id === module.id ? { ...m, lessons: [...(m.lessons || []), newLesson] } : m))
    const next = { ...course, modules: newModules }
    setCourse(next)
    writeDraft(next)
    router.push(`/admin/courses/new/${moduleId}/${nextId}`)
  }

  const openLesson = (lessonId: number) => {
    router.push(`/admin/courses/new/${moduleId}/${lessonId}`)
  }

  const reorderLessons = (fromId: number, toId: number) => {
    if (!course || !module) return
    const list = [...(module.lessons || [])]
    const fromIdx = list.findIndex((l) => l.id === fromId)
    const toIdx = list.findIndex((l) => l.id === toId)
    if (fromIdx === -1 || toIdx === -1) return
    const [item] = list.splice(fromIdx, 1)
    list.splice(toIdx, 0, item)
    const newModules = course.modules.map((m) => (m.id === module.id ? { ...m, lessons: list } : m))
    const next = { ...course, modules: newModules }
    setCourse(next)
    writeDraft(next)
  }

  return (
    <main className="flex-1 p-6 md:p-8 overflow-y-auto animate-slide-up">
      <div className="mb-4">
        <button
          onClick={() => router.push('/admin/courses/new')}
          className="inline-flex items-center gap-2 text-white/80 hover:text-white px-3 py-2 rounded-lg bg-[#16161c] border border-[#2a2a35]"
        >
          Назад
        </button>
      </div>
      <h2 className="text-white text-xl font-medium mb-6">Создать курс</h2>

      <div className="max-w-4xl space-y-6">
        {/* Module header card */}
        <div className="flex items-center justify-between bg-[#16161c] border border-[#2a2a35] rounded-2xl px-4 py-3 text-white">
          <div className="flex items-center gap-3">
            <span className="w-7 h-7 rounded-full bg-[#2a2a35] text-white/80 flex items-center justify-center text-xs">{module?.id ?? 1}.</span>
            <span className="font-medium">{module?.title ?? `Модуль ${moduleId}`}</span>
          </div>
          <div className="rounded-lg border border-[#2a2a35] p-1 text-[#a0a0b0]">
            <LogIn className="w-5 h-5" />
          </div>
        </div>

        {/* Lessons list */}
        <div className="space-y-3">
          {(module?.lessons || [{ id: 1, title: "Название урока", time: "" }]).map((l) => (
            <div
              key={l.id}
              draggable
              onDragStart={() => setDragLessonId(l.id)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => { if (dragLessonId != null && dragLessonId !== l.id) reorderLessons(dragLessonId, l.id); setDragLessonId(null) }}
              className="w-full flex items-center justify-between rounded-full bg-[#16161c] border border-[#2a2a35] px-4 py-3 text-white hover:bg-[#1a1a22] transition-colors animate-slide-up"
            >
              <button onClick={() => openLesson(l.id)} className="flex items-center gap-3 flex-1 text-left">
                <span className="w-8 h-8 rounded-full bg-[#00a3ff] text-black flex items-center justify-center font-semibold">{l.id}</span>
                <span className="text-white/80">{l.title || "Название урока"}</span>
              </button>
              <span className="text-white/60 text-sm">{l.time || "Время курса"}</span>
            </div>
          ))}

          {/* Add lesson row */}
          <button
            onClick={addLesson}
            className="w-full flex items-center justify-between rounded-full bg-[#16161c] border border-[#2a2a35] px-4 py-3 text-white hover:bg-[#1a1a22] transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-[#00a3ff] text-black flex items-center justify-center font-semibold">
                <Plus className="w-4 h-4" />
              </span>
              <span className="text-white/80">Добавить урок</span>
            </div>
          </button>
        </div>
      </div>
    </main>
  )
}
