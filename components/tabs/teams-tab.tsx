import { ArrowUpRight, Plus, MessageCircle, Phone, Mail } from "lucide-react"
import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { useRouter } from "next/navigation"
import { apiFetch } from "@/lib/api"
import { useAuth } from "@/components/auth/auth-context"
import { toast } from "@/hooks/use-toast"
import { linkFor } from "@/lib/site-config"

interface CreateTeamModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

function CreateTeamModal({ isOpen, onClose, onSuccess }: CreateTeamModalProps) {
  const { user } = useAuth()
  const [teamName, setTeamName] = useState('')
  const [description, setDescription] = useState('')
  const [city, setCity] = useState('')
  const [phone, setPhone] = useState('')
  const [educationalInstitution, setEducationalInstitution] = useState('')
  const [mentorName, setMentorName] = useState('')
  const positionsList = ["Капитан", "Инженер", "Программист", "Дизайнер", "Маркетолог"]
  const [positionsWanted, setPositionsWanted] = useState<Record<string, boolean>>({})
  const [customPositions, setCustomPositions] = useState('')
  const competitionOptions = ["WRO", "Robofest", "FIRST LEGO League", "FIRST Tech Challenge"]
  const [competitions, setCompetitions] = useState<Record<string, boolean>>({})
  const [customCompetitions, setCustomCompetitions] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!teamName.trim()) return

    setIsLoading(true)
    if (!user) {
      toast({ title: 'Войдите', description: 'Требуется авторизация' })
      setIsLoading(false)
      return
    }
    try {
      const selectedPositions = Object.keys(positionsWanted).filter((k) => positionsWanted[k])
      const extraPositions = customPositions.split(',').map((s) => s.trim()).filter(Boolean)
      const selectedCompetitions = [
        ...Object.keys(competitions).filter((k) => competitions[k]),
        ...customCompetitions.split(',').map((s) => s.trim()).filter(Boolean),
      ]
      await apiFetch('/teams', {
        method: 'POST',
        body: JSON.stringify({
          name: teamName,
          description: description || undefined,
          city: city || undefined,
          phone: phone || undefined,
          educationalInstitution: educationalInstitution || undefined,
          mentorName: mentorName || undefined,
          positionsWanted: [...selectedPositions, ...extraPositions],
          competitions: selectedCompetitions,
        }),
      })
      onSuccess()
      setTeamName('')
      setDescription('')
      setCity('')
      setPhone('')
      setEducationalInstitution('')
      setMentorName('')
      setPositionsWanted({})
      setCustomPositions('')
      setCompetitions({})
      setCustomCompetitions('')
      onClose()
      toast({ title: 'Команда создана' })
    } catch (error: any) {
      toast({ title: 'Ошибка', description: error?.message || 'Ошибка создания команды', variant: 'destructive' as any })
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return createPortal(
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[1000]">
      <div className="w-[min(92vw,640px)] bg-[#16161c] border border-[#2a2a35] rounded-2xl p-6 text-white shadow-xl">
        <h3 className="text-white text-xl font-medium mb-4">Создать команду</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Название команды"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            className="w-full bg-[#0e0e12] border border-[#636370]/20 rounded-lg px-4 py-3 text-white placeholder:text-[#a0a0b0] focus:border-[#00a3ff] focus:outline-none"
            required
          />
          <div className="grid grid-cols-1 gap-3">
            <input
              type="text"
              placeholder="Город"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full bg-[#0e0e12] border border-[#636370]/20 rounded-lg px-4 py-3 text-white placeholder:text-[#a0a0b0] focus:border-[#00a3ff] focus:outline-none"
            />
            <input
              type="tel"
              placeholder="Телефон"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-[#0e0e12] border border-[#636370]/20 rounded-lg px-4 py-3 text-white placeholder:text-[#a0a0b0] focus:border-[#00a3ff] focus:outline-none"
            />
            <input
              type="text"
              placeholder="Учебное заведение команды"
              value={educationalInstitution}
              onChange={(e) => setEducationalInstitution(e.target.value)}
              className="w-full bg-[#0e0e12] border border-[#636370]/20 rounded-lg px-4 py-3 text-white placeholder:text-[#a0a0b0] focus:border-[#00a3ff] focus:outline-none"
            />
            <input
              type="text"
              placeholder="Имя ментора"
              value={mentorName}
              onChange={(e) => setMentorName(e.target.value)}
              className="w-full bg-[#0e0e12] border border-[#636370]/20 rounded-lg px-4 py-3 text-white placeholder:text-[#a0a0b0] focus:border-[#00a3ff] focus:outline-none"
            />
          </div>
          <div>
            <div className="text-white/80 mb-2">Какие позиции нужны</div>
            <div className="flex flex-wrap gap-2 mb-3">
              {positionsList.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPositionsWanted((s) => ({ ...s, [p]: !s[p] }))}
                  className={`text-xs font-medium px-3 py-1 rounded-full border ${positionsWanted[p] ? 'bg-[#00a3ff] text-white border-[#00a3ff]' : 'bg-transparent text-white/80 border-[#2a2a35]'}`}
                >
                  {p}
                </button>
              ))}
            </div>
            <input
              type="text"
              placeholder="Другая должность (через запятую)"
              value={customPositions}
              onChange={(e) => setCustomPositions(e.target.value)}
              className="w-full bg-[#0e0e12] border border-[#636370]/20 rounded-lg px-4 py-3 text-white placeholder:text-[#a0a0b0] focus:border-[#00a3ff] focus:outline-none"
            />
          </div>

          <div>
            <div className="text-white/80 mb-2">Соревнования команды</div>
            <div className="flex flex-wrap gap-2 mb-3">
              {competitionOptions.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCompetitions((s) => ({ ...s, [c]: !s[c] }))}
                  className={`text-xs font-medium px-3 py-1 rounded-full border ${competitions[c] ? 'bg-[#00a3ff] text-white border-[#00a3ff]' : 'bg-transparent text-white/80 border-[#2a2a35]'}`}
                >
                  {c}
                </button>
              ))}
            </div>
            <input
              type="text"
              placeholder="Другие (через запятую)"
              value={customCompetitions}
              onChange={(e) => setCustomCompetitions(e.target.value)}
              className="w-full bg-[#0e0e12] border border-[#636370]/20 rounded-lg px-4 py-3 text-white placeholder:text-[#a0a0b0] focus:border-[#00a3ff] focus:outline-none"
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
    </div>,
    document.body
  )
}

