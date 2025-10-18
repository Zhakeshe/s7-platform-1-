"use client"
import { useEffect, useRef, useState } from "react"
import { Heart, Share2 } from "lucide-react"
import { apiFetch } from "@/lib/api"
import { useAuth } from "@/components/auth/auth-context"
import { toast } from "@/hooks/use-toast"

interface ReelItem {
  id: string
  title: string
  description?: string
  videoUrl: string
  coverImageUrl?: string
  likesCount: number
  likedByMe: boolean
}

export default function ByteSizeTab() {
  const { user } = useAuth()
  const [items, setItems] = useState<ReelItem[]>([])
  const [loading, setLoading] = useState(true)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({})
  const viewedRef = useRef<Set<string>>(new Set())

  const share = async (it: ReelItem) => {
    try {
      const url = it.videoUrl?.startsWith('http') ? it.videoUrl : new URL(it.videoUrl, window.location.origin).href
      if (navigator.share) {
        await navigator.share({ title: it.title, text: it.description || it.title, url })
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(url)
        toast({ title: 'Ссылка скопирована' })
      }
    } catch {}
  }

  useEffect(() => {
    apiFetch<ReelItem[]>("/bytesize")
      .then((list) => setItems(list || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false))
  }, [])

  // Autoplay/pause current reel
  useEffect(() => {
    if (!containerRef.current) return
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = (entry.target as HTMLElement).dataset.reelId
          if (!id) return
          const video = videoRefs.current[id]
          if (!video) return
          if (entry.isIntersecting && entry.intersectionRatio > 0.6) {
            video.play().catch(() => {})
            if (!viewedRef.current.has(id)) {
              viewedRef.current.add(id)
              fetch(`/bytesize/${id}/view`, { method: 'POST' }).catch(() => {})
            }
          } else {
            video.pause()
          }
        })
      },
      { root: containerRef.current, threshold: [0.6] }
    )
    const nodes = containerRef.current.querySelectorAll("[data-reel-id]")
    nodes.forEach((n) => observer.observe(n))
    return () => observer.disconnect()
  }, [items.length])

  const toggleLike = async (id: string) => {
    if (!user) { toast({ title: "Войдите", description: "Требуется авторизация" }); return }
    try {
      const res = await apiFetch<{ liked: boolean; likesCount: number }>(`/bytesize/${id}/like`, { method: "POST" })
      setItems((prev) => prev.map((it) => (it.id === id ? { ...it, likedByMe: res.liked, likesCount: res.likesCount } : it)))
    } catch (e: any) {
      toast({ title: "Ошибка", description: e?.message || "Не удалось поставить лайк", variant: "destructive" as any })
    }
  }

  if (loading) {
    return <div className="flex-1 p-8 text-white/70">Загрузка...</div>
  }

  if (items.length === 0) {
    return (
      <div className="flex-1 p-8">
        <div className="text-center text-white/70 bg-[#16161c] border border-[#636370]/20 rounded-2xl p-10">
          Пока нет видео
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 h-[calc(100vh-120px)]" ref={containerRef}>
      <div className="h-full overflow-y-auto snap-y snap-mandatory no-scrollbar">
        {items.map((it) => (
          <div key={it.id} data-reel-id={it.id} className="snap-start h-[calc(100vh-120px)] flex items-center justify-center">
            <div className="relative w-full max-w-[420px] aspect-[9/16] bg-black rounded-xl overflow-hidden border border-[#2a2a35]">
              <video
                ref={(el) => { videoRefs.current[it.id] = el }}
                src={it.videoUrl}
                poster={it.coverImageUrl}
                controls={false}
                playsInline
                className="w-full h-full object-cover"
                preload="metadata"
                muted
              />
              <div className="absolute left-0 right-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                <div className="text-white font-medium text-sm line-clamp-2">{it.title}</div>
                {it.description && <div className="text-white/80 text-xs line-clamp-2">{it.description}</div>}
              </div>
              <button
                onClick={() => toggleLike(it.id)}
                className={`absolute right-3 bottom-16 w-12 h-12 rounded-full flex items-center justify-center transition ${it.likedByMe ? 'bg-red-600/80' : 'bg-white/10 hover:bg-white/20'}`}
                aria-label="Лайк"
              >
                <Heart className={`w-6 h-6 ${it.likedByMe ? 'text-white fill-white' : 'text-white'}`} />
              </button>
              <button
                onClick={() => share(it)}
                className="absolute right-3 bottom-28 w-12 h-12 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 transition"
                aria-label="Поделиться"
              >
                <Share2 className="w-6 h-6 text-white" />
              </button>
              <div className="absolute right-3 bottom-8 text-white text-xs opacity-90">{it.likesCount}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
