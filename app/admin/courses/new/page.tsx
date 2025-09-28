"use client"
import { useMemo, useState, useEffect } from "react"
import { ArrowUpRight, LogIn } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { listCourses, saveCourses } from "@/lib/s7db"
import { apiFetch } from "@/lib/api"
import { toast } from "@/hooks/use-toast"

interface ModuleItem {
  id: number
  title: string
}

export default function Page() {
  const router = useRouter()
  const search = useSearchParams()
  const editId = search.get("edit")
  const isEdit = useMemo(() => Boolean(editId), [editId])

  const [title, setTitle] = useState("")
  const [author, setAuthor] = useState("")
  const [modules, setModules] = useState<ModuleItem[]>([{ id: 1, title: "Модуль 1" }])
  const [free, setFree] = useState(true)
  const [price, setPrice] = useState<number>(0)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [dragId, setDragId] = useState<number | null>(null)

  useEffect(() => {
    if (!editId) return
    try {
      const raw = localStorage.getItem("s7_admin_courses")
      const list = raw ? JSON.parse(raw) : []
      const found = list.find((c: any) => c.id === editId)
      if (found) {
        setTitle(found.title || "")
        setAuthor(found.author || "")
        setModules(
          (found.modules || []).map((m: any) => ({ id: m.id, title: m.title })) || [{ id: 1, title: "Модуль 1" }]
        )
        if (typeof found.price === "number" && found.price > 0) {
          setFree(false)
          setPrice(found.price)
        } else {
          setFree(true)
          setPrice(0)
        }
        // seed draft from editing course for downstream lesson pages
        localStorage.setItem(
          "s7_admin_course_draft",
          JSON.stringify({ title: found.title, author: found.author, modules: found.modules || [] })
        )
      } else {
        // Fallback to backend fetch if not in local storage
        apiFetch<any[]>("/api/admin/courses")
          .then((list) => {
            const foundSrv = (list || []).find((c: any) => c.id === editId)
            if (!foundSrv) return
            setTitle(foundSrv.title || "")
            setAuthor(foundSrv.author || "")
            setModules(((foundSrv.modules || []).map((m: any) => ({ id: m.id, title: m.title }))) || [{ id: 1, title: "Модуль 1" }])
            if (typeof foundSrv.price === "number" && foundSrv.price > 0) { setFree(false); setPrice(foundSrv.price) } else { setFree(true); setPrice(0) }
            try { localStorage.setItem("s7_admin_course_draft", JSON.stringify({ title: foundSrv.title, author: foundSrv.author, modules: foundSrv.modules || [] })) } catch {}
          })
          .catch(() => {})
      }
    } catch {}
  }, [editId])

  // Hydrate from draft when creating
  useEffect(() => {
    if (editId) return
    try {
      const raw = localStorage.getItem("s7_admin_course_draft")
      if (raw) {
        const d = JSON.parse(raw)
        if (d.title) setTitle(d.title)
        if (d.author) setAuthor(d.author)
        if (Array.isArray(d.modules) && d.modules.length) {
          setModules(d.modules.map((m: any) => ({ id: m.id, title: m.title })))
        }
      }
    } catch {}
  }, [editId])

  // Persist draft on changes
  useEffect(() => {
    try {
      const draft = {
        title,
        author,
        modules: modules.map((m) => ({ id: m.id, title: m.title, lessons: [] })),
        price: free ? 0 : price,
      }
      localStorage.setItem("s7_admin_course_draft", JSON.stringify(draft))
    } catch {}
  }, [title, author, modules, free, price])

  const addModule = () => {
    const nextId = modules.length ? Math.max(...modules.map((m) => m.id)) + 1 : 1
    setModules([...modules, { id: nextId, title: `Модуль ${nextId}` }])
  }

  const renameModule = (id: number, newTitle: string) => {
    setModules((prev) => prev.map((m) => (m.id === id ? { ...m, title: newTitle } : m)))
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
    if (typeof window !== 'undefined' && !window.confirm('Опубликовать курс?')) return
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
            })),
          }))
        }
      }
    } catch {}

    const newCourse = {
      id: title.toLowerCase().replace(/\s+/g, "-"),
      title,
      difficulty: free ? "Легкий" : "Средний",
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
          difficulty: free ? "Легкий" : "Средний",
          price: free ? 0 : Number(price || 0),
          isFree: free,
          isPublished: true,
          modules: finalModules.map((m, mi) => ({
            id: String(m.id),
            title: m.title || `Модуль ${mi + 1}`,
            orderIndex: mi,
            lessons: (m as any).lessons?.map((l: any, li: number) => ({
              id: String(l.id ?? `${mi + 1}-${li + 1}`),
              title: l.title || `Урок ${li + 1}`,
              duration: l.time || l.duration || undefined,
              orderIndex: li,
              isFreePreview: false,
              content: l.content || undefined,
              contentType: "text",
            })) || [],
          })),
        }
        await apiFetch("/api/admin/courses", { method: "POST", body: JSON.stringify(payload) })
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
        <div className="bg-[#16161c] border border-[#636370]/20 rounded-2xl p-5 text-white">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Название"
            className="w-full bg-transparent outline-none text-2xl md:text-3xl font-semibold placeholder-white/40"
          />
          <div className="mt-3 flex items-center gap-3">
            <span className="inline-flex items-center text-xs font-medium px-3 py-1 rounded-full bg-[#f59e0b] text-black">
              фильтр
            </span>
            <input
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Имя автора"
              className="bg-[#0f0f14] border border-[#2a2a35] text-white/80 text-xs rounded-full px-3 py-1 outline-none"
            />
          </div>

        {/* Danger Zone: Delete when editing */}
        {isEdit && (
          <div className="pt-2">
            <button
              onClick={async () => {
                if (typeof window !== 'undefined' && !window.confirm('Удалить этот курс?')) return
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
            <a href={`/admin/courses/new/${m.id}`} aria-label="Открыть уроки" className="text-[#a0a0b0] hover:text-white">
              <LogIn className="w-5 h-5" />
            </a>
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
