"use client"
import { useEffect, useMemo, useState } from "react"
import { ArrowLeft, BadgeInfo, LogIn, ShoppingCart, CheckCircle, ShieldAlert } from "lucide-react"
import { useAuth } from "@/components/auth/auth-context"
import { createPurchase, hasCourseAccess, listPurchases, autoActivateEligiblePurchases } from "@/lib/s7db"
import { toast } from "@/hooks/use-toast"

export interface CourseLesson {
  id: number
  title: string
  time?: string
  // Optional rich fields (may be present for published courses from S7DB)
  videoName?: string
  videoMediaId?: string
  slides?: string[]
  slideMediaIds?: string[]
  presentationFileName?: string
  presentationMediaId?: string
  content?: string
}

export interface CourseModule {
  id: number
  title: string
  lessons: CourseLesson[]
}

export interface CourseDetails {
  id: string
  title: string
  difficulty: string
  author: string
  price?: number
  modules: CourseModule[]
}

export default function CourseDetailsTab({
  course,
  onBack,
  onOpenLesson,
}: {
  course: CourseDetails | null
  onBack: () => void
  onOpenLesson?: (moduleId: number, lessonId: number) => void
}) {
  const { user } = useAuth()
  const [activeModuleId, setActiveModuleId] = useState<number>(course?.modules?.[0]?.id ?? 0)
  const [isPurchasing, setIsPurchasing] = useState(false)
  const [showPayment, setShowPayment] = useState(false)

  const isFree = !course?.price || course.price === 0
  const canAccess = useMemo(() => {
    if (!course) return false
    if (isFree) return true
    if (!user) return false
    return hasCourseAccess(user.id, course.id)
  }, [course, user])

  useEffect(() => {
    autoActivateEligiblePurchases()
  }, [])

  const handlePurchase = () => {
    if (!user || !course) { toast({ title: "Войдите", description: "Войдите чтобы купить курс" }); return }
    setShowPayment(true)
  }

  const confirmPaymentSent = () => {
    if (!user || !course) return
    setIsPurchasing(true)
    try {
      createPurchase(user.id, course.id, course.price || 0)
      toast({ title: "Заявка на оплату принята", description: "Курс будет доступен в течение 2 часов" })
    } finally {
      setIsPurchasing(false)
      setShowPayment(false)
    }
  }

  if (!course) {
    return (
      <div className="flex-1 p-8">
        <div className="bg-[#16161c] border border-[#636370]/20 rounded-2xl p-6 text-white flex items-center gap-3">
          <BadgeInfo className="w-5 h-5 text-[#a0a0b0]" />
          <span>Курс не найден. Вернитесь назад и выберите курс.</span>
        </div>
      </div>
    )
  }

  const activeModule = course.modules.find((m) => m.id === activeModuleId) || course.modules[0]

  return (
    <main className="flex-1 p-6 md:p-8 overflow-y-auto animate-slide-up">
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2 text-white">
        <button
          onClick={onBack}
          className="text-white/80 hover:text-white transition-colors flex items-center gap-2"
          aria-label="Назад к курсам"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="hidden sm:inline">Курсы</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-6">
        {/* Left: Course summary and modules */}
        <section className="space-y-6">
          {/* Summary card */}
          <div className="bg-[#16161c] border border-[#636370]/20 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-medium">{course.title}</h2>
                <div className="mt-3 flex items-center gap-2">
                  <span className="inline-block bg-[#f59e0b] text-black text-xs font-medium px-3 py-1 rounded-full">
                    {course.difficulty}
                  </span>
                  <span className="text-white/70 text-sm">{course.author}</span>
                </div>
              </div>
              <div className="text-right">
                {course.price && course.price > 0 ? (
                  <div className="text-2xl font-bold text-[#00a3ff]">{course.price.toLocaleString()} ₸</div>
                ) : (
                  <div className="text-xl font-medium text-[#22c55e]">Бесплатно</div>
                )}
              </div>
            </div>
            
            {/* Purchase Button */}
            {!isFree && !canAccess && (
              <button
                onClick={handlePurchase}
                disabled={isPurchasing || !user}
                className="w-full bg-[#00a3ff] hover:bg-[#0088cc] text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-5 h-5" />
                {isPurchasing ? 'Покупаем...' : 'Купить курс'}
              </button>
            )}
            {canAccess && !isFree && (
              <div className="bg-[#22c55e]/10 border border-[#22c55e]/20 rounded-lg p-4 text-center">
                <div className="text-[#22c55e] font-medium flex items-center justify-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Доступ к курсу открыт
                </div>
              </div>
            )}
          </div>

          {/* Modules list */}
          <div className="space-y-3">
            {course.modules.map((mod) => (
              <button
                key={mod.id}
                onClick={() => canAccess ? setActiveModuleId(mod.id) : setShowPayment(true)}
                disabled={!canAccess}
                className={`w-full flex items-center justify-between rounded-2xl px-4 py-4 border transition-all duration-200 text-white ${
                  activeModuleId === mod.id && canAccess
                    ? "bg-[#1b1b22] border-[#636370]/30"
                    : "bg-[#16161c] border-[#636370]/20 hover:bg-[#1b1b22]"
                } ${!canAccess ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-[#00a3ff] text-black flex items-center justify-center font-semibold">
                    {mod.id}
                  </div>
                  <div className="text-left">
                    <div className="font-medium">{mod.title}</div>
                  </div>
                </div>
                <LogIn className="w-5 h-5 text-[#a0a0b0]" />
              </button>
            ))}
          </div>
        </section>

        {/* Right: Lessons of active module */}
        <aside className="space-y-4">
          <div className="bg-[#16161c] border border-[#636370]/20 rounded-2xl p-4 text-white">
            <div className="rounded-full bg-[#1b1b22] px-4 py-2 text-white/80 inline-block">
              {activeModule?.title}
            </div>
          </div>

          <div className="space-y-3">
            {activeModule?.lessons.map((lesson) => (
              <button
                key={lesson.id}
                onClick={() => canAccess ? onOpenLesson?.(activeModule.id, lesson.id) : setShowPayment(true)}
                disabled={!canAccess}
                className={`w-full flex items-center justify-between bg-[#16161c] border border-[#636370]/20 rounded-full px-4 py-3 text-white hover:bg-[#1b1b22] transition-colors ${!canAccess ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#00a3ff] text-black flex items-center justify-center font-semibold">
                    {lesson.id}
                  </div>
                  <div>
                    <div className="font-medium">{lesson.title}</div>
                  </div>
                </div>
                <div className="text-white/60 text-sm">{lesson.time ?? "10:21"}</div>
              </button>
            ))}
          </div>
        </aside>
      </div>

      {/* Payment Modal */}
      {showPayment && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="w-full max-w-md bg-[#16161c] border border-[#2a2a35] rounded-2xl p-6 text-white">
            <div className="text-lg font-medium mb-2">Оплата через Kaspi</div>
            <div className="text-white/70 text-sm mb-4">
              Переведите сумму {course?.price?.toLocaleString()} ₸ на Kaspi <b>+7-700-000-00-00</b>.
              В комментарии укажите: <b>{user ? user.id : 'ваш ID'}</b>.
            </div>
            <div className="space-y-2 text-xs bg-[#0f0f14] border border-[#2a2a35] rounded-lg p-3">
              <div className="flex items-center gap-2 text-[#f59e0b]">
                <ShieldAlert className="w-4 h-4" />
                Подтверждение оплаты вручную. Доступ будет активирован в течение 2 часов автоматически.
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button onClick={() => setShowPayment(false)} className="rounded-lg bg-[#2a2a35] hover:bg-[#333344] py-2">Отмена</button>
              <button onClick={confirmPaymentSent} className="rounded-lg bg-[#00a3ff] hover:bg-[#0088cc] text-black font-medium py-2">Я отправил</button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
