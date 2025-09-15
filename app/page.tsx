"use client"
import SocialPanel from "@/components/social-panel"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Image from "next/image"
import { useState } from "react"
import Dashboard from "./dashboard/page"
import Notification from "@/components/notification"

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [notification, setNotification] = useState<{
    type: "success" | "error"
    message: string
    isVisible: boolean
  }>({
    type: "success",
    message: "",
    isVisible: false,
  })

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message, isVisible: true })
  }

  const hideNotification = () => {
    setNotification((prev) => ({ ...prev, isVisible: false }))
  }

  const handleLogin = () => {
    if (email === "1" && password === "1") {
      showNotification("success", "Успешный вход в систему!")
      setTimeout(() => {
        setIsLoggedIn(true)
      }, 1500)
    } else {
      showNotification("error", "Неправильный логин или пароль")
    }
  }

  if (isLoggedIn) {
    return <Dashboard />
  }

  return (
    <div className="min-h-screen bg-[#0e0e12] flex flex-col items-center justify-center px-4 relative">
      <Notification
        type={notification.type}
        message={notification.message}
        isVisible={notification.isVisible}
        onClose={hideNotification}
      />

      {/* Logo */}
      <div className="mb-16 animate-slide-up" style={{ animationDelay: "200ms" }}>
        <Image src="/logo-s7.png" alt="S7 Robotics Logo" width={80} height={80} className="mx-auto" />
      </div>

      {/* Form Container */}
      <div
        className="w-full max-w-sm bg-[#16161c]/30 border border-[#636370]/20 rounded-2xl p-8 backdrop-blur-sm transition-all duration-500 ease-in-out hover:bg-[#16161c]/40 hover:border-[#636370]/30 animate-slide-up"
        style={{ animationDelay: "400ms" }}
      >
        <h1 className="text-white text-3xl font-medium text-center mb-8 transition-all duration-300">
          {isLogin ? "Вход" : "Регистрация"}
        </h1>

        <div className="space-y-4">
          {/* Name Field */}
          <div
            className={`transition-all duration-500 ease-in-out overflow-hidden ${!isLogin ? "max-h-20 opacity-100 translate-y-0" : "max-h-0 opacity-0 -translate-y-4"}`}
          >
            <div className="relative pb-4 animate-slide-up" style={{ animationDelay: "600ms" }}>
              <Input
                type="text"
                placeholder="Имя"
                className="bg-transparent border-0 border-b border-[#636370] rounded-none px-0 pb-2 text-white placeholder:text-[#a0a0b0] focus:border-[#00a3ff] focus:ring-0 focus-visible:ring-0 transition-all duration-300 hover:border-[#a0a0b0]"
              />
              <i className="bi bi-person absolute right-0 top-2 text-lg text-[#a0a0b0] transition-colors duration-300"></i>
            </div>
          </div>

          {/* Email Input */}
          <div className="relative animate-slide-up" style={{ animationDelay: "700ms" }}>
            <Input
              type="email"
              placeholder="Почта"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-transparent border-0 border-b border-[#636370] rounded-none px-0 pb-2 text-white placeholder:text-[#a0a0b0] focus:border-[#00a3ff] focus:ring-0 focus-visible:ring-0 transition-all duration-300 hover:border-[#a0a0b0]"
            />
            <i className="bi bi-envelope absolute right-0 top-2 text-lg text-[#a0a0b0] transition-colors duration-300"></i>
          </div>

          {/* Password Input */}
          <div className="relative animate-slide-up" style={{ animationDelay: "800ms" }}>
            <Input
              type="password"
              placeholder="Пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-transparent border-0 border-b border-[#636370] rounded-none px-0 pb-2 text-white placeholder:text-[#a0a0b0] focus:border-[#00a3ff] focus:ring-0 focus-visible:ring-0 transition-all duration-300 hover:border-[#a0a0b0]"
            />
            <i className="bi bi-lock absolute right-0 top-2 text-lg text-[#a0a0b0] transition-colors duration-300"></i>
          </div>
        </div>

        {/* Button */}
        <Button
          onClick={handleLogin}
          className="w-full bg-[#00a3ff] hover:bg-[#0088cc] text-white font-medium py-3 rounded-full mt-8 transition-all duration-300 transform hover:scale-102 hover:shadow-lg hover:shadow-[#00a3ff]/20 active:scale-95 animate-slide-up"
          style={{ animationDelay: "900ms" }}
        >
          {isLogin ? "Войти" : "Зарегистрироваться"}
        </Button>

        <div className="text-center mt-6 animate-slide-up" style={{ animationDelay: "1000ms" }}>
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-[#a0a0b0] text-sm hover:text-white transition-all duration-300 transform hover:scale-101"
          >
            {isLogin ? "Нет аккаунта? Зарегистрируйтесь" : "Войти"}
          </button>
        </div>
      </div>

      <SocialPanel />

      {/* User Agreement */}
      <div className="flex items-center space-x-2 mt-8 animate-slide-up" style={{ animationDelay: "1400ms" }}>
        <i className="bi bi-exclamation-circle w-5 h-5 text-white"></i>
        <span className="text-[#a0a0b0] text-sm">Пользовательские соглашения</span>
      </div>

      {/* Version Info */}
      <div className="absolute bottom-6 right-6 text-right animate-slide-up" style={{ animationDelay: "1600ms" }}>
        <div className="text-white font-medium">Обновление</div>
        <div className="text-white text-2xl font-bold">1.0</div>
        <div className="text-[#a0a0b0] text-sm">Новые плюшки</div>
      </div>

      {/* Copyright */}
      <div
        className="absolute bottom-4 left-1/2 transform -translate-x-1/2 animate-slide-up"
        style={{ animationDelay: "1800ms" }}
      >
        <div className="text-[#636370] text-xs text-center">
          <div>Version 0.1</div>
          <div>Все права защищены ОПТ "S7 Robotics"</div>
        </div>
      </div>
    </div>
  )
}
