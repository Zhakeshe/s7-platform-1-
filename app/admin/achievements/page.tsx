"use client"
import { useEffect, useState } from "react"
import { apiFetch } from "@/lib/api"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "@/hooks/use-toast"

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
  const [open, setOpen] = useState(false)
  const [userId, setUserId] = useState("")
  const [text, setText] = useState("")
  const [saving, setSaving] = useState(false)

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

      <div className="mb-4">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#00a3ff] hover:bg-[#0088cc] text-black">Выдать достижение</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Выдать достижение</DialogTitle>
              <DialogDescription>Укажите ID пользователя и текст достижения.</DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <Input value={userId} onChange={(e)=>setUserId(e.target.value)} placeholder="ID пользователя" />
              <Input value={text} onChange={(e)=>setText(e.target.value)} placeholder="Текст" />
            </div>
            <DialogFooter>
              <Button
                disabled={saving}
                onClick={async ()=>{
                  if (!userId.trim() || !text.trim()) { toast({ title: 'Заполните все поля' } as any); return }
                  setSaving(true)
                  try {
                    const ua = await apiFetch<any>(`/api/admin/users/${encodeURIComponent(userId.trim())}/achievements`, { method: 'POST', body: JSON.stringify({ text: text.trim() }) })
                    // Лучше перезагрузить: но добавим быстрый prepend-элемент
                    setRows((prev)=>[
                      { id: ua.id, earnedAt: new Date().toISOString(), user: { id: userId.trim(), email: userId.trim() }, achievement: { id: ua.achievementId || 'new', title: 'Достижение', description: text.trim() } } as any,
                      ...prev
                    ])
                    setUserId(''); setText(''); setOpen(false)
                    toast({ title: 'Выдано' } as any)
                  } catch(e:any) {
                    toast({ title: 'Ошибка', description: e?.message || 'Не удалось выдать', variant: 'destructive' as any })
                  } finally { setSaving(false) }
                }}
              >
                Сохранить
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

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
