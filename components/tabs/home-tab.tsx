import { ArrowUpRight, Search } from "lucide-react"
import type { CourseDetails } from "@/components/tabs/course-details-tab"

export default function HomeTab({
  onOpenCourse,
}: {
  onOpenCourse?: (course: CourseDetails) => void
}) {
  const createCourse = (id: string, title: string, difficulty: string, author: string, price?: number): CourseDetails => ({
    id,
    title,
    difficulty,
    author,
    price,
    modules: [
      {
        id: 1,
        title: "Начало. HTML",
        lessons: [
          { id: 1, title: "Введение", time: "10:21" },
          { id: 2, title: "Введение", time: "10:21" },
          { id: 3, title: "Введение", time: "10:21" },
        ],
      },
      { id: 2, title: "Стиль. CSS", lessons: [{ id: 1, title: "Введение", time: "10:21" }] },
      { id: 3, title: "Скрипт. JS", lessons: [{ id: 1, title: "Введение", time: "10:21" }] },
      { id: 4, title: "Что дальше?", lessons: [{ id: 1, title: "Введение", time: "10:21" }] },
    ],
  })
  return (
    <main className="flex-1 p-4 md:p-8 overflow-y-auto animate-slide-up">
      {/* Continue Section */}
      <section className="mb-8 md:mb-12">
        <h2
          className="text-white text-xl font-medium mb-4 md:mb-6 animate-slide-up"
          style={{ animationDelay: "200ms" }}
        >
          Продолжить
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {/* WEB Development Card */}
          <div
            onClick={() => onOpenCourse?.(createCourse("home-web-dev", "WEB - Разработка", "Легкий", "S7 Robotics"))}
            role="link"
            tabIndex={0}
            className="bg-[#16161c] border border-[#636370]/20 rounded-2xl p-4 md:p-6 hover:border-[#636370]/40 transition-all duration-300 cursor-pointer group hover:scale-102 animate-slide-up"
            style={{ animationDelay: "300ms" }}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-white text-lg font-medium mb-2">WEB - Разработка</h3>
                <span className="inline-block bg-[#22c55e] text-black text-xs font-medium px-3 py-1 rounded-full">
                  Легкий
                </span>
              </div>
              <ArrowUpRight className="w-6 h-6 text-[#a0a0b0] group-hover:text-white transition-colors duration-300" />
            </div>
            <div className="text-[#a0a0b0] text-sm space-y-1">
              <div>Автор: S7 Robotics</div>
              <div>Тема: 12/72</div>
              <div>Стоимость: 0₸</div>
            </div>
          </div>

          {/* WEB PRO Card */}
          <div
            onClick={() => onOpenCourse?.(createCourse("home-web-pro", "WEB - PRO", "Средний", "Иван Иванов"))}
            role="link"
            tabIndex={0}
            className="bg-[#16161c] border border-[#636370]/20 rounded-2xl p-4 md:p-6 hover:border-[#636370]/40 transition-all duration-300 cursor-pointer group hover:scale-102 animate-slide-up"
            style={{ animationDelay: "400ms" }}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-white text-lg font-medium mb-2">WEB - PRO</h3>
                <span className="inline-block bg-[#f59e0b] text-black text-xs font-medium px-3 py-1 rounded-full">
                  Средний
                </span>
              </div>
              <ArrowUpRight className="w-6 h-6 text-[#a0a0b0] group-hover:text-white transition-colors duration-300" />
            </div>
            <div className="text-[#a0a0b0] text-sm space-y-1">
              <div>Автор: Иван Иванов</div>
              <div>Тема: 12/72</div>
              <div>Стоимость: 0₸</div>
            </div>
          </div>
        </div>
      </section>

      {/* Events Section removed per request */}

      {/* News Section */}
      <section>
        <h2
          className="text-white text-xl font-medium mb-4 md:mb-6 animate-slide-up"
          style={{ animationDelay: "800ms" }}
        >
          Новости
        </h2>
        <div
          className="bg-[#16161c] border border-[#636370]/20 rounded-2xl p-6 md:p-8 text-center animate-slide-up"
          style={{ animationDelay: "900ms" }}
        >
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-black/20 border border-[#636370]/20">
            <Search className="w-7 h-7 text-[#a0a0b0]" />
          </div>
          <h3 className="text-white text-lg font-medium mb-2">Ничего не найдено</h3>
          <p className="text-[#a0a0b0] text-sm">Пока нет новостей</p>
        </div>
      </section>
    </main>
  )
}
