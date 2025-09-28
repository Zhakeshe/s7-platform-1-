"use client"
import { useEffect, useState } from "react"
import { ArrowUpRight } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { apiFetch } from "@/lib/api"
import { useConfirm } from "@/components/ui/confirm-dialog"
import { toast } from "@/hooks/use-toast"

export default function Page() {
  const router = useRouter()
  const search = useSearchParams()
  const editId = search.get("edit")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const isEdit = Boolean(editId)
  const confirm = useConfirm()

  useEffect(() => {
    if (!editId) return
    // Load team for edit (fetch from admin list and find by id)
    apiFetch<any[]>("/api/admin/teams")
      .then((list) => {
        const t = (list || []).find((x) => x.id === editId)
        if (t) {
          setTitle(t.name || "")
          setDescription(t.description || "")
        }
      })
      .catch(() => {})
  }, [editId])

  // Restore draft if creating new
  useEffect(() => {
    if (editId) return
    try {
      const raw = localStorage.getItem('s7_admin_team_draft')
      if (!raw) return
      const d = JSON.parse(raw)
      if (d.title) setTitle(d.title)
      if (d.description) setDescription(d.description)
    } catch {}
  }, [editId])

  const saveTeam = async () => {
    if (!title.trim()) return
    try {
      const ok = await confirm({ title: isEdit ? 'Сохранить изменения?' : 'Создать команду?', confirmText: isEdit ? 'Сохранить' : 'Создать', cancelText: 'Отмена' })
      if (!ok) return
      if (isEdit) {
        await apiFetch(`/api/admin/teams/${editId}`, { method: "PUT", body: JSON.stringify({ name: title.trim(), description: description.trim() || undefined }) })
      } else {
        await apiFetch(`/api/admin/teams`, { method: "POST", body: JSON.stringify({ name: title.trim(), description: description.trim() || undefined }) })
      }
      toast({ title: isEdit ? "Сохранено" : "Создано" })
      try { localStorage.removeItem('s7_admin_team_draft') } catch {}
      router.push("/admin/teams")
    } catch (e: any) {
      toast({ title: "Ошибка", description: e?.message || "Не удалось сохранить", variant: "destructive" as any })
    }
  }

  return (
    <main className="flex-1 p-6 md:p-8 overflow-y-auto animate-slide-up">
      <h2 className="text-white text-xl font-medium mb-6">{isEdit ? "Редактировать команду" : "Добавить команду"}</h2>

      <div className="max-w-3xl space-y-5">
        <div className="bg-[#16161c] border border-[#2a2a35] rounded-2xl px-4 py-3 text-white">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Название команды"
            className="w-full bg-transparent outline-none"
          />
        </div>

        <div className="bg-[#16161c] border border-[#2a2a35] rounded-2xl px-4 py-3 text-white">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Описание"
            className="w-full bg-transparent outline-none min-h-28"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => {
              try { localStorage.setItem('s7_admin_team_draft', JSON.stringify({ title, description })) } catch {}
              toast({ title: 'Черновик сохранён' })
            }}
            className="rounded-2xl bg-[#2a2a35] hover:bg-[#333344] text-white font-medium py-4 transition-colors"
          >
            Сохранить черновик
          </button>
          <button
            onClick={() => { saveTeam() }}
            className="rounded-2xl bg-[#00a3ff] hover:bg-[#0088cc] text-black font-medium py-4 flex items-center justify-between px-4 transition-colors"
          >
            <span>{isEdit ? "Сохранить" : "Добавить"}</span>
          </button>
        </div>
      </div>
    </main>
  )
}
