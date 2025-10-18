"use client"
import { useEffect, useState } from "react"
import AdminSidebar from "@/components/admin/admin-sidebar"
import { Menu } from "lucide-react"
import AdminAuthGate from "@/components/admin/auth-gate"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [currentDate, setCurrentDate] = useState("")
  const [navOpen, setNavOpen] = useState(false)

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
        <AdminSidebar open={navOpen} onClose={() => setNavOpen(false)} />
        <div className={`flex-1 transition-[margin-left] duration-200 ${navOpen ? 'md:ml-64' : 'md:ml-0'}`}>
          <header className="sticky top-0 z-10 bg-transparent">
            <div className="flex justify-between items-center p-6">
              <button
                onClick={() => setNavOpen((v) => !v)}
                className="md:hidden inline-flex items-center gap-2 text-white/80 hover:text-white px-3 py-2 rounded-lg bg-[#16161c] border border-[#2a2a35]"
                aria-label="Меню"
              >
                <Menu className="w-5 h-5" />
                Меню
              </button>
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
