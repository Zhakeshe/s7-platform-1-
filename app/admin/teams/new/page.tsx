"use client"
import { useEffect, useState } from "react"
import { ArrowUpRight } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { listTeams, saveTeams } from "@/lib/s7db"

export default function Page() {
  const router = useRouter()
  const search = useSearchParams()
  const editId = search.get("edit")
  const [title, setTitle] = useState("")
  const [city, setCity] = useState("")
  const [contact, setContact] = useState("")
  const [positions, setPositions] = useState<string[]>(["Инженер", "Капитан", "Инженер", "Инженер", "Инженер", "Капитан", "Капитан", "Капитан", "Капитан"]) // для вида как на скрине
  const [selected, setSelected] = useState<Record<string, boolean>>({})
  const isEdit = Boolean(editId)

  const toggle = (p: string) => setSelected((s) => ({ ...s, [p]: !s[p] }))

  useEffect(() => {
    if (!editId) return
    try {
      // Legacy admin store
      const raw = localStorage.getItem("s7_admin_teams")
      const list = raw ? JSON.parse(raw) : []
      const found = list.find((t: any) => String(t.id) === String(editId))
      if (found) {
        setTitle(found.title || "")
        setCity(found.city || "")
        setContact(found.contact || "")
        // mark selected positions from saved
        const sel: Record<string, boolean> = {}
        ;(found.positions || []).forEach((p: string, i: number) => (sel[p + i] = true))
        setSelected(sel)
      }
    } catch {}
  }, [editId])

  const saveTeam = () => {
    const item = {
      id: isEdit ? String(editId) : `${Date.now()}`,
      title,
      city,
      positions: Object.keys(selected).filter((k) => selected[k]).map((k) => k.replace(/\d+$/, "")),
      contact,
    }
    try {
      // Legacy storage for Admin UI
      const raw = localStorage.getItem("s7_admin_teams")
      const list = raw ? JSON.parse(raw) : []
      const idx = list.findIndex((t: any) => String(t.id) === String(item.id))
      if (idx >= 0) list[idx] = item
      else list.push(item)
      localStorage.setItem("s7_admin_teams", JSON.stringify(list))

      // Sync to S7DB
      try {
        const db = listTeams()
        const i = db.findIndex((t) => String(t.id) === String(item.id))
        if (i >= 0) db[i] = { ...db[i], ...item }
        else db.push({ ...item, createdAt: Date.now() } as any)
        saveTeams(db as any)
      } catch {}
    } catch {}
    router.push("/admin/teams")
  }

  return (
    <main className="flex-1 p-6 md:p-8 overflow-y-auto animate-slide-up">
      <h2 className="text-white text-xl font-medium mb-6">Добавить команду</h2>

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
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Город"
            className="w-full bg-transparent outline-none"
          />
        </div>

        <div className="bg-[#16161c] border border-[#2a2a35] rounded-2xl p-4 text-white">
          <div className="text-white/90 font-medium mb-3">Позиции</div>
          <div className="flex items-center gap-3 flex-wrap">
            {positions.map((p, i) => (
              <button
                key={`${p}-${i}`}
                onClick={() => toggle(p + i)}
                className={`inline-block text-xs font-medium px-3 py-1 rounded-full border ${
                  selected[p + i] ? "bg-[#00a3ff] text-white border-[#00a3ff]" : "bg-transparent text-white/80 border-[#2a2a35]"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-[#16161c] border border-[#2a2a35] rounded-2xl px-4 py-3 text-white">
          <input
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder="Контакт"
            className="w-full bg-transparent outline-none"
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
