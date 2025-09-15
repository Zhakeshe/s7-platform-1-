"use client"
import { useState } from "react"
import { Search, ExternalLink, Plus, Phone, MessageCircle, Mail } from "lucide-react"

export default function MasterclassTab() {
  const [activeFilter, setActiveFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")

  const filters = [
    { id: "all", label: "Все" },
    { id: "online", label: "Онлайн" },
    { id: "offline", label: "Оффлайн" },
    { id: "free", label: "Бесплатно" },
  ]

  const masterclasses = [
    {
      id: 1,
      title: "Основы FIRST",
      type: "offline",
      location: "NIS Aktau",
      date: "27.09.2025",
      author: "S7 Robotics",
      cost: "100Т",
      status: "Оффлайн",
    },
    {
      id: 2,
      title: "Основы WRO",
      type: "offline",
      location: "NIS Aktau",
      date: "27.09.2025",
      author: "S7 Robotics",
      cost: "100Т",
      status: "Оффлайн",
    },
    {
      id: 3,
      title: "Основы AI",
      type: "offline",
      location: "Mangystau HUB",
      date: "10.09.2025",
      author: "Mangystau IT HUB",
      cost: "0Т",
      status: "Оффлайн",
    },
    {
      id: 4,
      title: "WEB Дизайн с нуля",
      type: "online",
      date: "01.09.2025",
      author: "S7 Robotics",
      cost: "100Т",
      status: "Онлайн",
    },
  ]

  const filteredMasterclasses = masterclasses.filter((masterclass) => {
    const matchesFilter =
      activeFilter === "all" ||
      (activeFilter === "online" && masterclass.type === "online") ||
      (activeFilter === "offline" && masterclass.type === "offline") ||
      (activeFilter === "free" && masterclass.cost === "0Т")

    const matchesSearch = masterclass.title.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesFilter && matchesSearch
  })

  return (
    <div className="flex-1 p-8 animate-slide-up">
      <div className="mb-8">
        <h2 className="text-white text-xl mb-6">Скоро</h2>

        {/* Filters */}
        <div className="flex items-center gap-4 mb-6">
          {filters.map((filter, index) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`px-4 py-2 rounded-full text-sm transition-all duration-200 animate-slide-up ${
                activeFilter === filter.id
                  ? "bg-[#00a3ff] text-white"
                  : "bg-[#636370]/20 text-[#a0a0b0] hover:text-white hover:bg-[#636370]/30"
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {filter.label}
            </button>
          ))}

          {/* Search */}
          <div className="relative ml-auto animate-slide-up" style={{ animationDelay: "400ms" }}>
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#a0a0b0] w-4 h-4" />
            <input
              type="text"
              placeholder="Поиск"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#636370]/20 text-white placeholder-[#a0a0b0] pl-10 pr-4 py-2 rounded-lg border border-[#636370]/30 focus:border-[#00a3ff] focus:outline-none transition-colors duration-200"
            />
          </div>
        </div>

        {/* Masterclass Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredMasterclasses.map((masterclass, index) => (
            <div
              key={masterclass.id}
              className="bg-[#16161c] border border-[#636370]/20 rounded-lg p-6 hover:border-[#00a3ff]/50 transition-all duration-200 cursor-pointer group animate-slide-up"
              style={{ animationDelay: `${(index + 5) * 100}ms` }}
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-white text-lg font-medium group-hover:text-[#00a3ff] transition-colors duration-200">
                  {masterclass.title}
                </h3>
                <ExternalLink className="w-5 h-5 text-[#a0a0b0] group-hover:text-[#00a3ff] transition-colors duration-200" />
              </div>

              <div className="space-y-2 text-sm text-[#a0a0b0]">
                {masterclass.location && <div>Локация: {masterclass.location}</div>}
                <div>Дата: {masterclass.date}</div>
                <div>Автор: {masterclass.author}</div>
                <div>Стоимость участия: {masterclass.cost}</div>
              </div>

              <div className="mt-4">
                <span
                  className={`px-3 py-1 rounded-full text-xs ${
                    masterclass.type === "online" ? "bg-[#00a3ff] text-white" : "bg-[#636370]/30 text-[#a0a0b0]"
                  }`}
                >
                  {masterclass.status}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Add Masterclass Section */}
        <div className="mt-12 pt-8 border-t border-[#636370]/20 animate-slide-up" style={{ animationDelay: "800ms" }}>
          <p className="text-[#a0a0b0] mb-4">Проводишь мастеркласс? Тогда публикуй его бесплатно:</p>
          <button aria-label="Добавить мастер-класс" className="w-12 h-12 bg-[#00a3ff] rounded-full flex items-center justify-center hover:bg-[#0088cc] transition-colors duration-200">
            <Plus className="text-white w-6 h-6" />
          </button>
        </div>

        {/* Contact Section */}
        <div className="mt-8 animate-slide-up" style={{ animationDelay: "900ms" }}>
          <p className="text-[#a0a0b0] mb-4">Не получается, либо если есть вопросы свяжись с нами:</p>
          <div className="flex gap-4">
            <button aria-label="Позвонить" className="w-12 h-12 bg-[#00a3ff] rounded-full flex items-center justify-center hover:bg-[#0088cc] transition-colors duration-200">
              <Phone className="text-white w-5 h-5" />
            </button>
            <button aria-label="Написать сообщение" className="w-12 h-12 bg-[#00a3ff] rounded-full flex items-center justify-center hover:bg-[#0088cc] transition-colors duration-200">
              <MessageCircle className="text-white w-5 h-5" />
            </button>
            <button aria-label="Отправить email" className="w-12 h-12 bg-[#00a3ff] rounded-full flex items-center justify-center hover:bg-[#0088cc] transition-colors duration-200">
              <Mail className="text-white w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
