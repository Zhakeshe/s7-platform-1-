"use client"
import { useEffect, useMemo, useState } from "react"
import { ArrowLeft, BadgeInfo, LogIn, ShoppingCart, CheckCircle, ShieldAlert, Copy } from "lucide-react"
import { useAuth } from "@/components/auth/auth-context"
import { useConfirm } from "@/components/ui/confirm"
import { toast } from "@/hooks/use-toast"
import { apiFetch } from "@/lib/api"

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
  const confirm = useConfirm()
  const [activeModuleId, setActiveModuleId] = useState<number>(course?.modules?.[0]?.id ?? 0)
  const [isPurchasing, setIsPurchasing] = useState(false)
  const [showPayment, setShowPayment] = useState(false)
  const [canAccess, setCanAccess] = useState<boolean>(false)
  const [quizCourse, setQuizCourse] = useState<Array<any>>([])
  const [quizModule, setQuizModule] = useState<Array<any>>([])
  const [loadingQuiz, setLoadingQuiz] = useState(false)

  const isFree = !course?.price || course.price === 0

  // Derive access from backend endpoint
  useEffect(() => {
    let ignore = false
    if (!course?.id) return
    apiFetch<{ hasAccess: boolean; modules?: any }>(`/courses/${course.id}`)
      .then((data) => {
        if (ignore) return
        setCanAccess(isFree ? true : Boolean(data.hasAccess))
      })
      .catch(() => setCanAccess(isFree))
    return () => {
      ignore = true
    }
  }, [course?.id, isFree])

  // Load course-level quiz
  useEffect(() => {
    if (!course?.id) return
    setLoadingQuiz(true)
    apiFetch<Array<any>>(`/courses/${course.id}/questions`)
      .then((list) => setQuizCourse(list || []))
      .catch(() => setQuizCourse([]))
      .finally(() => setLoadingQuiz(false))
  }, [course?.id])

  // Load module-level quiz when module changes
  useEffect(() => {
    if (!course?.id || !activeModuleId) { setQuizModule([]); return }
    setLoadingQuiz(true)
    const params = new URLSearchParams({ moduleId: String(activeModuleId) })
    apiFetch<Array<any>>(`/courses/${course.id}/questions?${params.toString()}`)
      .then((list) => setQuizModule(list || []))
      .catch(() => setQuizModule([]))
      .finally(() => setLoadingQuiz(false))
  }, [course?.id, activeModuleId])

  const markAnswer = (setter: (v: any) => void, list: any[], questionId: string, selectedIndex: number, isCorrect: boolean, correctIndex: number) => {
    setter(list.map((q) => (q.id === questionId ? { ...q, selectedIndex, isCorrect, correctIndex } : q)))
  }

  const answerQuestion = async (questionId: string, selectedIndex: number, scope: 'course' | 'module') => {
    try {
      const res = await apiFetch<{ isCorrect: boolean; correctIndex: number }>(`/courses/questions/${questionId}/answer`, {
        method: "POST",
        body: JSON.stringify({ selectedIndex })
      })
      if (scope === 'course') {
        markAnswer(setQuizCourse, quizCourse, questionId, selectedIndex, res.isCorrect, res.correctIndex)
      } else {
        markAnswer(setQuizModule, quizModule, questionId, selectedIndex, res.isCorrect, res.correctIndex)
      }
      toast({ title: res.isCorrect ? 'Верно' : 'Неверно', description: res.isCorrect ? 'Отличная работа!' : 'Правильный вариант подсвечен' })
    } catch (e: any) {
      toast({ title: 'Ошибка', description: e?.message || 'Не удалось отправить ответ', variant: 'destructive' as any })
    }
  }

  const handlePurchase = () => {
    if (!user || !course) { toast({ title: "Войдите", description: "Войдите чтобы купить курс" }); return }
    setShowPayment(true)
  }

  const confirmPaymentSent = async () => {
    if (!user || !course) return
    const ok = await confirm({ title: 'Вы точно отправили оплату?', confirmText: 'Отправил', cancelText: 'Отмена' })
    if (!ok) return
    setIsPurchasing(true)
    try {
      const senderCode = (user.id || '').slice(-8)
      await apiFetch(`/courses/${course.id}/purchase`, {
        method: "POST",
        body: JSON.stringify({
          amount: course.price || 0,
          paymentMethod: "kaspi",
          payerFullName: user.fullName,
          senderCode,
        }),
      })
      toast({ title: "Заявка отправлена", description: "Как только оплата подтвердится, доступ будет открыт" })
    } catch (e: any) {
      toast({ title: "Ошибка", description: e?.message || "Не удалось отправить заявку", variant: "destructive" as any })
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

          {/* Quiz Section */}
          <div className="bg-[#16161c] border border-[#636370]/20 rounded-2xl p-4 text-white">
            <div className="text-white font-medium mb-2">Проверка знаний</div>
            {loadingQuiz && <div className="text-white/60 text-sm">Загрузка вопросов...</div>}
            {!loadingQuiz && (quizCourse.length + quizModule.length === 0) && (
              <div className="text-white/60 text-sm">Вопросов пока нет</div>
            )}

            {/* Course-level questions */}
            {quizCourse.length > 0 && (
              <div className="space-y-3">
                <div className="text-xs text-white/60">Вопросы по курсу</div>
                {quizCourse.map((q) => (
                  <div key={q.id} className="rounded-lg border border-[#2a2a35] p-3">
                    <div className="text-sm mb-2">{q.text}</div>
                    <div className="space-y-2">
                      {(q.options || []).map((opt: string, idx: number) => {
                        const isSelected = q.selectedIndex === idx
                        const isCorrect = q.correctIndex === idx
                        const showCorrect = typeof q.correctIndex === 'number'
                        return (
                          <button
                            key={idx}
                            onClick={() => answerQuestion(q.id, idx, 'course')}
                            disabled={showCorrect}
                            className={`w-full text-left px-3 py-2 rounded-md border transition-colors ${
                              showCorrect
                                ? isCorrect
                                  ? 'bg-[#22c55e]/15 border-[#22c55e]/40 text-white'
                                  : isSelected
                                    ? 'bg-[#ef4444]/15 border-[#ef4444]/40 text-white'
                                    : 'bg-transparent border-[#2a2a35] text-white/80'
                                : isSelected
                                  ? 'bg-[#1b1b22] border-[#2a2a35] text-white'
                                  : 'bg-transparent border-[#2a2a35] text-white/80 hover:bg-[#1b1b22]'
                            }`}
                          >
                            {opt}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Module-level questions */}
            {quizModule.length > 0 && (
              <div className="space-y-3 mt-4">
                <div className="text-xs text-white/60">Вопросы по модулю</div>
                {quizModule.map((q) => (
                  <div key={q.id} className="rounded-lg border border-[#2a2a35] p-3">
                    <div className="text-sm mb-2">{q.text}</div>
                    <div className="space-y-2">
                      {(q.options || []).map((opt: string, idx: number) => {
                        const isSelected = q.selectedIndex === idx
                        const isCorrect = q.correctIndex === idx
                        const showCorrect = typeof q.correctIndex === 'number'
                        return (
                          <button
                            key={idx}
                            onClick={() => answerQuestion(q.id, idx, 'module')}
                            disabled={showCorrect}
                            className={`w-full text-left px-3 py-2 rounded-md border transition-colors ${
                              showCorrect
                                ? isCorrect
                                  ? 'bg-[#22c55e]/15 border-[#22c55e]/40 text-white'
                                  : isSelected
                                    ? 'bg-[#ef4444]/15 border-[#ef4444]/40 text-white'
                                    : 'bg-transparent border-[#2a2a35] text-white/80'
                                : isSelected
                                  ? 'bg-[#1b1b22] border-[#2a2a35] text-white'
                                  : 'bg-transparent border-[#2a2a35] text-white/80 hover:bg-[#1b1b22]'
                            }`}
                          >
                            {opt}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* Payment Modal */}
      {showPayment && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-fade-in">
          <div className="w-full max-w-md bg-[#16161c] border border-[#2a2a35] rounded-2xl p-6 text-white animate-slide-up">
            <div className="text-lg font-medium mb-2">Оплата через Kaspi</div>
            <div className="text-white/80 text-sm mb-4 space-y-1">
              <div>Сумма: <b>{course?.price?.toLocaleString()} ₸</b></div>
              <div>Номер Kaspi: <b>+7-700-000-00-00</b></div>
              <div className="mt-2">В комментарии укажите:</div>
              <div className="bg-[#0f0f14] border border-[#2a2a35] rounded-lg p-3 text-xs flex items-center justify-between">
                <div className="space-y-1">
                  <div>ФИО: <b>{user?.fullName ?? "Ваше ФИО"}</b></div>
                  <div>КОД: <b>{(user?.id ?? "код").slice(-8)}</b></div>
                </div>
                <button
                  onClick={() => navigator.clipboard.writeText(`${user?.fullName ?? ''} ${(user?.id ?? '').slice(-8)}`.trim())}
                  className="text-[#a0a0b0] hover:text-white"
                  aria-label="Скопировать"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="space-y-2 text-xs bg-[#0f0f14] border border-[#2a2a35] rounded-lg p-3">
              <div className="flex items-center gap-2 text-[#f59e0b]">
                <ShieldAlert className="w-4 h-4" />
                Подтверждаем вручную. Доступ откроется в течение 2 часов после проверки.
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button onClick={() => setShowPayment(false)} className="rounded-lg bg-[#2a2a35] hover:bg-[#333344] py-2">Отмена</button>
              <button onClick={confirmPaymentSent} disabled={isPurchasing} className="rounded-lg bg-[#00a3ff] hover:bg-[#0088cc] text-black font-medium py-2 disabled:opacity-60">
                {isPurchasing ? 'Отправляем...' : 'Я отправил'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