export default function TeamsTab() {
  const { user } = useAuth()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [teams, setTeams] = useState<Array<{ id: string; name: string; description?: string; membersCount: number; metadata?: any }>>([])

  const handleTeamCreated = () => setRefreshKey(prev => prev + 1)

  useEffect(() => {
    apiFetch<Array<{ id: string; name: string; description?: string; membersCount: number; metadata?: any }>>('/teams')
      .then(setTeams)
      .catch(() => setTeams([]))
  }, [refreshKey])

  const join = async (teamId: string) => {
    if (!user) { toast({ title: 'Войдите', description: 'Требуется авторизация' }); return }
    try {
      const res = await apiFetch<{ status: string }>(`/teams/${teamId}/join`, { method: 'POST' })
      toast({ title: res.status === 'pending' ? 'Заявка отправлена' : 'Готово' })
    } catch (e: any) {
      toast({ title: 'Ошибка', description: e?.message || 'Не удалось отправить заявку', variant: 'destructive' as any })
    }
  }
  return (
    <main className="flex-1 p-8 overflow-y-auto animate-slide-up">
      {/* Open Teams Section */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6 animate-slide-up" style={{ animationDelay: "200ms" }}>
          <h2 className="text-white text-xl font-medium">Команды</h2>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 rounded-lg bg-[#00a3ff] hover:bg-[#0088cc] text-black font-medium"
          >
            Создать команду
          </button>
        </div>
        {teams.length === 0 ? (
          <div className="text-white/70 bg-[#16161c] border border-[#636370]/20 rounded-2xl p-8">Пока нет команд</div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {teams.map((t, idx) => (
              <div key={t.id} className="bg-[#16161c] border border-[#636370]/20 rounded-2xl p-6 hover:border-[#636370]/40 transition-all duration-300 group animate-slide-up" style={{ animationDelay: `${300 + idx*50}ms` }}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-white text-lg font-medium mb-2">{t.name}</h3>
                    <span className="inline-block bg-[#00a3ff] text-white text-xs font-medium px-3 py-1 rounded-full">Участников: {t.membersCount}</span>
                  </div>
                  <ArrowUpRight className="w-6 h-6 text-[#a0a0b0] group-hover:text-white transition-colors duration-300" />
                </div>
                <div className="text-[#a0a0b0] text-sm space-y-1 mb-4">
                  {t.description && <div>{t.description}</div>}
                  {t.metadata?.city && <div>Город: {t.metadata.city}</div>}
                  {t.metadata?.educationalInstitution && <div>Уч. заведение: {t.metadata.educationalInstitution}</div>}
                  {t.metadata?.phone && <div>Телефон: {t.metadata.phone}</div>}
                  {t.metadata?.mentorName && <div>Ментор: {t.metadata.mentorName}</div>}
                  {Array.isArray(t.metadata?.positionsWanted) && t.metadata.positionsWanted.length > 0 && (
                    <div>Нужные позиции: {t.metadata.positionsWanted.join(', ')}</div>
                  )}
                  {Array.isArray(t.metadata?.competitions) && t.metadata.competitions.length > 0 && (
                    <div>Соревнования: {t.metadata.competitions.join(', ')}</div>
                  )}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => join(t.id)} className="px-4 py-2 rounded-lg bg-[#00a3ff] hover:bg-[#0088cc] text-black font-medium">Записаться</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Team Search Section */}
      <section className="mb-12">
        <div className="border-t border-[#636370]/20 pt-8 animate-slide-up" style={{ animationDelay: "500ms" }}>
          <h3 className="text-white text-lg font-medium mb-4">Ищете напарника себе в команду? Тогда добавляй свою команду:</h3>
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
            <a
              href={linkFor("telegram")}
              target="_blank"
              rel="noreferrer"
              aria-label="Мы в Telegram"
              className="w-12 h-12 bg-[#229ED9] rounded-full flex items-center justify-center hover:bg-[#1e8bc3] transition-colors duration-300 animate-slide-up"
              style={{ animationDelay: "700ms" }}
              title="Telegram"
            >
              <MessageCircle className="w-6 h-6 text-white" />
            </a>

            <a
              href={linkFor("whatsapp")}
              target="_blank"
              rel="noreferrer"
              aria-label="Написать в WhatsApp"
              className="w-12 h-12 bg-[#25D366] rounded-full flex items-center justify-center hover:bg-[#20b858] transition-colors duration-300 animate-slide-up"
              style={{ animationDelay: "800ms" }}
              title="WhatsApp"
            >
              <Phone className="w-6 h-6 text-white" />
            </a>

            <a
              href={linkFor("email")}
              aria-label="Написать на email"
              className="w-12 h-12 bg-[#EA4335] rounded-full flex items-center justify-center hover:bg-[#d33b2c] transition-colors duration-300 animate-slide-up"
              style={{ animationDelay: "900ms" }}
              title="Email"
            >
              <Mail className="w-6 h-6 text-white" />
            </a>
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
