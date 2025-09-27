"use client"
import { ArrowUpRight } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { awardAchievement, enrollUser, getUserById, listCourses, type Course } from "@/lib/s7db"
import { toast } from "@/hooks/use-toast"
import { apiFetch } from "@/lib/api"

export default function Page({ params }: { params: { id: string } }) {
  const [name, setName] = useState<string>("")
  const [role, setRole] = useState<string>("")
  const [achOpen, setAchOpen] = useState(false)
  const [achText, setAchText] = useState("")
  const [courseOpen, setCourseOpen] = useState(false)
  const [courses, setCourses] = useState<Course[]>([])
  const [courseId, setCourseId] = useState<string>("")

  useEffect(() => {
    const u = getUserById(params.id)
    setName(u?.fullName || u?.email || params.id)
    setCourses(listCourses())
    // Try to load from backend for accurate role/name
    apiFetch<{ id: string; email: string; role: "USER" | "ADMIN"; fullName?: string }>(`/auth/me`) // fallback: only if viewing self
      .then(() => {})
      .catch(() => {})
    apiFetch<{ id: string; email: string; role: "USER" | "ADMIN"; fullName?: string }[]>(`/admin/users`)
      .then((list) => {
        const found = list.find((x) => x.id === params.id)
        if (found) {
          setName(found.fullName || found.email || params.id)
          setRole(found.role)
        }
      })
      .catch(() => {})
  }, [params.id])

  const promote = async () => {
    try {
      await apiFetch(`/admin/users/${params.id}/promote`, { method: "POST" })
      setRole("ADMIN")
      toast({ title: "Роль обновлена", description: "Пользователь назначен админом" })
    } catch (e: any) {
      toast({ title: "Ошибка", description: e?.message || "Не удалось назначить админом", variant: "destructive" as any })
    }
  }

  const demote = async () => {
    try {
      await apiFetch(`/admin/users/${params.id}/demote`, { method: "POST" })
      setRole("USER")
      toast({ title: "Роль обновлена", description: "Права администратора сняты" })
    } catch (e: any) {
      toast({ title: "Ошибка", description: e?.message || "Не удалось снять права", variant: "destructive" as any })
    }
  }

  const issueAchievement = () => {
    if (!achText.trim()) return
    awardAchievement(params.id, achText.trim(), "admin")
    toast({ title: "Достижение выдано" })
    setAchText("")
    setAchOpen(false)
  }

  const issueCourse = () => {
    if (!courseId) return
    enrollUser(params.id, courseId)
    toast({ title: "Курс выдан" })
    setCourseOpen(false)
  }

  return (
    <main className="flex-1 p-6 md:p-8 overflow-y-auto animate-slide-up">
      <div className="max-w-4xl space-y-4">
        {/* Header pill with id and name */}
        <div className="flex items-center justify-between rounded-full bg-[#16161c] border border-[#2a2a35] px-2 py-2 text-white">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center justify-center rounded-full bg-[#1b1b22] border border-[#2a2a35] w-10 h-8 text-sm text-white/80">
              {params.id.slice(-2)}
            </span>
            <span className="font-medium">{name}</span>
          </div>
          <ArrowUpRight className="w-5 h-5 text-[#a0a0b0]" />
        </div>

        {/* Информация */}
        <section className="bg-[#16161c] border border-[#2a2a35] rounded-2xl p-4 text-white space-y-3">
          <div className="text-white/90 font-medium">Информация</div>
          <div className="text-white/80 text-sm">Роль: <span className="font-semibold">{role || "—"}</span></div>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={promote} className="rounded-lg bg-[#00a3ff] hover:bg-[#0088cc] text-black font-medium py-2">Назначить админом</button>
            <button onClick={demote} className="rounded-lg bg-[#2a2a35] hover:bg-[#333344] py-2">Снять админа</button>
          </div>
        </section>

        {/* Достижения */}
        <section className="bg-[#16161c] border border-[#2a2a35] rounded-2xl p-4 text-white space-y-4">
          <div className="text-white/90 font-medium">Достижения</div>
          <button onClick={() => setAchOpen(true)} className="w-full rounded-2xl bg-[#00a3ff] hover:bg-[#0088cc] text-black font-medium py-4 flex items-center justify-between px-4 transition-colors">
            <span>Выдать достижение</span>
            <ArrowUpRight className="w-5 h-5" />
          </button>
        </section>

        {/* Курсы */}
        <section className="bg-[#16161c] border border-[#2a2a35] rounded-2xl p-4 text-white space-y-4">
          <div className="text-white/90 font-medium">Курсы</div>
          <button onClick={() => setCourseOpen(true)} className="w-full rounded-2xl bg-[#00a3ff] hover:bg-[#0088cc] text-black font-medium py-4 flex items-center justify-between px-4 transition-colors">
            <span>Выдать курсы</span>
            <ArrowUpRight className="w-5 h-5" />
          </button>
        </section>

        {/* Подписка */}
        <section className="bg-[#16161c] border border-[#2a2a35] rounded-2xl p-4 text-white space-y-4">
          <div className="text-white/90 font-medium">Подписка</div>
          <button className="w-full rounded-2xl bg-[#00a3ff] hover:bg-[#0088cc] text-black font-medium py-4 flex items-center justify-between px-4 transition-colors">
            <span>Выдать подписку</span>
            <ArrowUpRight className="w-5 h-5" />
          </button>
        </section>
      </div>

      {/* Achievement modal */}
      {achOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="w-full max-w-md bg-[#16161c] border border-[#2a2a35] rounded-2xl p-6 text-white">
            <div className="text-lg font-medium mb-3">Выдать достижение</div>
            <textarea value={achText} onChange={(e) => setAchText(e.target.value)} rows={4} placeholder="Текст достижения" className="w-full bg-[#0f0f14] border border-[#2a2a35] rounded-lg p-3 text-white outline-none" />
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button onClick={() => setAchOpen(false)} className="rounded-lg bg-[#2a2a35] hover:bg-[#333344] py-2">Отмена</button>
              <button onClick={issueAchievement} className="rounded-lg bg-[#00a3ff] hover:bg-[#0088cc] text-black font-medium py-2">Выдать</button>
            </div>
          </div>
        </div>
      )}

      {/* Course issue modal */}
      {courseOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="w-full max-w-md bg-[#16161c] border border-[#2a2a35] rounded-2xl p-6 text-white">
            <div className="text-lg font-medium mb-3">Выдать курс</div>
            <select value={courseId} onChange={(e) => setCourseId(e.target.value)} className="w-full bg-[#0f0f14] border border-[#2a2a35] rounded-lg p-3 text-white outline-none">
              <option value="">Выберите курс</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button onClick={() => setCourseOpen(false)} className="rounded-lg bg-[#2a2a35] hover:bg-[#333344] py-2">Отмена</button>
              <button onClick={issueCourse} className="rounded-lg bg-[#00a3ff] hover:bg-[#0088cc] text-black font-medium py-2">Выдать</button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
