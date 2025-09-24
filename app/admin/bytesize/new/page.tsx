"use client"
import { useState } from "react"
import { ArrowUpRight, Upload } from "lucide-react"
import { useRouter } from "next/navigation"

export default function Page() {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState<string[]>(["Robotics"]) // макетные теги

  return (
    <main className="flex-1 p-6 md:p-8 overflow-y-auto animate-slide-up">
      <h2 className="text-white text-xl font-medium mb-6">Byte Size</h2>

      <div className="max-w-3xl space-y-6">
        {/* Upload area */}
        <div className="rounded-3xl border-2 border-[#2a2a35] p-3">
          <div className="rounded-2xl bg-[#0f0f14] border border-[#2a2a35] min-h-[320px] flex items-center justify-center text-white">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-[#2a2a35] flex items-center justify-center mx-auto mb-3">
                <Upload className="w-7 h-7 text-[#a0a0b0]" />
              </div>
              <div className="text-lg font-medium">Загрузите видео</div>
              <div className="text-white/60 text-sm">Видео до 1 минуты</div>
            </div>
          </div>
        </div>

        {/* Title field */}
        <div className="bg-[#16161c] border border-[#2a2a35] rounded-2xl px-4 py-3 text-white">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Название видео"
            className="w-full bg-transparent outline-none text-white"
          />
        </div>

        {/* Category */}
        <div className="bg-[#16161c] border border-[#2a2a35] rounded-2xl px-4 py-4 text-white">
          <div className="text-white/80 mb-3">Категория</div>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="inline-block bg-[#00a3ff] text-white text-xs font-medium px-3 py-1 rounded-full">Robotics</span>
            <span className="inline-block bg-[#00a3ff] text-white text-xs font-medium px-3 py-1 rounded-full">Robotics</span>
          </div>
        </div>

        {/* Publish button */}
        <div className="pt-2">
          <button
            onClick={() => {
              const item = { id: `${Date.now()}`, title: title || "Без названия", tags: category, views: 0 }
              try {
                const raw = localStorage.getItem("s7_admin_bytesize")
                const list = raw ? JSON.parse(raw) : []
                list.push(item)
                localStorage.setItem("s7_admin_bytesize", JSON.stringify(list))
              } catch {}
              router.push("/admin/bytesize")
            }}
            className="w-full rounded-2xl bg-[#00a3ff] hover:bg-[#0088cc] text-black font-medium py-4 flex items-center justify-center gap-2 transition-colors"
          >
            Опубликовать
            <ArrowUpRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </main>
  )
}
