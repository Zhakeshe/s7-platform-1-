"use client"
import { useEffect, useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"
import { apiFetch } from "@/lib/api"

interface Question {
  id: string
  text: string
  options: string[]
  moduleId?: string
  lessonId?: string
}

export default function CourseQuizAdminPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const courseId = useMemo(() => String(params.id), [params.id])

  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)

  const [text, setText] = useState("")
  const [options, setOptions] = useState<string[]>(["", ""]) // at least two
  const [correctIndex, setCorrectIndex] = useState<number>(0)
  const [moduleId, setModuleId] = useState<string>("")
  const [lessonId, setLessonId] = useState<string>("")

  const load = () => {
    setLoading(true)
    apiFetch<Question[]>(`/courses/${courseId}/questions`)
      .then((list) => setQuestions(list || []))
      .catch(() => setQuestions([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [courseId])

  const addOption = () => setOptions((prev) => [...prev, ""]) 
  const updateOption = (i: number, v: string) => setOptions((prev) => prev.map((o, idx) => (idx === i ? v : o)))
  const removeOption = (i: number) => {
    if (options.length <= 2) return
    const next = options.filter((_, idx) => idx !== i)
    setOptions(next)
    if (correctIndex >= next.length) setCorrectIndex(next.length - 1)
  }

  const create = async () => {
    try {
      if (!text.trim()) { toast({ title: "Введите вопрос" }); return }
      const clean = options.map((o) => o.trim()).filter(Boolean)
      if (clean.length < 2) { toast({ title: "Минимум 2 варианта" }); return }
      if (correctIndex < 0 || correctIndex >= clean.length) { toast({ title: "Укажите правильный ответ" }); return }
      await apiFetch(`/courses/${courseId}/questions`, {
        method: "POST",
        body: JSON.stringify({ text: text.trim(), options: clean, correctIndex, moduleId: moduleId || undefined, lessonId: lessonId || undefined }),
      })
      toast({ title: "Вопрос создан" })
      setText("")
      setOptions(["", ""]) 
      setCorrectIndex(0)
      setModuleId("")
      setLessonId("")
      load()
    } catch (e: any) {
      toast({ title: "Ошибка", description: e?.message || "Не удалось создать", variant: "destructive" as any })
    }
  }

  return (
    <main className="flex-1 p-6 md:p-8 overflow-y-auto animate-slide-up">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-white text-xl font-medium">Вопросы для курса</h2>
        <button onClick={() => router.push("/admin/courses")} className="text-white/70 hover:text-white">Назад</button>
      </div>

      {/* Create form */}
      <div className="bg-[#16161c] border border-[#2a2a35] rounded-2xl p-5 text-white space-y-4">
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Текст вопроса" className="w-full bg-[#0f0f14] border border-[#2a2a35] rounded-lg px-3 py-2 outline-none" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <input value={moduleId} onChange={(e) => setModuleId(e.target.value)} placeholder="moduleId (необязательно)" className="bg-[#0f0f14] border border-[#2a2a35] rounded-lg px-3 py-2 outline-none" />
          <input value={lessonId} onChange={(e) => setLessonId(e.target.value)} placeholder="lessonId (необязательно)" className="bg-[#0f0f14] border border-[#2a2a35] rounded-lg px-3 py-2 outline-none" />
        </div>
        <div className="space-y-2">
          <div className="text-white/80 text-sm">Варианты</div>
          {options.map((opt, i) => (
            <div key={i} className="flex items-center gap-2">
              <input value={opt} onChange={(e) => updateOption(i, e.target.value)} placeholder={`Вариант ${i + 1}`} className="flex-1 bg-[#0f0f14] border border-[#2a2a35] rounded-lg px-3 py-2 outline-none" />
              <label className="text-xs text-white/70 flex items-center gap-1">
                <input type="radio" name="correct" checked={correctIndex === i} onChange={() => setCorrectIndex(i)} /> Правильный
              </label>
              {options.length > 2 && (
                <button onClick={() => removeOption(i)} className="text-white/60 hover:text-white text-sm">Удалить</button>
              )}
            </div>
          ))}
          <button onClick={addOption} className="text-xs bg-[#2a2a35] hover:bg-[#333344] rounded-full px-3 py-1">Добавить вариант</button>
        </div>
        <div className="flex justify-end">
          <button onClick={create} className="rounded-lg bg-[#00a3ff] hover:bg-[#0088cc] text-black font-medium px-4 py-2">Создать</button>
        </div>
      </div>

      {/* List */}
      <div className="mt-6 space-y-3">
        {loading ? (
          <div className="text-white/60">Загрузка...</div>
        ) : (questions || []).length === 0 ? (
          <div className="text-white/60">Вопросов пока нет</div>
        ) : (
          questions.map((q) => (
            <div key={q.id} className="bg-[#16161c] border border-[#2a2a35] rounded-2xl p-4 text-white">
              <div className="font-medium mb-2">{q.text}</div>
              <ul className="list-disc list-inside text-white/80 text-sm">
                {q.options.map((o, i) => (
                  <li key={i}>{o}</li>
                ))}
              </ul>
              <div className="text-xs text-white/50 mt-2">moduleId: {q.moduleId || '—'}; lessonId: {q.lessonId || '—'}</div>
            </div>
          ))
        )}
      </div>
    </main>
  )
}
