"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "@/hooks/use-toast"
import { apiFetch } from "@/lib/api"

interface EmailVerificationProps {
  email: string
  onVerified: (data: any) => void
  onBack: () => void
}

export function EmailVerification({ email, onVerified, onBack }: EmailVerificationProps) {
  const [code, setCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)

  const handleVerify = async () => {
    if (code.length !== 7) {
      toast({ 
        title: "Неверный код", 
        description: "Код должен быть в формате xxx-xxx", 
        variant: "destructive" as any 
      })
      return
    }

    setLoading(true)
    try {
      const data = await apiFetch<any>("/auth/login-verify", {
        method: "POST",
        body: JSON.stringify({ email, code })
      })
      
      if (data.error) {
        throw new Error(data.error)
      }
      
      toast({ 
        title: "Успешно", 
        description: "Вы успешно вошли в систему" 
      })
      
      onVerified(data)
    } catch (e: any) {
      toast({ 
        title: "Ошибка", 
        description: e?.message || "Неверный код подтверждения", 
        variant: "destructive" as any 
      })
    } finally {
      setLoading(false)
    }
  }

  const handleResendCode = async () => {
    setResending(true)
    try {
      const response = await apiFetch<any>("/auth/send-verification", {
        method: "POST",
        body: JSON.stringify({ email })
      })
      
      if (response.error) {
        throw new Error(response.error)
      }
      
      toast({ 
        title: "Код отправлен", 
        description: "Новый код подтверждения отправлен на вашу почту" 
      })
    } catch (e: any) {
      toast({ 
        title: "Ошибка", 
        description: e?.message || "Не удалось отправить код", 
        variant: "destructive" as any 
      })
    } finally {
      setResending(false)
    }
  }

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^0-9]/g, '')
    
    // Format as xxx-xxx
    if (value.length > 3) {
      value = value.substring(0, 3) + '-' + value.substring(3, 6)
    }
    
    setCode(value)
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-white text-2xl font-medium mb-2">Подтверждение почты</h2>
        <p className="text-[#a7a7a7] text-sm">
          Мы отправили код подтверждения на <span className="text-white">{email}</span>
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-[#a7a7a7] text-sm mb-2">Код подтверждения</label>
          <Input
            type="text"
            value={code}
            onChange={handleCodeChange}
            placeholder="123-456"
            maxLength={7}
            className="bg-transparent h-auto py-3 border-0 border-b border-[#1f1f1f] rounded-none px-0 pb-3 text-white placeholder:text-[#a7a7a7] focus:border-[#2a2a2a] focus:ring-0 focus-visible:ring-0 transition-all duration-300 hover:border-[#2a2a2a] text-center text-2xl tracking-widest"
          />
        </div>

        <Button
          onClick={handleVerify}
          disabled={loading || code.length !== 7}
          className="w-full bg-[#0f0f0f] border border-[#1a1a1a] hover:bg-[#141414] hover:border-[#2a2a2a] text-white font-medium py-3 rounded-full transition-all duration-300 transform hover:scale-102 active:scale-95"
        >
          {loading ? "Проверка..." : "Подтвердить"}
        </Button>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button
            onClick={handleResendCode}
            disabled={resending}
            variant="outline"
            className="flex-1 border-[#1f1f1f] text-[#a7a7a7] hover:bg-[#141414] hover:border-[#2a2a2a] hover:text-white"
          >
            {resending ? "Отправка..." : "Отправить заново"}
          </Button>
          <Button
            onClick={onBack}
            variant="outline"
            className="flex-1 border-[#1f1f1f] text-[#a7a7a7] hover:bg-[#141414] hover:border-[#2a2a2a] hover:text-white"
          >
            Назад
          </Button>
        </div>
      </div>
    </div>
  )
}