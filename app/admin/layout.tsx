"use client"
import { useEffect, useState } from "react"
import AdminSidebar from "@/components/admin/admin-sidebar"
import AdminAuthGate from "@/components/admin/auth-gate"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [currentDate, setCurrentDate] = useState("")

  useEffect(() => {
    const now = new Date()
    const months = [
      "Января",
      "Февраля",
      "Марта",
      "Апреля",
      "Мая",
      "Июня",
      "Июля",
      "Августа",
      "Сентября",
      "Октября",
      "Ноября",
      "Декабря",
    ]
    const day = now.getDate()
    const month = months[now.getMonth()]
    const year = now.getFullYear()
    setCurrentDate(`${day} ${month} ${year}`)
  }, [])

  return (
    <AdminAuthGate>
      <div className="flex min-h-screen bg-[#0b0b10]">
        <AdminSidebar />
        <div className="flex-1 md:ml-64">
          <header className="sticky top-0 z-10 bg-transparent">
            <div className="flex justify-end p-6">
              <div className="text-right">
                <div className="text-white text-xl font-semibold">{currentDate.split(" ").slice(0, 2).join(" ")}</div>
                <div className="text-white/60 text-xs">{currentDate.split(" ").slice(2).join(" ")}</div>
              </div>
            </div>
          </header>
          {children}
        </div>
      </div>
    </AdminAuthGate>
  )
}
