"use client"
import { User, Trophy, ExternalLink, Plus } from "lucide-react"

export default function ProfileTab() {
  return (
    <div className="flex-1 p-4 md:p-8 animate-slide-up">
      <div className="max-w-4xl mx-auto space-y-6 md:space-y-8">
        {/* Profile Header */}
        <div
          className="bg-[#16161c] rounded-xl p-4 md:p-6 border border-[#636370]/20 animate-slide-up"
          style={{ animationDelay: "100ms" }}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-[#00a3ff] to-[#0080cc] rounded-full flex items-center justify-center">
              <User className="w-8 h-8 md:w-10 md:h-10 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-2">
                <h2 className="text-white text-xl md:text-2xl font-medium">Амантай Батырхан</h2>
                <span className="bg-[#00a3ff] text-white px-3 py-1 rounded-full text-sm font-medium w-fit">
                  12 Уровень
                </span>
              </div>
              <div className="text-[#a0a0b0] text-sm space-y-1">
                <p>
                  <span className="text-white">ФИО:</span> Амантай Батырхан Найманович
                </p>
                <p>
                  <span className="text-white">Возраст:</span> 16 лет
                </p>
                <p>
                  <span className="text-white">Место обучения:</span> NIS Aktau
                </p>
                <p>
                  <span className="text-white">Основная должность:</span> Капитан
                </p>
                <p>
                  <span className="text-white">Команда:</span> S7 Robotics
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Level Progress */}
        <div
          className="bg-[#16161c] rounded-xl p-4 md:p-6 border border-[#636370]/20 animate-slide-up"
          style={{ animationDelay: "200ms" }}
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-white text-lg font-medium">12</span>
            <span className="text-white text-lg font-medium">13</span>
          </div>
          <div className="w-full bg-[#636370]/20 rounded-full h-2 mb-4">
            <div
              className="bg-gradient-to-r from-[#00a3ff] to-[#0080cc] h-2 rounded-full"
              style={{ width: "75%" }}
            ></div>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#a0a0b0]">Не знаешь как поднимать уровень?</span>
            <button className="text-[#00a3ff] hover:text-[#0080cc] transition-colors duration-200 flex items-center gap-1">
              Смотри гайд <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Achievements */}
        <div
          className="bg-[#16161c] rounded-xl p-4 md:p-6 border border-[#636370]/20 animate-slide-up"
          style={{ animationDelay: "300ms" }}
        >
          <h3 className="text-white text-lg font-medium mb-4">Достижения</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-[#0e0e12] rounded-lg p-4 border border-[#636370]/10 group hover:border-[#00a3ff]/30 transition-all duration-200">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-white font-medium">Профессионал</h4>
                <ExternalLink className="w-4 h-4 text-[#a0a0b0] group-hover:text-[#00a3ff] transition-colors duration-200" />
              </div>
              <span className="bg-[#00a3ff] text-white px-2 py-1 rounded text-xs">Не получен</span>
            </div>
            <div className="bg-[#0e0e12] rounded-lg p-4 border border-[#636370]/10 group hover:border-[#00a3ff]/30 transition-all duration-200">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-white font-medium">Врошник</h4>
                <ExternalLink className="w-4 h-4 text-[#a0a0b0] group-hover:text-[#00a3ff] transition-colors duration-200" />
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-[#00a3ff] text-white px-2 py-1 rounded text-xs">Получен</span>
                <span className="text-[#a0a0b0] text-xs">21.05.2024</span>
              </div>
            </div>
          </div>
        </div>

        {/* Completed Courses */}
        <div
          className="bg-[#16161c] rounded-xl p-4 md:p-6 border border-[#636370]/20 animate-slide-up"
          style={{ animationDelay: "400ms" }}
        >
          <h3 className="text-white text-lg font-medium mb-4">Пройденные курсы</h3>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-16 h-16 bg-[#636370]/20 rounded-full flex items-center justify-center mb-4">
              <Trophy className="w-8 h-8 text-[#636370]" />
            </div>
            <h4 className="text-white font-medium mb-2">Пройденных курсов нет</h4>
            <p className="text-[#a0a0b0] text-sm">С нетерпением ждем ваших результатов</p>
          </div>
        </div>

        {/* Competitions */}
        <div
          className="bg-[#16161c] rounded-xl p-4 md:p-6 border border-[#636370]/20 animate-slide-up"
          style={{ animationDelay: "500ms" }}
        >
          <h3 className="text-white text-lg font-medium mb-4">Соревнования</h3>
          <div className="bg-[#0e0e12] rounded-lg p-4 border border-[#636370]/10 group hover:border-[#00a3ff]/30 transition-all duration-200">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-white font-medium">FLL Challenge</h4>
              <ExternalLink className="w-4 h-4 text-[#a0a0b0] group-hover:text-[#00a3ff] transition-colors duration-200" />
            </div>
            <span className="bg-[#00a3ff] text-white px-2 py-1 rounded text-xs mb-3 inline-block">S7 Alpha</span>
            <div className="text-[#a0a0b0] text-sm space-y-1">
              <p>
                <span className="text-white">Награды:</span> Breakthrough Award
              </p>
              <p>
                <span className="text-white">Дата:</span> 27.01.2025-27.08.2025
              </p>
              <p>
                <span className="text-white">Учреждение:</span> S7 Robotics
              </p>
              <p>
                <span className="text-white">Должность:</span> Капитан
              </p>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-[#636370]/20">
            <p className="text-[#a0a0b0] text-sm mb-4">Выиграл соревнование? публикуй достижения:</p>
            <button className="w-12 h-12 bg-[#00a3ff] hover:bg-[#0080cc] rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105">
              <Plus className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
