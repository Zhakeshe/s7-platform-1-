"use client"
import { useEffect, useMemo, useRef, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Image, Upload, Trash, Bold, Italic, Heading2, List } from "lucide-react"
import dynamic from "next/dynamic"
import { saveFile, deleteFile, getObjectUrl, getFile } from "@/lib/s7media"
import { toast } from "@/hooks/use-toast"
import { getTokens } from "@/lib/api"
const ReactMarkdown = dynamic(() => import("react-markdown").then((m) => m.default as any), { ssr: false }) as any

interface DraftLesson {
  id: number
  title: string
  time?: string
  slides?: string[]
  videoName?: string
  content?: string
  presentationFileName?: string
  videoMediaId?: string
  slideMediaIds?: string[]
  presentationMediaId?: string
  // uploaded URLs (server-visible)
  videoUrl?: string
  presentationUrl?: string
  slideUrls?: string[]
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
  const params = useParams<{ moduleId: string; lessonId: string }>()
  const moduleId = useMemo(() => Number(params.moduleId), [params.moduleId])
  const lessonId = useMemo(() => Number(params.lessonId), [params.lessonId])
  const router = useRouter()

  const [course, setCourse] = useState<DraftCourse | null>(null)
  const fileInput = useRef<HTMLInputElement | null>(null)
  const slideInput = useRef<HTMLInputElement | null>(null)
  const presentationInput = useRef<HTMLInputElement | null>(null)
  const [videoPreview, setVideoPreview] = useState<string | null>(null)
  const [slidePreviews, setSlidePreviews] = useState<string[]>([])
  const [presPreview, setPresPreview] = useState<string | null>(null)

  useEffect(() => {
    setCourse(readDraft())
  }, [])

  // Ensure draft skeleton exists for this module/lesson so inputs are editable
  useEffect(() => {
    if (!moduleId || !lessonId) return
    // if course not loaded yet, wait for next effect
    if (course == null) {
      const draft: DraftCourse = {
        title: "",
        author: "",
        modules: [
          { id: moduleId, title: `Модуль ${moduleId}` as any, lessons: [{ id: lessonId, title: "Название урока", time: "" }] },
        ],
      }
      setCourse(draft)
      writeDraft(draft)
      return
    }
    // add missing module/lesson if needed
    const mod = course.modules.find((m) => m.id === moduleId)
    if (!mod) {
      const next: DraftCourse = {
        ...course,
        modules: [...course.modules, { id: moduleId, title: `Модуль ${moduleId}`, lessons: [{ id: lessonId, title: "Название урока", time: "" }] }],
      }
      setCourse(next)
      writeDraft(next)
      return
    }
    if (!mod.lessons.find((l) => l.id === lessonId)) {
      const newModules = course.modules.map((m) => (m.id === moduleId ? { ...m, lessons: [...m.lessons, { id: lessonId, title: "Название урока", time: "" }] } : m))
      const next: DraftCourse = { ...course, modules: newModules }
      setCourse(next)
      writeDraft(next)
    }
  }, [course, moduleId, lessonId])

  const module = course?.modules?.find((m) => m.id === moduleId)
  const lessonIndex = module?.lessons?.findIndex((l) => l.id === lessonId) ?? -1
  const lesson = lessonIndex >= 0 && module ? module.lessons[lessonIndex] : undefined

  const updateLesson = (patch: Partial<DraftLesson>) => {
    if (!course || !module || lessonIndex < 0) return
    const newModules = course.modules.map((m) =>
      m.id === module.id
        ? {
            ...m,
            lessons: m.lessons.map((l, idx) => (idx === lessonIndex ? { ...l, ...patch } : l)),
          }
        : m
    )
    const next = { ...course, modules: newModules }
    setCourse(next)
    writeDraft(next)
  }

