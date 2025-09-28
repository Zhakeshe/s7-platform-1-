"use client"
import React, { createContext, useContext, useEffect, useMemo, useState } from "react"
import { apiFetch, clearTokens, getTokens, setTokens } from "@/lib/api"

// Keep a minimal User shape compatible with existing UI
export type Role = "user" | "admin"
export interface User {
  id: string
  email: string
  fullName?: string
  role: Role
  level?: number
  xp?: number
  // optional profile extras used across UI
  institution?: string
  primaryRole?: string
  age?: number
}

interface AuthContextValue {
  user: User | null
  loading: boolean
  register: (email: string, password: string, remember?: boolean) => Promise<void>
  login: (email: string, password: string, remember?: boolean) => Promise<void>
  logout: () => Promise<void>
  updateProfile: (patch: Partial<User> & { institution?: string; primaryRole?: string; age?: number }) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Restore session from tokens and fetch current user
    const tokens = getTokens()
    if (!tokens) { setLoading(false); return }
    apiFetch<{ id: string; email: string; role: "USER" | "ADMIN"; fullName?: string }>("/auth/me")
      .then((u) => setUser({
        id: u.id,
        email: u.email,
        fullName: u.fullName,
        role: u.role === "ADMIN" ? "admin" : "user",
        level: 1,
        xp: 0,
      }))
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  const registerFn = async (email: string, password: string, remember = true) => {
    // Backend handles hashing and role; use email as fallback fullName
    const body = { email, password, fullName: email }
    const data = await apiFetch<{ accessToken: string; refreshToken: string; user: { id: string; email: string; role: "USER" | "ADMIN"; fullName?: string } }>(
      "/auth/register",
      { method: "POST", body: JSON.stringify(body) }
    )
    setTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken })
    setUser({ id: data.user.id, email: data.user.email, fullName: data.user.fullName, role: data.user.role === "ADMIN" ? "admin" : "user", level: 1, xp: 0 })
  }

  const loginFn = async (email: string, password: string, remember = true) => {
    const body = { email, password }
    const data = await apiFetch<{ accessToken: string; refreshToken: string; user: { id: string; email: string; role: "USER" | "ADMIN"; fullName?: string } }>(
      "/auth/login",
      { method: "POST", body: JSON.stringify(body) }
    )
    setTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken })
    setUser({ id: data.user.id, email: data.user.email, fullName: data.user.fullName, role: data.user.role === "ADMIN" ? "admin" : "user", level: 1, xp: 0 })
  }

  const logoutFn = async () => {
    try {
      const t = getTokens()
      if (t?.refreshToken) {
        await fetch("/auth/logout", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ refreshToken: t.refreshToken }),
        }).catch(() => null)
      }
    } finally {
      setUser(null)
      clearTokens()
    }
  }

  const updateProfileFn = async (patch: Partial<User> & { institution?: string; primaryRole?: string; age?: number }) => {
    if (!user) return
    try {
      const body: any = {
        fullName: patch.fullName,
        educationalInstitution: patch.institution,
        primaryRole: patch.primaryRole,
        age: typeof patch.age === 'number' ? patch.age : undefined,
      }
      const updated = await apiFetch<{ id: string; email: string; role: "USER" | "ADMIN"; fullName?: string }>(
        "/auth/me",
        { method: "PUT", body: JSON.stringify(body) }
      )
      setUser({ ...user, fullName: updated.fullName ?? user.fullName })
    } catch {
      // keep silent for now; UI already shows toast on caller side
    }
  }

  const value = useMemo<AuthContextValue>(() => ({ user, loading, register: registerFn, login: loginFn, logout: logoutFn, updateProfile: updateProfileFn }), [user, loading])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
