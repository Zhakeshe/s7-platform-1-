"use client"
import Link from "next/link"
import { useEffect, useState } from "react"
import { ArrowUpRight } from "lucide-react"

function MCItem({
  title,
  badge,
  location,
  date,
  author,
  price,
}: {
  title: string
  badge: string
  location: string
  date: string
  author: string
  price: string
}) {
  return (
    <div className="bg-[#16161c] border border-[#636370]/20 rounded-2xl p-6 text-white relative">
      <div className="absolute top-4 right-4 text-white/70">
        <ArrowUpRight className="w-6 h-6" />
      </div>
      <div className="text-white text-lg font-medium mb-3">{title}</div>
      <span className="inline-block bg-[#00a3ff] text-white text-xs font-medium px-3 py-1 rounded-full mb-4">
        {badge}
      </span>
      <div className="text-[#a0a0b0] text-sm space-y-1">
        <div>Локация: {location}</div>
        <div>Дата: {date}</div>
        <div>Автор: {author}</div>
        <div>Стоимость участия: {price}</div>
      </div>
    </div>
  )
}

interface SavedMC {
  id: string
  title: string
  location: string
  date: string
  author: string
  price: number
  mode: string
}

export default function Page() {
  const [saved, setSaved] = useState<SavedMC[]>([])

  useEffect(() => {
    try {
      const raw = localStorage.getItem("s7_admin_masterclasses")
      setSaved(raw ? JSON.parse(raw) : [])
    } catch {
      setSaved([])
    }
  }, [])

  return (
    <main className="flex-1 p-6 md:p-8 overflow-y-auto animate-slide-up">
      <h2 className="text-white text-xl font-medium mb-6">Мастер-классы</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl">
        <MCItem
          title="Основы FIRST"
          badge="Оффлайн"
          location="NIS Aktau"
          date="27.09.2025"
          author="S7 Robotics"
          price="100T"
        />
        <MCItem
          title="Основы WRO"
          badge="Оффлайн"
          location="NIS Aktau"
          date="27.09.2025"
          author="S7 Robotics"
          price="100T"
        />

        {saved.map((it) => (
          <MCItem
            key={it.id}
            title={it.title}
            badge={it.mode}
            location={it.location}
            date={it.date}
            author={it.author}
            price={it.price > 0 ? `${it.price}T` : "Бесплатно"}
          />
        ))}

        <div className="bg-[#16161c] border border-[#636370]/20 rounded-2xl p-6 text-white relative">
          <div className="absolute top-4 right-4 text-white/70">
            <ArrowUpRight className="w-6 h-6" />
          </div>
          <div className="text-white text-lg font-medium mb-8">Добавить мастер класс</div>
          <div className="absolute bottom-4 right-4">
            <Link
              href="/admin/masterclass/new"
              className="text-xs bg-[#2a2a35] text-white/80 rounded-full px-3 py-1 hover:bg-[#333344]"
            >
              Редакт.
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