  // Build local previews from IndexedDB media ids
  useEffect(() => {
    let alive = true
    ;(async () => {
      if (!lesson) return
      if (lesson.videoMediaId) {
        const u = await getObjectUrl(lesson.videoMediaId)
        if (alive) setVideoPreview(u)
      } else setVideoPreview(null)
      if (Array.isArray(lesson.slideMediaIds) && lesson.slideMediaIds.length) {
        const urls = await Promise.all(lesson.slideMediaIds.map((id) => getObjectUrl(id)))
        if (alive) setSlidePreviews((urls.filter(Boolean) as string[]))
      } else setSlidePreviews([])
      if (lesson.presentationMediaId) {
        const u = await getObjectUrl(lesson.presentationMediaId)
        if (alive) setPresPreview(u)
      } else setPresPreview(null)
    })()
    return () => { alive = false }
  }, [lesson?.videoMediaId, lesson?.slideMediaIds, lesson?.presentationMediaId])

  // Helper: upload a local media by its id to server and return absolute URL
  const uploadById = async (mediaId: string): Promise<string> => {
    const rec = await getFile(mediaId)
    if (!rec) throw new Error("Файл не найден")
    const fd = new FormData()
    const file = new File([rec.blob], rec.name, { type: rec.type })
    fd.append("file", file)
    const tokens = getTokens()
    const res = await fetch("/uploads/media", { method: "POST", headers: tokens?.accessToken ? { authorization: `Bearer ${tokens.accessToken}` } : undefined, body: fd })
    if (!res.ok) {
      const text = await res.text().catch(() => "Upload failed")
      throw new Error(text || `Upload failed (${res.status})`)
    }
    const data = await res.json()
    const u = String(data.url || "")
    const abs = u.startsWith("http://") || u.startsWith("https://") ? u : new URL(u, window.location.origin).href
    return abs
  }

  const saveLessonDraft = (goBack?: boolean) => {
    if (!course) return
    try {
      writeDraft(course)
      toast({ title: "Сохранено", description: "Урок сохранён в черновик" } as any)
      if (goBack) router.push(`/admin/courses/new/${moduleId}`)
    } catch {}
  }

  const onSelectVideo = async (file: File) => {
    const meta = await saveFile("video", file)
    updateLesson({ videoName: file.name, videoMediaId: meta.id })
  }

  const onAddSlide = async (file: File) => {
    const meta = await saveFile("slide", file)
    const s = [...(lesson?.slides || []), file.name]
    const ids = [...(lesson?.slideMediaIds || []), meta.id]
    updateLesson({ slides: s, slideMediaIds: ids })
  }

  const onSelectPresentation = async (file: File) => {
    const meta = await saveFile("presentation", file)
    updateLesson({ presentationFileName: file.name, presentationMediaId: meta.id })
  }

  const removeSlideAt = async (idx: number) => {
    if (!lesson) return
    const names = [...(lesson.slides || [])]
    const ids = [...(lesson.slideMediaIds || [])]
    const removedId = ids[idx]
    names.splice(idx, 1)
    ids.splice(idx, 1)
    updateLesson({ slides: names, slideMediaIds: ids })
    if (removedId) try { await deleteFile(removedId) } catch {}
  }

  const removePresentation = async () => {
    if (!lesson) return
    const id = lesson.presentationMediaId
    updateLesson({ presentationFileName: "", presentationMediaId: undefined })
    if (id) try { await deleteFile(id) } catch {}
  }

  const removeVideo = async () => {
    if (!lesson) return
    const id = lesson.videoMediaId
    updateLesson({ videoName: "", videoMediaId: undefined, videoUrl: undefined })
    if (id) try { await deleteFile(id) } catch {}
  }

