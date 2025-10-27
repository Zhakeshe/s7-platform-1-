import { ArrowUpRight, Search } from "lucide-react"
import type { CourseDetails } from "@/components/tabs/course-details-tab"
import { useEffect, useState } from "react"
import { apiFetch } from "@/lib/api"

export default function HomeTab({
  onOpenCourse,
}: {
  onOpenCourse?: (course: CourseDetails) => void
}) {
  const [continueCourses, setContinueCourses] = useState<CourseDetails[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
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
      .finally(() => setLoading(false))
  }, [])
  return (
    <main className="flex-1 p-6 md:p-8 overflow-y-auto bg-dots-pattern relative z-10">
      <section className="mb-12 md:mb-16 max-w-[1400px] mx-auto">
        <h2 className="text-[48px] md:text-[56px] leading-tight tracking-tight font-medium text-white mb-6 animate-fade-in-up">
          Продолжить <span className="italic text-[var(--color-accent-warm)]">обучение</span>
        </h2>
        {loading ? (
          <div className="text-white/70">Загрузка...</div>
        ) : continueCourses.length === 0 ? (
          <div className="text-white/60 text-sm">Нет курсов для продолжения</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {continueCourses.map((c, idx) => (
              <div
                key={c.id}
                onClick={() => onOpenCourse?.(c)}
                role="link"
                tabIndex={0}
                className="card cursor-pointer group hover:scale-[1.01] animate-fade-in-up"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-white text-lg font-medium mb-2">{c.title}</h3>
                    <span className="chip">
                      {c.difficulty || "Курс"}
                    </span>
                  </div>
                  <ArrowUpRight className="w-6 h-6 text-[#a0a0b0] group-hover:text-white transition-colors duration-300" />
                </div>
                <div className="font-mono text-xs text-3 space-y-1">
                  <div>автор: {c.author || "—"}</div>
                  <div>уроков: {(c.modules || []).reduce((acc, m) => acc + (m.lessons?.length || 0), 0)}</div>
                  <div>стоимость: {c.price && c.price > 0 ? `${c.price.toLocaleString()}₸` : "бесплатно"}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="max-w-[1400px] mx-auto">
        <h2 className="text-[48px] md:text-[56px] leading-tight tracking-tight font-medium text-white mb-6 animate-fade-in-up" style={{ animationDelay: "400ms" }}>
          Последние <span className="italic text-[var(--color-accent-warm)]">новости</span>
        </h2>
        <div className="card text-center animate-fade-in-up" style={{ animationDelay: "500ms" }}>
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-black/20 border border-[#636370]/20">
            <Search className="w-7 h-7 text-[#a0a0b0]" />
          </div>
          <h3 className="text-white text-lg font-medium mb-2">Ничего не найдено</h3>
          <p className="font-mono text-xs text-3">пока нет новостей</p>
        </div>
      </section>
    </main>
  )
}
