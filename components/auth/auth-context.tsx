"use client"
import React, { createContext, useContext, useEffect, useMemo, useState } from "react"
import {
  User,
  Session,
  listUsers,
  loginUser,
  registerUser,
  readSession,
  writeSession,
  updateUserProfile,
  migrateAdminKeys,
} from "@/lib/s7db"

interface AuthContextValue {
  user: User | null
  loading: boolean
  register: (email: string, password: string, remember?: boolean) => Promise<void>
  login: (email: string, password: string, remember?: boolean) => Promise<void>
  logout: () => void
  updateProfile: (patch: Partial<User>) => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    migrateAdminKeys()
    // Seed default admin if no users exist
    try {
      const all = listUsers()
      if (!all || all.length === 0) {
        // admin@s7.kz / admin123
        registerUser("admin@s7.kz", "admin123", "admin").then(() => {}).catch(() => {})
      }
    } catch {}

    const s = readSession()
    if (!s) { setLoading(false); return }
    const u = listUsers().find((x) => x.id === s.userId) || null
    setUser(u)
    setLoading(false)
  }, [])

  const registerFn = async (email: string, password: string, remember = true) => {
    const isSpecialAdmin = email.trim().toLowerCase() === 'ch.qynon@gmail.com'
    const role = isSpecialAdmin ? 'admin' : 'user'
    const u = await registerUser(email, password, role)
    setUser(u)
    const s: Session = { userId: u.id, createdAt: Date.now(), remember }
    writeSession(s)
  }

  const loginFn = async (email: string, password: string, remember = true) => {
    let u = await loginUser(email, password)
    // Promote to admin if special email logs in and not already admin
    if (u.email?.toLowerCase() === 'ch.qynon@gmail.com' && u.role !== 'admin') {
      u = updateUserProfile(u.id, { role: 'admin' })
    }
    setUser(u)
    const s: Session = { userId: u.id, createdAt: Date.now(), remember }
    writeSession(s)
  }

  const logoutFn = () => {
    setUser(null)
    writeSession(null)
  }

  const updateProfileFn = (patch: Partial<User>) => {
    if (!user) return
    const next = updateUserProfile(user.id, patch)
    setUser(next)
  }

  const value = useMemo<AuthContextValue>(() => ({ user, loading, register: registerFn, login: loginFn, logout: logoutFn, updateProfile: updateProfileFn }), [user, loading])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
