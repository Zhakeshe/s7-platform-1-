"use client"
import { useEffect, useState } from "react"
import { apiFetch } from "@/lib/api"

interface UserRef { id: string; email: string; fullName?: string }
interface Achievement { id: string; title: string; description: string; earnedAt?: string }
interface UserAchievementRow { id: string; earnedAt: string; user: UserRef; achievement: Achievement }

interface SubmissionRow {
  id: string
  title: string
  placement?: string
  venue?: string
  eventDate?: string
  user: UserRef
}

export default function AdminAchievementsPage() {
  const [rows, setRows] = useState<UserAchievementRow[]>([])
  const [winners, setWinners] = useState<SubmissionRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      apiFetch<UserAchievementRow[]>("/api/admin/achievements/users").catch(() => []),
      apiFetch<SubmissionRow[]>("/api/admin/competition-submissions?status=approved").catch(() => []),
    ])
      .then(([a, w]) => { setRows(a || []); setWinners(w || []) })
      .finally(() => setLoading(false))
  }, [])

  return (
    <main className="flex-1 p-6 md:p-8 overflow-y-auto animate-slide-up">
      <h1 className="text-white text-2xl font-bold mb-6">Достижения участников</h1>

      {/* User Achievements */}
      <section className="mb-10">
        <h2 className="text-white text-lg font-semibold mb-3">Значки и награды</h2>
        <div className="bg-[#16161c] border border-[#636370]/20 rounded-2xl p-4">
          {loading ? (
            <div className="text-white/70">Загрузка...</div>
          ) : rows.length === 0 ? (
            <div className="text-white/60">Нет данных</div>
          ) : (
            <div className="divide-y divide-[#2a2a35]">
              {rows.map((r) => (
                <div key={r.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#00a3ff] text-black flex items-center justify-center font-semibold">
                      {(r.user.fullName || r.user.email || "?").charAt(0)}
                    </div>
                    <div>
                      <div className="text-white font-medium">{r.user.fullName || r.user.email}</div>
                      <div className="text-white/60 text-sm">{r.achievement.title}</div>
                    </div>
                  </div>
                  <div className="text-white/50 text-xs">{new Date(r.earnedAt).toLocaleString("ru-RU")}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Competition Winners */}
      <section>
        <h2 className="text-white text-lg font-semibold mb-3">Победители соревнований</h2>
        <div className="bg-[#16161c] border border-[#636370]/20 rounded-2xl p-4">
          {loading ? (
            <div className="text-white/70">Загрузка...</div>
          ) : winners.length === 0 ? (
            <div className="text-white/60">Нет победителей</div>
          ) : (
            <div className="divide-y divide-[#2a2a35]">
              {winners.map((w) => (
                <div key={w.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#00a3ff] text-black flex items-center justify-center font-semibold">
                      {(w.user.fullName || w.user.email || "?").charAt(0)}
                    </div>
                    <div>
                      <div className="text-white font-medium">{w.user.fullName || w.user.email}</div>
                      <div className="text-white/60 text-sm">{w.title} — {w.placement || "место"}</div>
                    </div>
                  </div>
                  <div className="text-white/50 text-xs">{w.eventDate ? new Date(w.eventDate).toLocaleDateString("ru-RU") : ""}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
