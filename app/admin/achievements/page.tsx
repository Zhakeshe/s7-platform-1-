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
import { useConfirm } from "@/components/ui/confirm"
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
  const confirm = useConfirm()
  const [rows, setRows] = useState<UserAchievementRow[]>([])
  const [winners, setWinners] = useState<SubmissionRow[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [userId, setUserId] = useState("")
  const [text, setText] = useState("")
  const [saving, setSaving] = useState(false)
  const [users, setUsers] = useState<Array<{ id: string; email: string; fullName?: string }>>([])
  const [userSearch, setUserSearch] = useState("")

  useEffect(() => {
    Promise.all([
      apiFetch<UserAchievementRow[]>("/api/admin/achievements/users").catch(() => []),
      apiFetch<SubmissionRow[]>("/api/admin/competition-submissions?status=approved").catch(() => []),
    ])
      .then(([a, w]) => { setRows(a || []); setWinners(w || []) })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    apiFetch<any[]>("/api/admin/users")
      .then((list)=> setUsers((list||[]).map((u:any)=>({ id: u.id, email: u.email, fullName: u.fullName }))))
      .catch(()=> setUsers([]))
  }, [])

  return (
    <main className="flex-1 p-6 md:p-8 overflow-y-auto bg-dots-pattern relative z-10 animate-fade-in">
      <h1 className="text-[48px] md:text-[56px] leading-tight tracking-tight font-medium text-white mb-6">
        Достижения <span className="italic text-[var(--color-accent-warm)]">участников</span>
      </h1>

      <div className="mb-4">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[var(--color-accent-warm)] hover:bg-[var(--color-accent-warm-hover)] text-black">Выдать достижение</Button>
          </DialogTrigger>
          <DialogContent className="bg-[#16161c] border border-[#2a2a35] text-white">
            <DialogHeader>
              <DialogTitle className="text-white">Выдать достижение</DialogTitle>
              <DialogDescription className="text-white/70">Найдите пользователя по email и укажите текст достижения.</DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <Input
                value={userSearch}
                onChange={(e)=>{ setUserSearch(e.target.value); const found = users.find(u=>u.email.toLowerCase()===e.target.value.toLowerCase()); if(found) setUserId(found.id) }}
                placeholder="Поиск по email"
                className="bg-[#0f0f14] border-[#2a2a35] text-white"
              />
              <div className="max-h-56 overflow-auto rounded-lg border border-[#2a2a35] bg-[#0f0f14]">
                {(users||[])
                  .filter(u=>!userSearch || u.email.toLowerCase().includes(userSearch.toLowerCase()) || (u.fullName||'').toLowerCase().includes(userSearch.toLowerCase()))
                  .slice(0,50)
                  .map(u=> (
                    <button
                      key={u.id}
                      onClick={()=>{ setUserId(u.id); setUserSearch(u.email) }}
                      className={`w-full text-left px-3 py-2 border-b border-[#2a2a35] last:border-b-0 hover:bg-[#1b1b22] ${userId===u.id ? 'bg-[#1b1b22]' : ''}`}
                    >
                      <div className="text-sm">{u.fullName || u.email}</div>
                      <div className="text-xs text-white/60">{u.email}</div>
                    </button>
                  ))}
                {users.length===0 && (
                  <div className="px-3 py-2 text-white/60 text-sm">Пользователи не найдены</div>
                )}
              </div>
              <Input value={text} onChange={(e)=>setText(e.target.value)} placeholder="Текст достижения" className="bg-[#0f0f14] border-[#2a2a35] text-white" />
            </div>
            <DialogFooter>
              <Button
                disabled={saving}
                onClick={async ()=>{
                  if (!userId.trim() || !text.trim()) { toast({ title: 'Заполните все поля' } as any); return }
                  setSaving(true)
                  try {
                    const ua = await apiFetch<any>(`/api/admin/users/${encodeURIComponent(userId.trim())}/achievements`, { method: 'POST', body: JSON.stringify({ text: text.trim() }) })
                    setRows((prev)=>[
                      { id: ua.id, earnedAt: new Date().toISOString(), user: { id: userId.trim(), email: userSearch }, achievement: { id: ua.achievementId || 'new', title: 'Достижение', description: text.trim() } } as any,
                      ...prev
                    ])
                    setUserId(''); setUserSearch(''); setText(''); setOpen(false)
                    toast({ title: 'Выдано' } as any)
                  } catch(e:any) {
                    toast({ title: 'Ошибка', description: e?.message || 'Не удалось выдать', variant: 'destructive' as any })
                  } finally { setSaving(false) }
                }}
                className="bg-[var(--color-accent-warm)] hover:bg-[var(--color-accent-warm-hover)] text-black"
              >
                Сохранить
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      
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
                    <div className="w-8 h-8 rounded-full bg-[var(--color-accent-warm)] text-black flex items-center justify-center font-semibold">
                      {(r.user.fullName || r.user.email || "?").charAt(0)}
                    </div>
                    <div>
                      <div className="text-white font-medium">{r.user.fullName || r.user.email}</div>
                      <div className="text-white/60 text-sm">{r.achievement.title}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-white/50 text-xs">{new Date(r.earnedAt).toLocaleString("ru-RU")}</div>
                    <Button
                      onClick={async ()=>{
                        const ok = await confirm({ title: 'Отозвать награду?', description: 'Действие необратимо. Пользователь потеряет эту награду.', confirmText: 'Отозвать', cancelText: 'Отмена', variant: 'danger' })
                        if (!ok) return
                        try {
                          await apiFetch(`/api/admin/user-achievements/${r.id}`, { method: 'DELETE' })
                          setRows((prev)=>prev.filter(x=>x.id!==r.id))
                        } catch(e:any) {
                        }
                      }}
                      className="bg-[#ef4444] hover:bg-[#dc2626] text-white h-8 px-3"
                    >
                      Отозвать
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      
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
                    <div className="w-8 h-8 rounded-full bg-[var(--color-accent-warm)] text-black flex items-center justify-center font-semibold">
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
