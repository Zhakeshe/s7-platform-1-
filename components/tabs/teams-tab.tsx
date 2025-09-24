import { ArrowUpRight, Plus, MessageCircle, Phone, Mail } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"

interface CreateTeamModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

function CreateTeamModal({ isOpen, onClose, onSuccess }: CreateTeamModalProps) {
  const [teamName, setTeamName] = useState('')
  const [description, setDescription] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!teamName.trim()) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/teams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: teamName,
          description: description || undefined
        })
      })

      if (response.ok) {
        onSuccess()
        setTeamName('')
        setDescription('')
        onClose()
      } else {
        const error = await response.json()
        alert(error.error || 'Ошибка создания команды')
      }
    } catch (error) {
      console.error('Error creating team:', error)
      alert('Ошибка сети')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#16161c] border border-[#636370]/20 rounded-2xl p-6 w-full max-w-md mx-4">
        <h3 className="text-white text-xl font-medium mb-4">Создать команду</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="Название команды"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              className="w-full bg-[#0e0e12] border border-[#636370]/20 rounded-lg px-4 py-3 text-white placeholder:text-[#a0a0b0] focus:border-[#00a3ff] focus:outline-none"
              required
            />
          </div>
          <div>
            <textarea
              placeholder="Описание (опционально)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#0e0e12] border border-[#636370]/20 rounded-lg px-4 py-3 text-white placeholder:text-[#a0a0b0] focus:border-[#00a3ff] focus:outline-none h-24 resize-none"
            />
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-[#636370]/20 text-white py-3 rounded-lg hover:bg-[#636370]/30 transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={isLoading || !teamName.trim()}
              className="flex-1 bg-[#00a3ff] text-white py-3 rounded-lg hover:bg-[#0088cc] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Создаем...' : 'Создать'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function TeamsTab() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleTeamCreated = () => {
    setRefreshKey(prev => prev + 1) // Force refresh of teams list
  }
  return (
    <main className="flex-1 p-8 overflow-y-auto animate-slide-up">
      {/* Open Teams Section */}
      <section className="mb-12">
        <h2 className="text-white text-xl font-medium mb-6 animate-slide-up" style={{ animationDelay: "200ms" }}>
          Открытые команды
        </h2>
        <div className="space-y-6">
          {/* S7 Alpha Team */}
          <div
            className="bg-[#16161c] border border-[#636370]/20 rounded-2xl p-6 hover:border-[#636370]/40 transition-all duration-300 cursor-pointer group hover:scale-102 animate-slide-up"
            style={{ animationDelay: "300ms" }}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-white text-lg font-medium mb-2">S7 Alpha</h3>
                <span className="inline-block bg-[#00a3ff] text-white text-xs font-medium px-3 py-1 rounded-full">
                  Актау
                </span>
              </div>
              <ArrowUpRight className="w-6 h-6 text-[#a0a0b0] group-hover:text-white transition-colors duration-300" />
            </div>
            <div className="text-[#a0a0b0] text-sm space-y-1 mb-4">
              <div>Ментор: Серик Серикбаев</div>
              <div>Учебный центр / учреждение: Alpha Study</div>
              <div className="text-[#00a3ff]">Соревнование: FIRST LEGO LEAGUE CHALLENGE</div>
              <div>Открытые позиции: Капитан, Инженер</div>
            </div>
          </div>

          {/* S7 RobOcean Team */}
          <div
            className="bg-[#16161c] border border-[#636370]/20 rounded-2xl p-6 hover:border-[#636370]/40 transition-all duration-300 cursor-pointer group hover:scale-102 animate-slide-up"
            style={{ animationDelay: "400ms" }}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-white text-lg font-medium mb-2">S7 RobOcean</h3>
                <span className="inline-block bg-[#00a3ff] text-white text-xs font-medium px-3 py-1 rounded-full">
                  Актау
                </span>
              </div>
              <ArrowUpRight className="w-6 h-6 text-[#a0a0b0] group-hover:text-white transition-colors duration-300" />
            </div>
            <div className="text-[#a0a0b0] text-sm space-y-1 mb-4">
              <div>Ментор: Калиев Казбек</div>
              <div>Учебный центр / учреждение: Nazarbayev Intellectual School in Aktau</div>
              <div className="text-[#00a3ff]">Соревнование: FIRST LEGO LEAGUE CHALLENGE</div>
              <div>Открытые позиции: Капитан, Инженер</div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Search Section */}
      <section className="mb-12">
        <div className="border-t border-[#636370]/20 pt-8 animate-slide-up" style={{ animationDelay: "500ms" }}>
          <h3 className="text-white text-lg font-medium mb-4">
            Ищете напарника себе в команду ? Тогда добавляй свою команду:
          </h3>
          <div className="flex justify-center">
            <button 
              onClick={() => setIsCreateModalOpen(true)}
              className="w-16 h-16 bg-[#00a3ff] rounded-full flex items-center justify-center hover:bg-[#0088cc] transition-colors duration-300"
            >
              <Plus className="w-8 h-8 text-white" />
            </button>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section>
        <div className="border-t border-[#636370]/20 pt-8 animate-slide-up" style={{ animationDelay: "600ms" }}>
          <h3 className="text-white text-lg font-medium mb-4">Не получается, либо если есть вопросы свяжись с нами:</h3>
          <div className="flex justify-center space-x-4">
            <button
              className="w-12 h-12 bg-[#229ED9] rounded-full flex items-center justify-center hover:bg-[#1e8bc3] transition-colors duration-300 animate-slide-up"
              style={{ animationDelay: "700ms" }}
            >
              <MessageCircle className="w-6 h-6 text-white" />
            </button>

            <button
              className="w-12 h-12 bg-[#25D366] rounded-full flex items-center justify-center hover:bg-[#20b858] transition-colors duration-300 animate-slide-up"
              style={{ animationDelay: "800ms" }}
            >
              <Phone className="w-6 h-6 text-white" />
            </button>

            <button
              className="w-12 h-12 bg-[#EA4335] rounded-full flex items-center justify-center hover:bg-[#d33b2c] transition-colors duration-300 animate-slide-up"
              style={{ animationDelay: "900ms" }}
            >
              <Mail className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>
      </section>
      
      {/* Create Team Modal */}
      <CreateTeamModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleTeamCreated}
      />
    </main>
  )
}
