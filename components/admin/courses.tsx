"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { apiFetch } from "@/lib/api"

interface AdminCourse {
  id: string
  title: string
  difficulty: string
  price: number
  isFree: boolean
  modules: Array<{ id: string; title: string; lessons: Array<{ id: string; title: string }> }>
}

function CourseCard({ id, title, level, price, lessonsCount }: { id: string; title: string; level: string; price: number; lessonsCount: number }) {
  return (
    <div className="bg-[#16161c] border border-[#636370]/20 rounded-2xl p-6 text-white relative">
      <div className="absolute top-4 right-4 text-white/70">
        <ArrowUpRight className="w-6 h-6" />
      </div>
      <div className="text-white text-lg font-medium mb-2">{title}</div>
      <span className="inline-block bg-[#22c55e] text-black text-xs font-medium px-3 py-1 rounded-full mb-4">
        {level}
      </span>
      <div className="text-[#a0a0b0] text-sm space-y-1">
        <div>Уроков: {lessonsCount}</div>
        <div>Стоимость: {price > 0 ? `${Number(price).toLocaleString()}₸` : '0₸'}</div>
      </div>
      <Link
        href={`/admin/courses/new?edit=${encodeURIComponent(id)}`}
        className="absolute bottom-4 right-4 text-xs bg-[#2a2a35] text-white/80 rounded-full px-3 py-1 hover:bg-[#333344]"
      >
        Редакт.
      </Link>
    </div>
  )
}

export default function AdminCourses() {
  const [courses, setCourses] = useState<AdminCourse[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiFetch<AdminCourse[]>("/api/admin/courses")
      .then((list) => setCourses(list || []))
      .catch(() => setCourses([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <main className="flex-1 p-6 md:p-8 overflow-y-auto animate-slide-up">
      <h2 className="text-white text-xl font-medium mb-6">Курсы</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/admin/courses/new" className="block">
          <div className="bg-[#16161c] border border-[#636370]/20 rounded-2xl p-6 text-white relative hover:bg-[#1b1b22] transition-colors">
            <div className="absolute top-4 right-4 text-white/70">
              <ArrowUpRight className="w-6 h-6" />
            </div>
            <div className="text-white text-lg font-medium">Создать курс</div>
          </div>
        </Link>
        {loading ? (
          <div className="text-white/60">Загрузка...</div>
        ) : courses.length === 0 ? (
          <div className="text-white/60">Курсов пока нет</div>
        ) : (
          courses.map((c) => (
            <CourseCard
              key={c.id}
              id={c.id}
              title={c.title}
              level={c.difficulty}
              price={Number((c as any).price || 0)}
              lessonsCount={c.modules.reduce((acc, m) => acc + (m.lessons?.length || 0), 0)}
            />
          ))
        )}
      </div>
    </main>
  )
}