  // Upload buttons
  const uploadVideoToServer = async () => {
    if (!lesson?.videoMediaId) return
    try {
      const url = await uploadById(lesson.videoMediaId)
      updateLesson({ videoUrl: url })
      toast({ title: "Видео загружено на сервер" } as any)
    } catch (e: any) {
      toast({ title: "Ошибка", description: e?.message || "Не удалось загрузить", variant: "destructive" as any })
    }
  }
  const uploadPresentationToServer = async () => {
    if (!lesson?.presentationMediaId) return
    try {
      const url = await uploadById(lesson.presentationMediaId)
      updateLesson({ presentationUrl: url })
      toast({ title: "Презентация загружена" } as any)
    } catch (e: any) {
      toast({ title: "Ошибка", description: e?.message || "Не удалось загрузить", variant: "destructive" as any })
    }
  }
  const uploadSlidesToServer = async () => {
    if (!lesson?.slideMediaIds || lesson.slideMediaIds.length === 0) return
    try {
      const urls: string[] = []
      for (const id of lesson.slideMediaIds) {
        const url = await uploadById(id)
        urls.push(url)
      }
      updateLesson({ slideUrls: urls })
      toast({ title: "Слайды загружены" } as any)
    } catch (e: any) {
      toast({ title: "Ошибка", description: e?.message || "Не удалось загрузить", variant: "destructive" as any })
    }
  }

