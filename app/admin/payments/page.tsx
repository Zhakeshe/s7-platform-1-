"use client"
import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Check, X } from "lucide-react"
import { listPurchases, listCourses, getUserById, setPurchaseStatus, enrollUser, type Purchase } from "@/lib/s7db"
import { toast } from "@/hooks/use-toast"

export default function Page() {
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [courses, setCourses] = useState(() => listCourses())

  const refresh = () => {
    setPurchases(listPurchases().sort((a,b)=> b.createdAt - a.createdAt))
  }

  useEffect(() => { refresh() }, [])

  const confirm = (id: string) => {
    const p = purchases.find((x) => x.id === id)
    if (!p) return
    setPurchaseStatus(id, "paid")
    enrollUser(p.userId, p.courseId)
    toast({ title: "Платеж подтвержден", description: "Доступ к курсу выдан" })
    refresh()
  }

  const reject = (id: string) => {
    setPurchaseStatus(id, "canceled")
    toast({ title: "Платеж отклонен" })
    refresh()
  }

  const titleForCourse = (courseId: string) => courses.find(c => c.id === courseId)?.title || courseId

  return (
    <main className="flex-1 p-6 md:p-8 overflow-y-auto animate-slide-up">
      <h2 className="text-white text-xl font-medium mb-6">Платежи</h2>

      <div className="space-y-3 max-w-4xl">
        {purchases.map((p) => {
          const user = getUserById(p.userId)
          return (
            <div key={p.id} className="flex items-center justify-between rounded-2xl bg-[#16161c] border border-[#2a2a35] px-4 py-3 text-white">
              <div>
                <div className="font-medium">{user?.fullName || user?.email}</div>
                <div className="text-white/70 text-sm">{titleForCourse(p.courseId)} • {p.amount.toLocaleString()} ₸ • {new Date(p.createdAt).toLocaleString("ru-RU")}</div>
              </div>
              <div className="flex items-center gap-2">
                {p.status === "pending" ? (
                  <>
                    <button onClick={() => confirm(p.id)} className="rounded-full bg-[#22c55e] text-black px-3 py-2 inline-flex items-center gap-1">
                      <Check className="w-4 h-4" /> Подтвердить
                    </button>
                    <button onClick={() => reject(p.id)} className="rounded-full bg-[#ef4444] text-white px-3 py-2 inline-flex items-center gap-1">
                      <X className="w-4 h-4" /> Отклонить
                    </button>
                  </>
                ) : (
                  <div className={`rounded-full px-3 py-1 text-sm ${p.status === 'paid' ? 'bg-[#22c55e]/20 text-[#22c55e]' : 'bg-[#ef4444]/20 text-[#ef4444]'}`}>
                    {p.status === 'paid' ? 'Оплачен' : 'Отклонён'}
                  </div>
                )}
              </div>
            </div>
          )
        })}
        {purchases.length === 0 && (
          <div className="text-white/70">Платежей пока нет</div>
        )}
      </div>
    </main>
  )
}
