"use client"
import { useState } from "react"
import { ArrowUpRight, LogIn } from "lucide-react"
import { useRouter } from "next/navigation"

export default function Page() {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [author, setAuthor] = useState("")
  const [description, setDescription] = useState("")
  const [free, setFree] = useState(true)
  const [price, setPrice] = useState(0)

  const publish = () => {
    const item = {
      id: `${Date.now()}`,
      title,
      author,
      description,
      mode: "Оффлайн",
      date: new Date().toLocaleDateString("ru-RU"),
      price: free ? 0 : price,
      location: "NIS Aktau",
    }
    try {
      const raw = localStorage.getItem("s7_admin_masterclasses")
      const list = raw ? JSON.parse(raw) : []
      list.push(item)
      localStorage.setItem("s7_admin_masterclasses", JSON.stringify(list))
    } catch {}
    router.push("/admin/masterclass")
  }

  return (
    <main className="flex-1 p-6 md:p-8 overflow-y-auto animate-slide-up">
      <h2 className="text-white text-xl font-medium mb-6">Мастер-классы</h2>

      <div className="max-w-2xl space-y-5">
        {/* Title Card */}
        <div className="bg-[#16161c] border border-[#636370]/20 rounded-2xl p-5 text-white">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Название"
            className="w-full bg-transparent outline-none text-2xl md:text-3xl font-semibold placeholder-white/40"
          />
          <div className="mt-3 flex items-center gap-3">
            <span className="inline-flex items-center text-xs font-medium px-3 py-1 rounded-full bg-[#f59e0b] text-black">
              фильтр
            </span>
            <input
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Имя автора"
              className="bg-[#0f0f14] border border-[#2a2a35] text-white/80 text-xs rounded-full px-3 py-1 outline-none"
            />
          </div>
        </div>

        {/* Step: Description */}
        <div className="flex items-center justify-between bg-[#16161c] border border-[#2a2a35] rounded-2xl px-4 py-3 text-white">
          <div className="flex items-center gap-3">
            <span className="w-7 h-7 rounded-full bg-[#2a2a35] text-white/80 flex items-center justify-center text-xs">1</span>
            <span className="font-medium">Описание</span>
          </div>
          <LogIn className="w-5 h-5 text-[#a0a0b0]" />
        </div>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={6}
          placeholder="Текст описания..."
          className="w-full bg-[#0f0f14] border border-[#2a2a35] rounded-2xl p-4 text-white outline-none"
        />

        {/* Publish Button */}
        <button onClick={publish} className="w-full rounded-2xl bg-[#00a3ff] hover:bg-[#0088cc] text-black font-medium py-4 flex items-center justify-center gap-2 transition-colors">
          Опубликовать
          <ArrowUpRight className="w-5 h-5" />
        </button>

        {/* Price toggle */}
        <div className="flex items-center gap-3">
          <span className="text-white/70">Цена</span>
          <div className="rounded-full border border-[#2a2a35] p-1 flex items-center bg-[#0f0f14]">
            <button
              onClick={() => setFree(false)}
              className={`px-4 py-1 rounded-full text-sm ${!free ? "bg-[#111118] text-white" : "text-white/70"}`}
            >
              Цена
            </button>
            <button
              onClick={() => setFree(true)}
              className={`px-4 py-1 rounded-full text-sm ${free ? "bg-white text-black" : "text-white/70"}`}
            >
              Бесплатно
            </button>
          </div>
        </div>
        {!free && (
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            placeholder="Введите цену"
            className="w-40 bg-[#0f0f14] border border-[#2a2a35] text-white rounded-lg px-3 py-2 outline-none"
          />
        )}
      </div>
    </main>
  )
}