  return (
    <main className="flex-1 p-6 md:p-8 overflow-y-auto animate-slide-up">
      <div className="mb-4">
        <button
          onClick={() => router.push(`/admin/courses/new/${moduleId}`)}
          className="inline-flex items-center gap-2 text-white/80 hover:text-white px-3 py-2 rounded-lg bg-[#16161c] border border-[#2a2a35]"
        >
          Назад
        </button>
      </div>
      <h2 className="text-white text-xl font-medium mb-6">Создать курс</h2>

      <div className="max-w-6xl space-y-5">
        {/* Lesson pill */}
        <div className="flex items-center justify-between rounded-full bg-[#16161c] border border-[#2a2a35] px-4 py-3 text-white">
          <div className="flex items-center gap-3 w-full">
            <span className="w-8 h-8 rounded-full bg-[#00a3ff] text-black flex items-center justify-center font-semibold">{lesson?.id ?? 1}</span>
            <input
              value={lesson?.title || ""}
              onChange={(e) => updateLesson({ title: e.target.value })}
              placeholder="Название урока"
              className="flex-1 bg-transparent outline-none text-white/80"
            />
          </div>
          <input
            value={lesson?.time || ""}
            onChange={(e) => updateLesson({ time: e.target.value })}
            placeholder="Время курса"
            className="w-32 text-right bg-transparent outline-none text-white/60"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-6">
          {/* Left: video drop area */}
          <section>
            <div
              className="rounded-3xl border-2 border-[#2a2a35] p-3"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault()
                const f = e.dataTransfer.files?.[0]
                if (f) onSelectVideo(f)
              }}
            >
              <div
                className="rounded-2xl bg-[#0f0f14] border border-[#2a2a35] min-h-[320px] flex items-center justify-center text-white cursor-pointer overflow-hidden"
                onClick={() => fileInput.current?.click()}
              >
                {!lesson?.videoMediaId ? (
                  <div className="text-center">
                    <div className="w-20 h-20 rounded-full bg-[#2a2a35] flex items-center justify-center mx-auto mb-3">
                      <Upload className="w-8 h-8 text-[#a0a0b0]" />
                    </div>
                    <div className="text-xl font-medium">Перетащите видео</div>
                    <div className="text-white/60 text-sm">Не более 1 часа</div>
                  </div>
                ) : (
                  <video src={videoPreview || undefined} controls className="w-full h-full object-contain bg-black" />
                )}
                <input
                  ref={fileInput}
                  type="file"
                  accept="video/*"
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (f) onSelectVideo(f)
                  }}
                  className="hidden"
                />
              </div>
              {lesson?.videoMediaId && (
                <div className="flex items-center justify-end gap-3 mt-3">
                  <button onClick={() => fileInput.current?.click()} className="rounded-full bg-[#2a2a35] hover:bg-[#333344] px-3 py-1 text-white/80 text-sm">Заменить</button>
                  <button onClick={uploadVideoToServer} className="rounded-full bg-[#2a2a35] hover:bg-[#333344] px-3 py-1 text-white/80 text-sm">Загрузить на сервер</button>
                  {lesson.videoUrl && <a href={lesson.videoUrl} target="_blank" className="text-xs text-[#00a3ff] underline">Открыть URL</a>}
                  <button onClick={removeVideo} className="rounded-full bg-[#2a2a35] hover:bg-[#333344] px-3 py-1 text-white/80 text-sm inline-flex items-center gap-1"><Trash className="w-4 h-4"/>Удалить</button>
                </div>
              )}
            </div>
          </section>

          {/* Right: slides */}
          <aside className="space-y-3">
            <button
              onClick={() => slideInput.current?.click()}
              className="w-full inline-flex items-center justify-between rounded-full bg-[#16161c] border border-[#2a2a35] px-4 py-3 text-white hover:bg-[#1a1a22] transition-colors"
            >
              <div className="inline-flex items-center gap-2">
                <Image className="w-5 h-5 text-white/70" />
                <span>Добавить слайд</span>
              </div>
            </button>
            {/* Second add button when no slides yet (to match mock) */}
            {!(lesson?.slides && lesson.slides.length > 0) && (
              <button
                onClick={() => slideInput.current?.click()}
                className="w-full inline-flex items-center justify-between rounded-full bg-[#16161c] border border-[#2a2a35] px-4 py-3 text-white hover:bg-[#1a1a22] transition-colors"
              >
                <div className="inline-flex items-center gap-2">
                  <Image className="w-5 h-5 text-white/70" />
                  <span>Добавить слайд</span>
                </div>
              </button>
            )}
            <input
              ref={slideInput}
              type="file"
              accept="image/*,application/pdf"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) onAddSlide(f)
              }}
              className="hidden"
            />
            {lesson?.slideMediaIds && lesson.slideMediaIds.length > 0 && (
              <div className="flex items-center justify-end gap-3 mt-2">
                <button onClick={uploadSlidesToServer} className="rounded-full bg-[#2a2a35] hover:bg-[#333344] px-3 py-1 text-white/80 text-sm">Загрузить все слайды</button>
                {Array.isArray(lesson.slideUrls) && lesson.slideUrls.length > 0 && <span className="text-xs text-white/60">Загружено: {lesson.slideUrls.length}</span>}
              </div>
            )}

            {/* Presentation upload */}
            <button
              onClick={() => presentationInput.current?.click()}
              className="w-full inline-flex items-center justify-between rounded-full bg-[#16161c] border border-[#2a2a35] px-4 py-3 text-white hover:bg-[#1a1a22] transition-colors"
            >
              <div className="inline-flex items-center gap-2">
                <Image className="w-5 h-5 text-white/70" />
                <span>Добавить презентацию</span>
              </div>
            </button>
            <input
              ref={presentationInput}
              type="file"
              accept="application/pdf,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) onSelectPresentation(f)
              }}
              className="hidden"
            />

            {/* Render list of added slides */}
            {(lesson?.slides || []).map((name, idx) => (
              <div
                key={`${name}-${idx}`}
                className="w-full inline-flex items-center justify-between rounded-full bg-[#16161c] border border-[#2a2a35] px-4 py-3 text-white animate-slide-up"
              >
                <div className="inline-flex items-center gap-2">
                  <Image className="w-5 h-5 text-white/70" />
                  <span className="text-white/80">{name}</span>
                </div>
                <button
                  onClick={() => removeSlideAt(idx)}
                  className="rounded-full bg-[#2a2a35] hover:bg-[#333344] p-2 text-white/80 transition-colors"
                  aria-label="Удалить слайд"
                >
                  <Trash className="w-4 h-4" />
                </button>
              </div>
            ))}

            {/* Show selected presentation */}
            {lesson?.presentationFileName && (
              <div className="w-full inline-flex items-center justify-between rounded-full bg-[#16161c] border border-[#2a2a35] px-4 py-3 text-white animate-slide-up">
                <div className="inline-flex items-center gap-2">
                  <Image className="w-5 h-5 text-white/70" />
                  <span className="text-white/80">Презентация: {lesson.presentationFileName}</span>
                </div>
                <button
                  onClick={removePresentation}
                  className="rounded-full bg-[#2a2a35] hover:bg-[#333344] p-2 text-white/80 transition-colors"
                >
                  <Trash className="w-4 h-4" />
                </button>
              </div>
            )}
            {presPreview && (
              <div className="flex items-center justify-end gap-3">
                <a href={presPreview} target="_blank" className="text-xs rounded-full bg-[#2a2a35] hover:bg-[#333344] px-3 py-1">Открыть локально</a>
                <button onClick={uploadPresentationToServer} className="text-xs rounded-full bg-[#2a2a35] hover:bg-[#333344] px-3 py-1">Загрузить на сервер</button>
                {lesson?.presentationUrl && <a href={lesson.presentationUrl} target="_blank" className="text-xs text-[#00a3ff] underline">URL</a>}
              </div>
            )}
          </aside>
        </div>

        {/* Lesson text content */}
        <section className="bg-[#16161c] border border-[#2a2a35] rounded-2xl p-4 text-white space-y-3 animate-slide-up">
          <div className="flex items-center justify-between">
            <div className="text-white/90 font-medium">Текст урока (Markdown)</div>
            <div className="inline-flex items-center gap-1">
              <button title="Жирный" onClick={() => updateLesson({ content: (lesson?.content || "") + "**жирный**" })} className="p-2 rounded hover:bg-[#2a2a35]"><Bold className="w-4 h-4" /></button>
              <button title="Курсив" onClick={() => updateLesson({ content: (lesson?.content || "") + " *курсив*" })} className="p-2 rounded hover:bg-[#2a2a35]"><Italic className="w-4 h-4" /></button>
              <button title="Заголовок" onClick={() => updateLesson({ content: (lesson?.content || "") + "\n\n## Заголовок" })} className="p-2 rounded hover:bg-[#2a2a35]"><Heading2 className="w-4 h-4" /></button>
              <button title="Список" onClick={() => updateLesson({ content: (lesson?.content || "") + "\n- пункт" })} className="p-2 rounded hover:bg-[#2a2a35]"><List className="w-4 h-4" /></button>
            </div>
          </div>
          <textarea
            value={lesson?.content || ""}
            onChange={(e) => updateLesson({ content: e.target.value })}
            placeholder="Добавьте поясняющий текст, конспект, ссылки и т.д."
            className="w-full min-h-[160px] bg-[#0f0f14] border border-[#2a2a35] rounded-lg p-3 outline-none text-white/90"
          />
          <div className="bg-[#0f0f14] border border-[#2a2a35] rounded-lg p-3 text-white/90">
            <div className="text-white/60 text-xs mb-2">Предпросмотр</div>
            <div className="prose prose-invert max-w-none">
              <ReactMarkdown>{lesson?.content || ""}</ReactMarkdown>
            </div>
          </div>
        </section>
      </div>
      {/* Actions */}
      <div className="flex justify-end gap-3 pt-2">
        <button onClick={() => saveLessonDraft(false)} className="rounded-lg bg-[#2a2a35] hover:bg-[#333344] px-4 py-2 text-white/90">Сохранить</button>
        <button onClick={() => saveLessonDraft(true)} className="rounded-lg bg-[#00a3ff] hover:bg-[#0088cc] px-4 py-2 text-black font-medium">Сохранить и выйти</button>
      </div>
    </main>
  )
}
