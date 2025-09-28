"use client"
import { useEffect, useState } from "react"
import { ArrowUpRight, Upload, Image } from "lucide-react"
import { useRouter } from "next/navigation"
import { apiFetch, getTokens } from "@/lib/api"
import { toast } from "@/hooks/use-toast"
import { useConfirm } from "@/components/ui/confirm"

export default function Page() {
  const router = useRouter()
  const confirm = useConfirm()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const presets = ["Robotics", "Coding", "AI", "Design", "Education", "News", "Tips"]
  const [category, setCategory] = useState<string[]>(["Robotics"]) // визуальные теги
  const [newTag, setNewTag] = useState("")
  const [videoUrl, setVideoUrl] = useState<string>("")
  const [coverUrl, setCoverUrl] = useState<string>("")
  const [uploading, setUploading] = useState(false)

  // Restore draft on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem('s7_admin_bytesize_draft')
      if (!raw) return
      const d = JSON.parse(raw)
      if (d.title) setTitle(d.title)
      if (d.description) setDescription(d.description)
      if (Array.isArray(d.category)) setCategory(d.category)
      if (d.videoUrl) setVideoUrl(d.videoUrl)
      if (d.coverUrl) setCoverUrl(d.coverUrl)
    } catch {}
  }, [])

  const uploadMedia = async (file: File): Promise<string> => {
    const tokens = getTokens()
    const fd = new FormData()
    fd.append("file", file)
    const res = await fetch("/uploads/media", {
      method: "POST",
      headers: tokens?.accessToken ? { authorization: `Bearer ${tokens.accessToken}` } : undefined,
      body: fd,
    })
    if (!res.ok) throw new Error(await res.text().catch(() => "Upload failed"))
    const data = await res.json()
    return data.url as string
  }

  return (
    <main className="flex-1 p-6 md:p-8 overflow-y-auto animate-slide-up">
      <h2 className="text-white text-xl font-medium mb-6">Byte Size</h2>

      <div className="max-w-3xl space-y-6">
        {/* Upload area */}
        <div className="rounded-3xl border-2 border-[#2a2a35] p-3">
          <div className="rounded-2xl bg-[#0f0f14] border border-[#2a2a35] min-h-[320px] flex items-center justify-center text-white relative overflow-hidden">
            {videoUrl ? (
              <video src={videoUrl} controls className="w-full h-full object-cover" />
            ) : (
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-[#2a2a35] flex items-center justify-center mx-auto mb-3">
                  <Upload className="w-7 h-7 text-[#a0a0b0]" />
                </div>
                <div className="text-lg font-medium">Загрузите видео</div>
                <div className="text-white/60 text-sm">Видео до 1 минуты</div>
              </div>
            )}
          </div>
          <div className="flex gap-2 mt-3">
            <input type="file" accept="video/*" onChange={async (e)=>{
              const f = e.target.files?.[0]; if(!f) return; setUploading(true);
              try { const url = await uploadMedia(f); setVideoUrl(url); toast({ title: "Видео загружено" }); } catch(e:any){ toast({ title: "Ошибка", description: e?.message||"Не удалось загрузить", variant: "destructive" as any }) } finally { setUploading(false) }
            }} className="text-white" />
            <label className="inline-flex items-center gap-2 px-3 py-2 bg-[#16161c] border border-[#2a2a35] rounded-lg text-white cursor-pointer">
              <Image className="w-4 h-4" /> Обложка
              <input type="file" accept="image/*" hidden onChange={async (e)=>{
                const f = e.target.files?.[0]; if(!f) return; setUploading(true);
                try { const url = await uploadMedia(f); setCoverUrl(url); toast({ title: "Обложка загружена" }); } catch(e:any){ toast({ title: "Ошибка", description: e?.message||"Не удалось загрузить", variant: "destructive" as any }) } finally { setUploading(false) }
              }} />
            </label>
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

        {/* Description */}
        <div className="bg-[#16161c] border border-[#2a2a35] rounded-2xl px-4 py-3 text-white">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Описание (необязательно)"
            className="w-full bg-transparent outline-none text-white min-h-28"
          />
        </div>

        {/* Categories */}
        <div className="bg-[#16161c] border border-[#2a2a35] rounded-2xl px-4 py-4 text-white">
          <div className="text-white/80 mb-2">Категории</div>
          <div className="flex flex-wrap gap-2 mb-2">
            {presets.map((t) => {
              const active = category.includes(t)
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setCategory((prev)=> active ? prev.filter(x=>x!==t) : [...prev, t])}
                  className={`text-xs font-medium px-3 py-1 rounded-full border ${active ? 'bg-[#00a3ff] text-white border-[#00a3ff]' : 'bg-transparent text-white/80 border-[#2a2a35]'}`}
                >
                  {t}
                </button>
              )
            })}
          </div>
          {category.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {category.map((t) => (
                <span key={t} className="inline-flex items-center gap-2 text-xs bg-[#00a3ff] text-white rounded-full px-3 py-1">
                  {t}
                  <button onClick={()=>setCategory((prev)=>prev.filter(x=>x!==t))} className="text-white/80 hover:text-white">×</button>
                </span>
              ))}
            </div>
          )}
          <div className="flex items-center gap-2">
            <input value={newTag} onChange={(e)=>setNewTag(e.target.value)} placeholder="Новая категория" className="flex-1 bg-[#0f0f14] border border-[#2a2a35] rounded-lg px-3 py-2 outline-none" />
            <button type="button" onClick={()=>{ const v = newTag.trim(); if(!v) return; if(!category.includes(v)) setCategory(prev=>[...prev, v]); setNewTag('') }} className="px-3 py-2 rounded-lg bg-[#2a2a35] hover:bg-[#333344]">Добавить</button>
          </div>
        </div>

        {/* Draft + Publish */}
        <div className="pt-2">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                try { localStorage.setItem('s7_admin_bytesize_draft', JSON.stringify({ title, description, category, videoUrl, coverUrl })) } catch {}
                toast({ title: 'Черновик сохранён' })
              }}
              className="rounded-2xl bg-[#2a2a35] hover:bg-[#333344] text-white font-medium py-4 transition-colors"
            >
              Сохранить черновик
            </button>
            <button
              disabled={uploading || !videoUrl || !title.trim()}
              onClick={async () => {
                const ok = await confirm({ title: 'Опубликовать видео?', confirmText: 'Опубликовать', cancelText: 'Отмена' })
                if (!ok) return
                try {
                  await apiFetch("/api/admin/bytesize", { method: "POST", body: JSON.stringify({ title: title.trim(), description: description.trim() || undefined, videoUrl, coverImageUrl: coverUrl || undefined, tags: category }) })
                  toast({ title: "Видео опубликовано" })
                  try { localStorage.removeItem('s7_admin_bytesize_draft') } catch {}
                  router.push("/admin/bytesize")
                } catch(e:any) {
                  toast({ title: "Ошибка", description: e?.message || "Не удалось опубликовать", variant: "destructive" as any })
                }
              }}
              className="rounded-2xl bg-[#00a3ff] hover:bg-[#0088cc] disabled:opacity-60 text-black font-medium py-4 flex items-center justify-center gap-2 transition-colors"
            >
              Опубликовать
              <ArrowUpRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
