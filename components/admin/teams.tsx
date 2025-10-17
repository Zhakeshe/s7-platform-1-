"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowUpRight, Trash2 } from "lucide-react"
import { apiFetch } from "@/lib/api"
import { toast } from "@/hooks/use-toast"
import { useConfirm } from "@/components/ui/confirm"

interface TeamItem { id: string; name: string; description?: string; membersCount?: number }

function TeamRow({ id, name, membersCount, onDeleted }: { id: string; name: string; membersCount?: number; onDeleted: (id: string) => void }) {
  const confirm = useConfirm()
  const remove = async () => {
    const ok = await confirm({ title: 'Удалить команду?', confirmText: 'Удалить', cancelText: 'Отмена', variant: 'danger' })
    if (!ok) return
    try {
      await apiFetch(`/api/admin/teams/${id}`, { method: "DELETE" })
      toast({ title: "Удалено" })
      onDeleted(id)
    } catch (e: any) {
      toast({ title: "Ошибка", description: e?.message || "Не удалось удалить", variant: "destructive" as any })
    }
  }
  return (
    <div className="bg-[#16161c] border border-[#636370]/20 rounded-2xl p-4 text-white relative animate-slide-up">
      <div className="absolute top-4 right-4 text-white/70 flex items-center gap-2">
        <button onClick={remove} className="p-1 rounded hover:bg-[#2a2a35]" title="Удалить">
          <Trash2 className="w-5 h-5 text-red-400" />
        </button>
        <ArrowUpRight className="w-6 h-6" />
      </div>
      <div className="flex items-center gap-3 mb-1">
        <div className="text-white text-lg font-medium">{name}</div>
        <span className="inline-block bg-[#00a3ff] text-black text-xs font-medium px-3 py-1 rounded-full">Участников: {membersCount ?? 0}</span>
      </div>
      <div className="mt-2">
        <Link href={`/admin/teams/${id}`} className="text-xs bg-[#2a2a35] text-white/80 rounded-full px-3 py-1 hover:bg-[#333344]">
          Управлять
        </Link>
      </div>
    </div>
  )
}

export default function AdminTeams() {
  const [teams, setTeams] = useState<TeamItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiFetch<any[]>("/api/admin/teams")
      .then((list) => setTeams((list || []).map((t) => ({ id: t.id, name: t.name, membersCount: (t as any)._count?.memberships || t.membersCount }))))
      .catch(() => setTeams([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <main className="flex-1 p-6 md:p-8 overflow-y-auto animate-slide-up">
      <h2 className="text-white text-xl font-medium mb-6">Команды</h2>
      <div className="space-y-4">
        {loading ? (
          <div className="text-white/60">Загрузка...</div>
        ) : teams.length === 0 ? (
          <div className="text-white/60">Нет команд</div>
        ) : (
          teams.map((t) => (
            <TeamRow key={t.id} id={t.id} name={t.name} membersCount={t.membersCount} onDeleted={(id) => setTeams((prev) => prev.filter((x) => x.id !== id))} />
          ))
        )}
        <Link href="/admin/teams/new" className="block">
          <div className="bg-[#16161c] border border-[#636370]/20 rounded-2xl p-6 text-white relative hover:bg-[#1b1b22] transition-colors">
            <div className="absolute top-4 right-4 text-white/70">
              <ArrowUpRight className="w-6 h-6" />
            </div>
            <div className="text-white text-lg font-medium">Добавить</div>
          </div>
        </Link>
      </div>
    </main>
  )
}
