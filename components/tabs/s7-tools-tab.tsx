"use client"
import { ExternalLink, Plus, Phone, MessageCircle, Mail } from "lucide-react"

export default function S7ToolsTab() {
  const competitions = [
    {
      id: 1,
      title: "FLL Challenge",
      difficulty: "Сложный",
      difficultyColor: "bg-red-500",
      author: "FIRST",
      cost: "0Т",
      description: "Стоимость онлайн практики: 0Т",
    },
    {
      id: 2,
      title: "WRO - RoboMission El.",
      difficulty: "Средний",
      difficultyColor: "bg-yellow-500",
      author: "WRO Association",
      cost: "0Т",
      description: "Стоимость онлайн практики: 0Т",
    },
    {
      id: 3,
      title: "WRO - RoboMission Jr.",
      difficulty: "Сложный",
      difficultyColor: "bg-red-500",
      author: "WRO Association",
      cost: "0Т",
      description: "Стоимость онлайн практики: 0Т",
    },
    {
      id: 4,
      title: "Попробуй бесплатно на картах прошлого года",
      difficulty: "",
      difficultyColor: "",
      author: "S7 Robotics",
      cost: "0Т",
      description: "Стоимость онлайн практики: 0Т",
      featured: true,
    },
  ]

  return (
    <div className="flex-1 p-8 animate-slide-up">
      <div className="mb-8">
        <h2 className="text-white text-xl mb-6">Соревнования</h2>

        {/* Competitions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {competitions.map((competition, index) => (
            <div
              key={competition.id}
              className={`${
                competition.featured ? "bg-[#00a3ff] text-white" : "bg-[#16161c] border border-[#636370]/20 text-white"
              } rounded-lg p-6 hover:scale-102 transition-all duration-200 cursor-pointer group animate-slide-up`}
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className="flex items-start justify-between mb-4">
                <h3
                  className={`text-lg font-medium ${
                    competition.featured ? "text-white" : "group-hover:text-[#00a3ff]"
                  } transition-colors duration-200`}
                >
                  {competition.title}
                </h3>
                <ExternalLink
                  className={`w-5 h-5 ${
                    competition.featured ? "text-white" : "text-[#a0a0b0] group-hover:text-[#00a3ff]"
                  } transition-colors duration-200`}
                />
              </div>

              <div className={`space-y-2 text-sm ${competition.featured ? "text-white/90" : "text-[#a0a0b0]"}`}>
                <div>Автор: {competition.author}</div>
                <div>{competition.description}</div>
              </div>

              {competition.difficulty && (
                <div className="mt-4">
                  <span className={`px-3 py-1 rounded-full text-xs text-white ${competition.difficultyColor}`}>
                    {competition.difficulty}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Add Competition Section */}
        <div className="mt-12 pt-8 border-t border-[#636370]/20 animate-slide-up" style={{ animationDelay: "600ms" }}>
          <p className="text-[#a0a0b0] mb-4">Проводишь мероприятие и ищешь участников ? тогда публикуй его:</p>
          <button aria-label="Добавить мероприятие" className="w-12 h-12 bg-[#00a3ff] rounded-full flex items-center justify-center hover:bg-[#0088cc] transition-colors duration-200">
            <Plus className="text-white w-6 h-6" />
          </button>
        </div>

        {/* Contact Section */}
        <div className="mt-8 animate-slide-up" style={{ animationDelay: "700ms" }}>
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
