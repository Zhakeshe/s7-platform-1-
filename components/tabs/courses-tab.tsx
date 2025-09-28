import { ArrowUpRight, Search } from "lucide-react"
import type { CourseDetails } from "@/components/tabs/course-details-tab"
import { useEffect, useRef, useState } from "react"
import { apiFetch } from "@/lib/api"

export default function CoursesTab({
  onOpenCourse,
}: {
  onOpenCourse?: (course: CourseDetails) => void
}) {
  const [continueCourses, setContinueCourses] = useState<CourseDetails[]>([])
  const [recommended, setRecommended] = useState<CourseDetails[]>([])
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<"all" | "free" | "paid">("all")
  const [loadingContinue, setLoadingContinue] = useState(true)
  const [loadingRecommended, setLoadingRecommended] = useState(true)
  const reqIdRef = useRef(0)

  // Load continue list
  useEffect(() => {
    setLoadingContinue(true)
    apiFetch<any[]>("/courses/continue")
      .then((list) => {
        const mapped: CourseDetails[] = (list || []).map((c: any) => ({
          id: c.id,
          title: c.title,
          difficulty: c.difficulty || "",
          author: c.author?.fullName || "",
          price: Number(c.price || 0),
          modules: (c.modules || []).map((m: any) => ({ id: m.id, title: m.title, lessons: m.lessons || [] })),
        }))
        setContinueCourses(mapped)
      })
      .catch(() => setContinueCourses([]))
      .finally(() => setLoadingContinue(false))
  }, [])

  // Load recommended list with filters/search
  const loadRecommended = () => {
    const currentReq = ++reqIdRef.current
    setLoadingRecommended(true)
    const params = new URLSearchParams()
    if (search.trim()) params.set("search", search.trim())
    if (filter !== "all") params.set("filter", filter)
    apiFetch<any[]>(`/courses${params.toString() ? `?${params.toString()}` : ""}`)
      .then((list) => {
        if (currentReq !== reqIdRef.current) return
        const mapped: CourseDetails[] = (list || []).map((c: any) => ({
          id: c.id,
          title: c.title,
          difficulty: c.difficulty || "",
          author: c.author?.fullName || "",
          price: Number(c.price || 0),
          modules: (c.modules || []).map((m: any) => ({ id: m.id, title: m.title, lessons: m.lessons || [] })),
        }))
        setRecommended(mapped)
      })
      .catch(() => { if (currentReq === reqIdRef.current) setRecommended([]) })
      .finally(() => { if (currentReq === reqIdRef.current) setLoadingRecommended(false) })
  }

  useEffect(() => {
    loadRecommended()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter])

  // Load once on mount to avoid any delayed initial appearance
  useEffect(() => {
    loadRecommended()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => loadRecommended(), 300)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  return (
    <main className="flex-1 p-8 overflow-y-auto animate-slide-up">
      {/* Continue section */}
      <section className="mb-12">
        <h2 className="text-white text-xl font-medium mb-6">Продолжить</h2>
        {loadingContinue ? (
          <div className="text-white/70">Загрузка...</div>
        ) : continueCourses.length === 0 ? (
          <div className="text-white/60 text-sm">Нет курсов для продолжения</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {continueCourses.map((c, i) => (
              <div
                key={c.id}
                onClick={() => onOpenCourse?.(c)}
                role="link"
                tabIndex={0}
                className="bg-[#16161c] border border-[#636370]/20 rounded-2xl p-6 hover:border-[#636370]/40 transition-all duration-300 cursor-pointer group hover:scale-102 animate-slide-up"
                style={{ animationDelay: `${200 + i * 50}ms` }}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-white text-lg font-medium mb-2">{c.title}</h3>
                  </div>
                  <ArrowUpRight className="w-6 h-6 text-[#a0a0b0] group-hover:text-white transition-colors duration-300" />
                </div>
                <div className="text-[#a0a0b0] text-sm space-y-1">
                  <div>Автор: {c.author}</div>
                  <div>Уроков: {(c.modules || []).reduce((acc, m) => acc + (m.lessons?.length || 0), 0)}</div>
                  <div>Стоимость: {c.price && c.price > 0 ? `${c.price.toLocaleString()}₸` : "0₸"}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Recommended section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white text-xl font-medium">Рекомендованные курсы</h2>
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a0a0b0] w-4 h-4" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск"
              className="w-full bg-[#16161c] border border-[#636370]/20 rounded-lg pl-9 pr-3 py-2 text-white placeholder-[#a0a0b0] focus:outline-none focus:border-[#00a3ff]"
            />
          </div>
        </div>

        <div className="flex gap-2 mb-6">
          {[
            { id: "all", label: "Все" },
            { id: "free", label: "Бесплатные" },
            { id: "paid", label: "Платные" },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id as any)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                filter === f.id ? "bg-[#00a3ff] text-white" : "bg-[#16161c] text-[#a0a0b0] hover:text-white hover:bg-[#636370]/10"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loadingRecommended ? (
          <div className="text-white/70">Загрузка...</div>
        ) : recommended.length === 0 ? (
          <div className="text-center text-white/70 bg-[#16161c] border border-[#636370]/20 rounded-2xl p-10">Курсы не найдены</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommended.map((c, i) => (
              <div
                key={c.id}
                onClick={() => onOpenCourse?.(c)}
                role="link"
                tabIndex={0}
                className="bg-[#16161c] border border-[#636370]/20 rounded-2xl p-6 hover:border-[#636370]/40 transition-all duration-300 cursor-pointer group hover:scale-102 animate-slide-up"
                style={{ animationDelay: `${200 + i * 50}ms` }}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-white text-lg font-medium mb-2">{c.title}</h3>
                  </div>
                  <ArrowUpRight className="w-6 h-6 text-[#a0a0b0] group-hover:text-white transition-colors duration-300" />
                </div>
                <div className="text-[#a0a0b0] text-sm space-y-1">
                  <div>Автор: {c.author}</div>
                  <div>Уроков: {(c.modules || []).reduce((acc, m) => acc + (m.lessons?.length || 0), 0)}</div>
                  <div>Стоимость: {c.price && c.price > 0 ? `${c.price.toLocaleString()}₸` : "0₸"}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
