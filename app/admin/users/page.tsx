"use client"
import { ArrowUpRight } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { listUsers, type User } from "@/lib/s7db"

export default function Page() {
  const [users, setUsers] = useState<User[]>([])

  useEffect(() => {
    const all = listUsers()
    const nonAdmins = all.filter((u) => u.role !== "admin")
    setUsers(nonAdmins.length > 0 ? nonAdmins : all)
  }, [])

  return (
    <main className="flex-1 p-6 md:p-8 overflow-y-auto animate-slide-up">
      {/* Header row */}
      <div className="flex items-center justify-between mb-6 gap-4 max-w-5xl">
        <h2 className="text-white text-xl font-medium">Пользователи</h2>
        <input
          placeholder="Поиск"
          className="w-60 rounded-full bg-[#16161c] border border-[#2a2a35] px-4 py-2 text-white/80 outline-none focus:border-[#00a3ff]"
        />
      </div>

      <div className="space-y-3 max-w-3xl">
        {users.map((u) => (
          <Link key={u.id} href={`/admin/users/${u.id}`} className="block">
            <div className="flex items-center justify-between rounded-full bg-[#16161c] border border-[#2a2a35] px-2 py-2 text-white hover:bg-[#1b1b22] transition-colors">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center justify-center rounded-full bg-[#1b1b22] border border-[#2a2a35] w-10 h-8 text-sm text-white/80">
                  {u.id.slice(-2)}
                </span>
                <span className="text-white font-medium">{u.fullName || u.email}</span>
              </div>
              <ArrowUpRight className="w-5 h-5 text-[#a0a0b0]" />
            </div>
          </Link>
        ))}
      </div>
    </main>
  )
}
