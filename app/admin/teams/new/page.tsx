"use client"
import { useEffect, useState } from "react"
import { ArrowUpRight } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { apiFetch } from "@/lib/api"
import { toast } from "@/hooks/use-toast"

export default function Page() {
  const router = useRouter()
  const search = useSearchParams()
  const editId = search.get("edit")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const isEdit = Boolean(editId)

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

  const saveTeam = async () => {
    if (!title.trim()) return
    try {
      if (isEdit) {
        await apiFetch(`/api/admin/teams/${editId}`, { method: "PUT", body: JSON.stringify({ name: title.trim(), description: description.trim() || undefined }) })
      } else {
        await apiFetch(`/api/admin/teams`, { method: "POST", body: JSON.stringify({ name: title.trim(), description: description.trim() || undefined }) })
      }
      toast({ title: isEdit ? "Сохранено" : "Создано" })
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

        <button
          onClick={saveTeam}
          className="w-full rounded-2xl bg-[#00a3ff] hover:bg-[#0088cc] text-black font-medium py-4 flex items-center justify-between px-4 transition-colors"
        >
          <span>{isEdit ? "Сохранить" : "Добавить"}</span>
          <ArrowUpRight className="w-5 h-5" />
        </button>
      </div>
    </main>
  )
}
