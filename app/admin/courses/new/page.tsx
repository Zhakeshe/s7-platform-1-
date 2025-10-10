"use client"
import { useMemo, useState, useEffect } from "react"
import { ArrowUpRight, LogIn, Trash } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { listCourses, saveCourses } from "@/lib/s7db"
import { apiFetch } from "@/lib/api"
import { toast } from "@/hooks/use-toast"
import { useConfirm } from "@/components/ui/confirm"

interface ModuleItem {
  id: number
  title: string
}

export default function Page() {
  const router = useRouter()
  const search = useSearchParams()
  const editId = search.get("edit")
  const isFresh = useMemo(() => {
    const v = search.get("fresh")
    return v === "1" || v === "true"
  }, [search])
  const isEdit = useMemo(() => Boolean(editId), [editId])
  const confirm = useConfirm()

  const [title, setTitle] = useState("")
  const [author, setAuthor] = useState("")
  const [modules, setModules] = useState<ModuleItem[]>([{ id: 1, title: "Модуль 1" }])
  const [free, setFree] = useState(true)
  const [price, setPrice] = useState<number>(0)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [dragId, setDragId] = useState<number | null>(null)
  const [difficulty, setDifficulty] = useState<string>("Легкий")
  const [showFilters, setShowFilters] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    if (!editId) return
    try {
      const raw = localStorage.getItem("s7_admin_courses")
      const list = raw ? JSON.parse(raw) : []
      const found = list.find((c: any) => c.id === editId)
      if (found) {
        setTitle(found.title || "")
        setAuthor(found.author || "")
        if (found.difficulty) setDifficulty(found.difficulty)
        // Build local numeric ids for routing, keep remote ids in draft
        const mapped = (found.modules || []).map((m: any, idx: number) => ({ localId: idx + 1, remoteId: m.id, title: m.title, lessons: (m.lessons||[]).map((l:any, li:number)=>({ localId: li+1, remoteId: l.id, title: l.title, time: l.duration })) }))
        setModules(mapped.map((m:any)=>({ id: m.localId, title: m.title })))
        if (typeof found.price === "number" && found.price > 0) {
          setFree(false)
          setPrice(found.price)
        } else {
          setFree(true)
          setPrice(0)
        }
        // seed draft with local+remote ids for module/lesson pages
        localStorage.setItem(
          "s7_admin_course_draft",
          JSON.stringify({ courseId: found.id, title: found.title, author: found.author, difficulty: found.difficulty, price: found.price, modules: mapped.map((m:any)=>({ id: m.localId, remoteId: m.remoteId, title: m.title, lessons: m.lessons.map((l:any)=>({ id: l.localId, remoteId: l.remoteId, title: l.title, time: l.time })) })) })
        )
      } else {
        // Fallback to backend fetch if not in local storage
        apiFetch<any[]>("/api/admin/courses")
          .then((list) => {
            const foundSrv = (list || []).find((c: any) => c.id === editId)
            if (!foundSrv) return
            setTitle(foundSrv.title || "")
            setAuthor(foundSrv.author || "")
            if (foundSrv.difficulty) setDifficulty(foundSrv.difficulty)
            const mapped = (foundSrv.modules || []).map((m: any, idx: number) => ({ localId: idx + 1, remoteId: m.id, title: m.title, lessons: (m.lessons||[]).map((l:any, li:number)=>({ localId: li+1, remoteId: l.id, title: l.title, time: l.duration })) }))
            setModules(mapped.map((m:any)=>({ id: m.localId, title: m.title })))
            if (typeof foundSrv.price === "number" && foundSrv.price > 0) { setFree(false); setPrice(foundSrv.price) } else { setFree(true); setPrice(0) }
            try { localStorage.setItem("s7_admin_course_draft", JSON.stringify({ courseId: foundSrv.id, title: foundSrv.title, author: foundSrv.author, difficulty: foundSrv.difficulty, price: foundSrv.price, modules: mapped.map((m:any)=>({ id: m.localId, remoteId: m.remoteId, title: m.title, lessons: m.lessons.map((l:any)=>({ id: l.localId, remoteId: l.remoteId, title: l.title, time: l.time })) })) })) } catch {}
          })
          .catch(() => {})
      }
    } catch {}
    finally { setHydrated(true) }
  }, [editId])

  // Hydrate from draft when creating
  useEffect(() => {
    if (editId || isFresh) return
    try {
      const raw = localStorage.getItem("s7_admin_course_draft")
      if (raw) {
        const d = JSON.parse(raw)
        if (d.title) setTitle(d.title)
        if (d.author) setAuthor(d.author)
        if (d.difficulty) setDifficulty(d.difficulty)
        if (Array.isArray(d.modules) && d.modules.length) {
          setModules(d.modules.map((m: any) => ({ id: m.id, title: m.title })))
        }
      }
    } catch {}
    finally { setHydrated(true) }
  }, [editId, isFresh])

  // If explicitly opened in fresh mode, clear draft and reset state once
  useEffect(() => {
    if (!isFresh) return
    try { localStorage.removeItem("s7_admin_course_draft") } catch {}
    setTitle("")
    setAuthor("")
    setDifficulty("Легкий")
    setModules([{ id: 1, title: "Модуль 1" }])
    setFree(true)
    setPrice(0)
    setHydrated(true)
  }, [isFresh])

  // Persist draft on changes
  useEffect(() => {
    if (!hydrated) return
    try {
      const existingRaw = localStorage.getItem("s7_admin_course_draft")
      const existing = existingRaw ? JSON.parse(existingRaw) : { modules: [] }
      const mergedModules = modules.map((m) => {
        const prev = (existing.modules || []).find((pm: any) => pm.id === m.id)
        return { id: m.id, title: m.title, lessons: prev?.lessons || [] }
      })
      const draft = {
        ...existing,
        title,
        author,
        difficulty,
        modules: mergedModules,
        price: free ? 0 : price,
      }
      localStorage.setItem("s7_admin_course_draft", JSON.stringify(draft))
    } catch {}
  }, [title, author, difficulty, modules, free, price, hydrated])

  const addModule = () => {
    const nextId = modules.length ? Math.max(...modules.map((m) => m.id)) + 1 : 1
    setModules([...modules, { id: nextId, title: `Модуль ${nextId}` }])
  }

  const renameModule = (id: number, newTitle: string) => {
    setModules((prev) => prev.map((m) => (m.id === id ? { ...m, title: newTitle } : m)))
  }

  const removeModule = async (id: number) => {
    const ok = await confirm({ title: `Удалить модуль ${id}?`, confirmText: 'Удалить', cancelText: 'Отмена', variant: 'danger' })
    if (!ok) return
    setModules((prev) => {
      const filtered = prev.filter((m) => m.id !== id)
      // reindex ids to keep 1..n for UI
      return filtered.map((m, idx) => ({ ...m, id: idx + 1 }))
    })
    // draft persistence is handled by useEffect([modules]) below
    try { toast({ title: 'Модуль удалён' } as any) } catch {}
  }

  const reorderModules = (fromId: number, toId: number) => {
    setModules((prev) => {
      const list = [...prev]
      const fromIdx = list.findIndex((m) => m.id === fromId)
      const toIdx = list.findIndex((m) => m.id === toId)
      if (fromIdx === -1 || toIdx === -1) return prev
      const [item] = list.splice(fromIdx, 1)
      list.splice(toIdx, 0, item)
      return list
    })
  }

  const publish = async () => {
    const ok = await confirm({ title: 'Опубликовать курс?', confirmText: 'Опубликовать', cancelText: 'Отмена' })
    if (!ok) return
    // Build from draft if exists (contains lessons + rich fields)
    let finalModules = modules.map((m) => ({ id: m.id, title: m.title, lessons: [{ id: 1, title: "Введение", time: "10:21" }] }))
    try {
      const draftRaw = localStorage.getItem("s7_admin_course_draft")
      if (draftRaw) {
        const d = JSON.parse(draftRaw)
        if (Array.isArray(d.modules) && d.modules.length) {
          finalModules = d.modules.map((m: any) => ({
            id: m.id,
            title: m.title,
            lessons: (m.lessons || []).map((l: any) => ({
              id: l.id,
              title: l.title,
              time: l.time,
              videoName: l.videoName,
              slides: l.slides || [],
              content: l.content || "",
              presentationFileName: l.presentationFileName || "",
              videoMediaId: l.videoMediaId || undefined,
              slideMediaIds: l.slideMediaIds || [],
              presentationMediaId: l.presentationMediaId || undefined,
              // uploaded URLs used for publishing
              videoUrl: l.videoUrl || undefined,
              presentationUrl: l.presentationUrl || undefined,
              slideUrls: l.slideUrls || [],
            })),
          }))
        }
      }
    } catch {}

    const newCourse = {
      id: title.toLowerCase().replace(/\s+/g, "-"),
      title,
      difficulty,
      author,
      price: free ? 0 : price,
      modules: finalModules,
      published: true,
    }

    try {
      // 1) Send to backend (source of truth)
      try {
        const payload = {
          title: title.trim(),
          description: title.trim(),
          difficulty,
          price: free ? 0 : Number(price || 0),
          isFree: free,
          isPublished: true,
          modules: finalModules.map((m, mi) => ({
            // do NOT send id to let DB generate unique cuid
            title: (m as any).title || `Модуль ${mi + 1}`,
            orderIndex: mi,
            lessons: (m as any).lessons?.map((l: any, li: number) => ({
              // do NOT send id to avoid PK collisions
              title: l.title || `Урок ${li + 1}`,
              duration: l.time || l.duration || undefined,
              orderIndex: li,
              isFreePreview: false,
              content: l.content || undefined,
              contentType: "text",
              videoUrl: l.videoUrl || undefined,
              presentationUrl: l.presentationUrl || undefined,
              slides: Array.isArray(l.slideUrls) && l.slideUrls.length
                ? l.slideUrls.map((u: string) => ({ url: u }))
                : undefined,
            })) || [],
          })),
        }
        const created = await apiFetch<any>("/api/admin/courses", { method: "POST", body: JSON.stringify(payload) })
        // After creation, post lesson-level questions from draft (if any)
        try {
          const draftRaw = localStorage.getItem("s7_admin_course_draft")
          const draft = draftRaw ? JSON.parse(draftRaw) : null
          if (created?.id && draft && Array.isArray(draft.modules)) {
            // Build order-indexed maps from created object
            const createdModules = (created.modules || []).slice().sort((a: any, b: any) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0))
            for (let mi = 0; mi < draft.modules.length; mi++) {
              const dMod = draft.modules[mi]
              const cMod = createdModules[mi]
              if (!dMod || !cMod) continue
              const createdLessons = (cMod.lessons || []).slice().sort((a: any, b: any) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0))
              const dLessons: any[] = Array.isArray(dMod.lessons) ? dMod.lessons : []
              for (let li = 0; li < dLessons.length; li++) {
                const dLesson = dLessons[li]
                const cLesson = createdLessons[li]
                if (!dLesson || !cLesson) continue
                const text = (dLesson.quizQuestion || "").trim()
                const opts: string[] = Array.isArray(dLesson.quizOptions) ? dLesson.quizOptions.filter((s: any) => typeof s === 'string' && s.trim()).map((s: string) => s.trim()) : []
                const correctIndex = typeof dLesson.quizCorrectIndex === 'number' ? dLesson.quizCorrectIndex : -1
                const xpReward = typeof dLesson.quizXp === 'number' ? dLesson.quizXp : 100
                if (text && opts.length >= 2 && correctIndex >= 0 && correctIndex < opts.length) {
                  await apiFetch(`/courses/${created.id}/questions`, {
                    method: "POST",
                    body: JSON.stringify({
                      text,
                      options: opts,
                      correctIndex,
                      xpReward,
                      moduleId: cMod.id,
                      lessonId: cLesson.id,
                    }),
                  }).catch(() => null)
                }
              }
            }
          }
        } catch {}
      } catch (e: any) {
        // If backend save fails, continue with legacy local storage as fallback
        console.warn("Backend create course failed:", e?.message)
      }

      // 2) Legacy local storage for backward compatibility
      // Update legacy admin storage for the Admin UI cards
      const raw = localStorage.getItem("s7_admin_courses")
      const list = raw ? JSON.parse(raw) : []
      if (editId) {
        const idx = list.findIndex((c: any) => c.id === editId)
        if (idx !== -1) list[idx] = newCourse
        else list.push(newCourse)
      } else {
        // Replace if same slug exists
        const idx = list.findIndex((c: any) => c.id === newCourse.id)
        if (idx !== -1) list[idx] = newCourse
        else list.push(newCourse)
      }
      localStorage.setItem("s7_admin_courses", JSON.stringify(list))

      // Also sync to S7DB for consumption in the app
      try {
        const db = listCourses()
        const i = db.findIndex((c) => c.id === newCourse.id)
        if (i >= 0) db[i] = newCourse as any
        else db.push(newCourse as any)
        saveCourses(db as any)
      } catch {}

      localStorage.removeItem("s7_admin_course_draft")
    } catch {}

    toast({ title: "Курс сохранён" } as any)
    router.push("/admin/courses")
  }

  return (
    <main className="flex-1 p-6 md:p-8 overflow-y-auto animate-slide-up">
      <h2 className="text-white text-xl font-medium mb-6">Создать курс</h2>

      <div className="max-w-2xl space-y-5">
        {/* Title Card */}
        <div className="bg-[#16161c] border border-[#636370]/20 rounded-2xl p-5 text-white relative">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Название"
            className="w-full bg-transparent outline-none text-2xl md:text-3xl font-semibold placeholder-white/40"
          />
          <div className="mt-3 flex items-center gap-3 relative">
            <button
              type="button"
              onClick={() => setShowFilters((s)=>!s)}
              className="inline-flex items-center text-xs font-medium px-3 py-1 rounded-full bg-[#f59e0b] text-black"
            >
              фильтр
            </button>
            <input
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Имя автора"
              className="bg-[#0f0f14] border border-[#2a2a35] text-white/80 text-xs rounded-full px-3 py-1 outline-none"
            />
            {showFilters && (
              <div className="absolute top-full left-0 mt-2 w-72 bg-[#0f0f14] border border-[#2a2a35] rounded-xl p-3 shadow-xl z-10">
                <div className="text-white/80 text-xs mb-2">Сложность</div>
                <div className="flex items-center gap-2">
                  {( ["Легкий","Средний","Сложный"] as string[] ).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setDifficulty(lvl)}
                      className={`px-3 py-1 rounded-full text-xs border ${difficulty === lvl ? 'bg-[#00a3ff] text-white border-[#00a3ff]' : 'bg-transparent text-white/80 border-[#2a2a35]'}`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
                <div className="flex justify-end mt-3">
                  <button onClick={()=>setShowFilters(false)} className="text-xs px-3 py-1 rounded-lg bg-[#2a2a35] hover:bg-[#333344] text-white/80">Готово</button>
                </div>
              </div>
            )}
          </div>

        {/* Danger Zone: Delete when editing */}
        {isEdit && (
          <div className="pt-2">
            <button
              onClick={async () => {
                const ok = await confirm({ title: 'Удалить этот курс?', confirmText: 'Удалить', cancelText: 'Отмена', variant: 'danger' })
                if (!ok) return
                try {
                  await apiFetch(`/api/admin/courses/${editId}` as any, { method: 'DELETE' })
                  try {
                    const raw = localStorage.getItem('s7_admin_courses')
                    const list = raw ? JSON.parse(raw) : []
                    const next = (list || []).filter((c: any) => c.id !== editId)
                    localStorage.setItem('s7_admin_courses', JSON.stringify(next))
                    localStorage.removeItem('s7_admin_course_draft')
                  } catch {}
                  toast({ title: 'Курс удалён' } as any)
                  router.push('/admin/courses')
                } catch (e: any) {
                  toast({ title: 'Ошибка', description: e?.message || 'Не удалось удалить', variant: 'destructive' as any })
                }
              }}
              className="w-full rounded-2xl bg-[#ef4444] hover:bg-[#dc2626] text-white font-medium py-3"
            >
              Удалить курс
            </button>
          </div>
        )}
        </div>

        {/* Modules */}
        {modules.map((m) => (
          <div
            key={m.id}
            draggable
            onDragStart={() => setDragId(m.id)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => { if (dragId != null && dragId !== m.id) reorderModules(dragId, m.id); setDragId(null) }}
            className="flex items-center justify-between bg-[#16161c] border border-[#2a2a35] rounded-2xl px-4 py-3 text-white animate-slide-up"
          >
            <div className="flex items-center gap-3 w-full">
              <span className="w-7 h-7 rounded-full bg-[#2a2a35] text-white/80 flex items-center justify-center text-xs">{m.id}.</span>
              {editingId === m.id ? (
                <input
                  autoFocus
                  value={m.title}
                  onChange={(e) => renameModule(m.id, e.target.value)}
                  onBlur={() => setEditingId(null)}
                  className="flex-1 bg-transparent outline-none border-b border-[#2a2a35]"
                />
              ) : (
                <button onClick={() => setEditingId(m.id)} className="text-left flex-1">
                  <span className="font-medium">{m.title}</span>
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <a href={`/admin/courses/new/${m.id}`} aria-label="Открыть уроки" className="text-[#a0a0b0] hover:text-white">
                <LogIn className="w-5 h-5" />
              </a>
              <button onClick={() => removeModule(m.id)} aria-label="Удалить модуль" className="text-[#a0a0b0] hover:text-[#ef4444] transition-colors">
                <Trash className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}

        <button
          onClick={addModule}
          className="flex items-center justify-between bg-[#16161c] border border-[#2a2a35] rounded-2xl px-4 py-3 text-white w-full hover:bg-[#1a1a22]"
        >
          <div className="flex items-center gap-3">
            <span className="w-7 h-7 rounded-full bg-[#2a2a35] text-white/80 flex items-center justify-center text-xs">x.</span>
            <span className="font-medium">Добавить модули</span>
          </div>
          <LogIn className="w-5 h-5 text-[#a0a0b0]" />
        </button>

        {/* Draft + Publish */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => {
              try {
                const draft = {
                  title,
                  author,
                  difficulty,
                  modules: modules.map((m) => ({ id: m.id, title: m.title })),
                  price: free ? 0 : price,
                }
                localStorage.setItem("s7_admin_course_draft", JSON.stringify(draft))
                toast({ title: 'Черновик сохранён' } as any)
              } catch {}
            }}
            className="rounded-2xl bg-[#2a2a35] hover:bg-[#333344] text-white font-medium py-4 transition-colors"
          >
            Сохранить черновик
          </button>
          <button
            onClick={publish}
            className="rounded-2xl bg-[#00a3ff] hover:bg-[#0088cc] text-black font-medium py-4 flex items-center justify-center gap-2 transition-colors"
          >
            Опубликовать
            <ArrowUpRight className="w-5 h-5" />
          </button>
        </div>

        {/* Price toggle */}
        <div className="flex items-center gap-3">
          <span className="text-white/70">Цена</span>
          <div className="rounded-full border border-[#2a2a35] p-1 flex items-center bg-[#0f0f14]">
            <button
              onClick={() => setFree(false)}
              className={`px-4 py-1 rounded-full text-sm ${!free ? "bg-[#111118] text-white" : "text-white/70"}`}
            >
              Цена
            </button>
            <button
              onClick={() => setFree(true)}
              className={`px-4 py-1 rounded-full text-sm ${free ? "bg-white text-black" : "text-white/70"}`}
            >
              Бесплатно
            </button>
          </div>
        </div>
        {!free && (
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            placeholder="Введите цену"
            className="w-40 bg-[#0f0f14] border border-[#2a2a35] text-white rounded-lg px-3 py-2 outline-none"
          />
        )}
      </div>
    </main>
  )
}
