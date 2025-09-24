"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"

interface SavedTeam {
  id: string
  title: string
  city: string
  positions: string[]
  contact?: string
}

function TeamRow({ title, city, editHref }: { title: string; city: string; editHref?: string }) {
  return (
    <div className="bg-[#16161c] border border-[#636370]/20 rounded-2xl p-4 text-white relative">
      <div className="absolute top-4 right-4 text-white/70">
        <ArrowUpRight className="w-6 h-6" />
      </div>
      <div className="flex items-center gap-3 mb-1">
        <div className="text-white text-lg font-medium">{title}</div>
        <span className="inline-block bg-[#00a3ff] text-white text-xs font-medium px-3 py-1 rounded-full">{city}</span>
      </div>
      <div className="text-[#a0a0b0] text-sm">Ментор: Имя Фамилия</div>
      <div className="text-[#a0a0b0] text-sm">Учебный центр / учреждение: Название</div>
      <div className="text-[#00a3ff] text-sm">Соревнование: FIRST LEGO LEAGUE CHALLENGE</div>
      <div className="text-[#a0a0b0] text-sm">Открытые позиции: Капитан, Инженер</div>
      {editHref && (
        <Link href={editHref} className="absolute bottom-3 right-4 text-xs bg-[#2a2a35] text-white/80 rounded-full px-3 py-1 hover:bg-[#333344]">
          Редакт.
        </Link>
      )}
    </div>
  )
}

export default function AdminTeams() {
  const [saved, setSaved] = useState<SavedTeam[]>([])

  useEffect(() => {
    try {
      const raw = localStorage.getItem("s7_admin_teams")
      setSaved(raw ? JSON.parse(raw) : [])
    } catch {
      setSaved([])
    }
  }, [])

  return (
    <main className="flex-1 p-6 md:p-8 overflow-y-auto animate-slide-up">
      <h2 className="text-white text-xl font-medium mb-6">Команды</h2>
      <div className="space-y-4">
        <TeamRow title="S7 Alpha" city="Актау" />
        <TeamRow title="S7 RobOcean" city="Актау" />
        {saved.map((t) => (
          <TeamRow key={t.id} title={t.title} city={t.city} editHref={`/admin/teams/new?edit=${encodeURIComponent(t.id)}`} />
        ))}
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
