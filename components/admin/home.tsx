"use client"
import Link from "next/link"
import { Plus, User, Clock, CheckCircle } from "lucide-react"
import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth/auth-context"
import { listUsers, listCourses, listPurchases, getUserById, type Purchase } from "@/lib/s7db"

interface DashboardStats {
  totalUsers: number
  totalCourses: number
  pendingPayments: number
  completedPayments: number
  newUsersThisWeek: number
  totalRevenue: number
}

function Card({ children, add, href, loading }: { children: React.ReactNode; add?: boolean; href?: string; loading?: boolean }) {
  return (
    <div className="relative bg-[#16161c] border border-[#636370]/20 rounded-2xl p-6 text-white min-h-[120px]">
      {loading ? (
        <div className="animate-pulse">
          <div className="h-4 bg-gray-600 rounded w-3/4 mb-2"></div>
          <div className="h-8 bg-gray-600 rounded w-1/2"></div>
        </div>
      ) : (
        children
      )}
      {add && !loading && (
        href ? (
          <Link href={href} className="absolute bottom-4 right-4 w-9 h-9 rounded-lg bg-[#00a3ff] text-black flex items-center justify-center shadow hover:bg-[#0088cc]">
            <Plus className="w-5 h-5" />
          </Link>
        ) : (
          <button className="absolute bottom-4 right-4 w-9 h-9 rounded-lg bg-[#00a3ff] text-black flex items-center justify-center shadow">
            <Plus className="w-5 h-5" />
          </button>
        )
      )}
    </div>
  )
}

export default function AdminHome() {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [pendingPayments, setPendingPayments] = useState<Purchase[]>([])

  useEffect(() => {
    // compute from local S7DB
    const users = listUsers()
    const courses = listCourses()
    const purchases = listPurchases()
    const pending = purchases.filter((p) => p.status === "pending")
    const completed = purchases.filter((p) => p.status === "paid")
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
    const newUsers = users.filter((u) => u.createdAt >= weekAgo).length
    const totalRevenue = completed.reduce((sum, p) => sum + (p.amount || 0), 0)

    setStats({
      totalUsers: users.length,
      totalCourses: courses.length,
      pendingPayments: pending.length,
      completedPayments: completed.length,
      newUsersThisWeek: newUsers,
      totalRevenue,
    })
    setPendingPayments(pending.slice(0, 5))
    setLoading(false)
  }, [])

  return (
    <main className="flex-1 p-6 md:p-8 overflow-y-auto animate-slide-up">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Добро пожаловать, {user?.fullName || user?.email}</h1>
        <p className="text-white/60">Обзор платформы S7 Robotics</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
        <Card loading={loading}>
          {!loading && (
            <>
              <div className="text-lg font-semibold mb-1">Пользователи</div>
              <div className="text-[#22c55e] text-sm mb-2">+{stats?.newUsersThisWeek || 0} За неделю</div>
              <div className="flex items-center gap-2 text-3xl font-bold">
                {stats?.totalUsers || 0} <User className="w-6 h-6" />
              </div>
            </>
          )}
        </Card>

        <Card loading={loading}>
          {!loading && (
            <>
              <div className="text-lg font-semibold mb-1">Курсы</div>
              <div className="text-white/60 text-sm mb-2">всего</div>
              <div className="text-3xl font-bold">{stats?.totalCourses || 0}</div>
            </>
          )}
        </Card>

        <Card loading={loading}>
          {!loading && (
            <>
              <div className="text-lg font-semibold mb-1">Платежи</div>
              <div className="flex items-center gap-2 text-sm mb-2">
                <Clock className="w-4 h-4 text-orange-400" />
                <span className="text-orange-400">{stats?.pendingPayments || 0} ожидание</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-green-400">{stats?.completedPayments || 0} завершено</span>
              </div>
            </>
          )}
        </Card>

        <Card loading={loading}>
          {!loading && (
            <>
              <div className="text-lg font-semibold mb-1">Доход</div>
              <div className="text-white/60 text-sm mb-2">всего</div>
              <div className="text-2xl font-bold">{(stats?.totalRevenue || 0).toLocaleString()} ₸</div>
            </>
          )}
        </Card>
      </div>

      {/* Management Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card add href="/admin/courses/new">
          <div className="text-lg font-semibold">Курсы</div>
          <div className="text-white/60 text-xs">создание и управление</div>
        </Card>
        
        <Card add href="/admin/users">
          <div className="text-lg font-semibold">Пользователи</div>
          <div className="text-white/60 text-xs">управление учетными записями</div>
        </Card>
        
        <Card add href="/admin/payments">
          <div className="text-lg font-semibold">Платежи</div>
          <div className="text-white/60 text-xs">проверка и подтверждение</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card add href="/admin/teams/new">
          <div className="text-lg font-semibold">Команды</div>
          <div className="text-white/60 text-xs">создание и управление</div>
        </Card>
        
        <Card add href="/admin/achievements">
          <div className="text-lg font-semibold">Достижения</div>
          <div className="text-white/60 text-xs">система наград</div>
        </Card>
      </div>

      {/* Quick Actions Section */}
      {pendingPayments.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-white mb-4">Ожидающие платежи</h2>
          <div className="bg-[#16161c] border border-[#636370]/20 rounded-2xl p-6">
            <div className="space-y-3">
              {pendingPayments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between bg-[#0f0f14] rounded-lg p-3">
                  <div className="flex items-center gap-3">
                    {(() => { const u = getUserById(payment.userId); return (
                      <div className="w-10 h-10 bg-[#00a3ff] rounded-full flex items-center justify-center text-black font-bold text-sm">
                        {(u?.fullName || u?.email || '?').charAt(0)}
                      </div>
                    ) })()}
                    <div>
                      <div className="text-white font-medium">{getUserById(payment.userId)?.fullName || getUserById(payment.userId)?.email}</div>
                      <div className="text-white/60 text-sm">Курс {payment.courseId} - {payment.amount.toLocaleString()} ₸</div>
                    </div>
                  </div>
                  <div className="text-[#00a3ff] text-sm">Ожидает подтверждения</div>
                </div>
              ))}
            </div>
            {pendingPayments.length >= 5 && (
              <div className="mt-4 text-center">
                <Link 
                  href="/admin/payments"
                  className="text-[#00a3ff] hover:text-[#0088cc] text-sm font-medium"
                >
                  Посмотреть все →
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  )
}
