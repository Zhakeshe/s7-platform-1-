"use client"
import { useEffect, useMemo, useRef, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Image, Upload, Trash, Bold, Italic, Heading2, List } from "lucide-react"
import dynamic from "next/dynamic"
import { saveFile, deleteFile } from "@/lib/s7media"
import { toast } from "@/hooks/use-toast"
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

  useEffect(() => {
    setCourse(readDraft())
  }, [])

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
    updateLesson({ videoName: "", videoMediaId: undefined })
    if (id) try { await deleteFile(id) } catch {}
  }

  return (
    <main className="flex-1 p-6 md:p-8 overflow-y-auto animate-slide-up">
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
                className="rounded-2xl bg-[#0f0f14] border border-[#2a2a35] min-h-[320px] flex items-center justify-center text-white cursor-pointer"
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
                  <div className="text-center">
                    <div className="text-lg font-medium">Видео: {lesson.videoName}</div>
                    <div className="text-white/60 text-sm">Файл сохранён. Можно заменить или удалить.</div>
                  </div>
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
