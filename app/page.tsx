"use client"
import SocialPanel from "@/components/social-panel"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Image from "next/image"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth/auth-context"
import { toast } from "@/hooks/use-toast"

export default function LoginPage() {
  const router = useRouter()
  const { login, register, updateProfile } = useAuth()
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [institution, setInstitution] = useState("")
  const [age, setAge] = useState("")
  const [primaryRole, setPrimaryRole] = useState("")

  const handleLogin = async () => {
    try {
      await login(email.trim(), password)
      toast({ title: "Вход выполнен", description: "Добро пожаловать!" })
      router.push("/dashboard")
    } catch (e: any) {
      toast({ title: "Ошибка входа", description: e?.message || "Проверьте почту и пароль", variant: "destructive" as any })
    }
  }

  const handleRegister = async () => {
    try {
      // basic validation
      if (!name.trim() || !age.trim() || !institution.trim() || !primaryRole.trim()) {
        toast({ title: "Заполните все поля", description: "Полное имя, Возраст, Учебное заведение и Роль обязательны", variant: "destructive" as any })
        return
      }
      const ageNum = parseInt(age.trim(), 10)
      if (isNaN(ageNum) || ageNum <= 0) {
        toast({ title: "Некорректный возраст", description: "Введите целое число", variant: "destructive" as any })
        return
      }

      await register(email.trim(), password)
      updateProfile({ fullName: name.trim(), institution: institution.trim(), age: ageNum, primaryRole: primaryRole.trim() })
      toast({ title: "Регистрация успешна", description: "Заполните профиль в разделе Профиль" })
      router.push("/dashboard")
    } catch (e: any) {
      toast({ title: "Ошибка регистрации", description: e?.message || "Попробуйте другой e-mail", variant: "destructive" as any })
    }
  }

  return (
    <div className="min-h-screen bg-[#0e0e12] flex flex-col items-center justify-center px-4 relative">
      {/* Notifications handled via Toaster */}

      {/* Logo */}
      <div className={`${isLogin ? "mb-12" : "mb-16"} animate-slide-up`} style={{ animationDelay: "200ms" }}>
        <Image src="/logo-s7.png" alt="S7 Robotics Logo" width={80} height={80} className="mx-auto" />
      </div>

      {/* Form Container */}
      <div
        className={`w-full max-w-sm bg-[#16161c]/30 border border-[#636370]/20 rounded-2xl ${isLogin ? "p-6" : "p-7"} backdrop-blur-sm transition-all duration-500 ease-in-out hover:bg-[#16161c]/40 hover:border-[#636370]/30 animate-slide-up`}
        style={{ animationDelay: "400ms" }}
      >
        <h1 className={`text-white text-3xl font-medium text-center ${isLogin ? "mb-6" : "mb-7"} transition-all duration-300`}>
          {isLogin ? "Вход" : "Регистрация"}
        </h1>

        <div>
          {/* Registration fields group (collapsible) */}
          <div className={`transition-all duration-500 ease-in-out overflow-hidden ${!isLogin ? "max-h-[500px] opacity-100 translate-y-0 mb-6" : "max-h-0 opacity-0 -translate-y-4 mb-0"}`}>
            <div className="space-y-6">
              <div className="relative animate-slide-up" style={{ animationDelay: "600ms" }}>
                <Input
                  type="text"
                  placeholder="Полное имя"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-transparent h-auto py-2.5 border-0 border-b border-[#636370] rounded-none px-0 pb-3 text-white placeholder:text-[#a0a0b0] focus:border-[#00a3ff] focus:ring-0 focus-visible:ring-0 transition-all duration-300 hover:border-[#a0a0b0]"
                />
                <i className="bi bi-person absolute right-0 top-1/2 -translate-y-1/2 text-lg text-[#a0a0b0] transition-colors duration-300"></i>
              </div>
              <div className="relative animate-slide-up" style={{ animationDelay: "650ms" }}>
                <Input
                  type="number"
                  placeholder="Возраст"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="bg-transparent h-auto py-3 border-0 border-b border-[#636370] rounded-none px-0 pb-3 text-white placeholder:text-[#a0a0b0] focus:border-[#00a3ff] focus:ring-0 focus-visible:ring-0 transition-all duration-300 hover:border-[#a0a0b0]"
                />
                <i className="bi bi-calendar absolute right-0 top-1/2 -translate-y-1/2 text-lg text-[#a0a0b0] transition-colors duration-300"></i>
              </div>
              <div className="relative animate-slide-up" style={{ animationDelay: "700ms" }}>
                <Input
                  type="text"
                  placeholder="Учебное заведение"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  className="bg-transparent h-auto py-3 border-0 border-b border-[#636370] rounded-none px-0 pb-3 text-white placeholder:text-[#a0a0b0] focus:border-[#00a3ff] focus:ring-0 focus-visible:ring-0 transition-all duration-300 hover:border-[#a0a0b0]"
                />
                <i className="bi bi-building absolute right-0 top-1/2 -translate-y-1/2 text-lg text-[#a0a0b0] transition-colors duration-300"></i>
              </div>
              <div className="relative animate-slide-up" style={{ animationDelay: "750ms" }}>
                <Input
                  type="text"
                  placeholder="Роль (Студент, Учитель, Разработчик...)"
                  value={primaryRole}
                  onChange={(e) => setPrimaryRole(e.target.value)}
                  className="bg-transparent h-auto py-3 border-0 border-b border-[#636370] rounded-none px-0 pb-3 text-white placeholder:text-[#a0a0b0] focus:border-[#00a3ff] focus:ring-0 focus-visible:ring-0 transition-all duration-300 hover:border-[#a0a0b0]"
                />
                <i className="bi bi-person-badge absolute right-0 top-1/2 -translate-y-1/2 text-lg text-[#a0a0b0] transition-colors duration-300"></i>
              </div>
            </div>
          </div>

          {/* Email Input */}
          <div className="space-y-6">
            <div className="relative animate-slide-up" style={{ animationDelay: "700ms" }}>
              <Input
                type="email"
                placeholder="Почта"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-transparent h-auto py-2.5 border-0 border-b border-[#636370] rounded-none px-0 pb-3 text-white placeholder:text-[#a0a0b0] focus:border-[#00a3ff] focus:ring-0 focus-visible:ring-0 transition-all duration-300 hover:border-[#a0a0b0]"
              />
              <i className="bi bi-envelope absolute right-0 top-1/2 -translate-y-1/2 text-lg text-[#a0a0b0] transition-colors duration-300"></i>
            </div>

            {/* Password Input */}
            <div className="relative animate-slide-up" style={{ animationDelay: "800ms" }}>
              <Input
                type="password"
                placeholder="Пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-transparent h-auto py-3 border-0 border-b border-[#636370] rounded-none px-0 pb-3 text-white placeholder:text-[#a0a0b0] focus:border-[#00a3ff] focus:ring-0 focus-visible:ring-0 transition-all duration-300 hover:border-[#a0a0b0]"
              />
              <i className="bi bi-lock absolute right-0 top-1/2 -translate-y-1/2 text-lg text-[#a0a0b0] transition-colors duration-300"></i>
            </div>
          </div>
        </div>

        {/* Button */}
        <Button
          onClick={isLogin ? handleLogin : handleRegister}
          className={`w-full bg-[#00a3ff] hover:bg-[#0088cc] text-white font-medium py-3 rounded-full ${isLogin ? "mt-8" : "mt-8"} transition-all duration-300 transform hover:scale-102 hover:shadow-lg hover:shadow-[#00a3ff]/20 active:scale-95 animate-slide-up`}
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
