"use client"
import Link from "next/link"
import { useEffect, useState } from "react"
import { ArrowUpRight, Eye } from "lucide-react"

function BSCard({ title, tag, views }: { title: string; tag: string; views: number }) {
  return (
    <div className="bg-[#16161c] border border-[#2a2a35] rounded-2xl p-4 text-white min-h-[170px] relative">
      <div className="flex items-center justify-between text-white/70 mb-6">
        <div className="inline-flex items-center gap-2 text-xs">
          <Eye className="w-4 h-4" /> {views}
        </div>
        <ArrowUpRight className="w-5 h-5" />
      </div>
      <div className="text-xl font-semibold mb-6">{title}</div>
      <span className="inline-block bg-[#00a3ff] text-white text-xs font-medium px-3 py-1 rounded-full">
        {tag}
      </span>
    </div>
  )
}

interface SavedBS {
  id: string
  title: string
  tags: string[]
  views: number
}

export default function Page() {
  const [saved, setSaved] = useState<SavedBS[]>([])

  useEffect(() => {
    try {
      const raw = localStorage.getItem("s7_admin_bytesize")
      setSaved(raw ? JSON.parse(raw) : [])
    } catch {
      setSaved([])
    }
  }, [])

  return (
    <main className="flex-1 p-6 md:p-8 overflow-y-auto animate-slide-up">
      <h2 className="text-white text-xl font-medium mb-6">Byte Size</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl">
        <Link href="/admin/bytesize/new" className="block">
          <BSCard title="Добавить" tag="Robotics" views={990} />
        </Link>
        <BSCard title="Основы WRO" tag="Robotics" views={990} />
        {saved.map((v) => (
          <BSCard key={v.id} title={v.title} tag={v.tags?.[0] || "Robotics"} views={v.views ?? 0} />
        ))}
      </div>
    </main>
  )
}
