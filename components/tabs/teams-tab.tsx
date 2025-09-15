import { ArrowUpRight, Plus, MessageCircle, Phone, Mail } from "lucide-react"

export default function TeamsTab() {
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
            <button className="w-16 h-16 bg-[#00a3ff] rounded-full flex items-center justify-center hover:bg-[#0088cc] transition-colors duration-300">
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
    </main>
  )
}
