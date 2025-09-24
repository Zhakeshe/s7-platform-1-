import { ArrowUpRight, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import type { CourseDetails } from "@/components/tabs/course-details-tab"
import { useEffect, useState } from "react"
import { listCourses } from "@/lib/s7db"

export default function CoursesTab({
  onOpenCourse,
}: {
  onOpenCourse?: (course: CourseDetails) => void
}) {
  const [dbCourses, setDbCourses] = useState<CourseDetails[]>([])

  useEffect(() => {
    try {
      const list = listCourses().filter((c) => (c as any).published) as any[]
      const mapped: CourseDetails[] = list.map((c) => ({
        id: c.id,
        title: c.title,
        difficulty: c.difficulty,
        author: c.author,
        price: c.price,
        modules: (c.modules || []).map((m: any) => ({ id: m.id, title: m.title, lessons: m.lessons || [] })),
      }))
      setDbCourses(mapped)
    } catch {
      setDbCourses([])
    }
  }, [])
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
    <main className="flex-1 p-8 overflow-y-auto animate-slide-up">
      {/* S7DB Courses */}
      {dbCourses.length > 0 && (
        <section className="mb-12">
          <h2 className="text-white text-xl font-medium mb-6 animate-slide-up" style={{ animationDelay: "150ms" }}>
            Курсы (опубликованные)
          </h2>
          <div className="grid grid-cols-2 gap-6">
            {dbCourses.map((c, i) => (
              <div
                key={c.id}
                onClick={() => onOpenCourse?.(c)}
                role="link"
                tabIndex={0}
                className="bg-[#16161c] border border-[#636370]/20 rounded-2xl p-6 hover:border-[#636370]/40 transition-all duration-300 cursor-pointer group hover:scale-102 animate-slide-up"
                style={{ animationDelay: `${200 + i * 50}ms` }}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-white text-lg font-medium mb-2">{c.title}</h3>
                    <span className="inline-block bg-[#22c55e] text-black text-xs font-medium px-3 py-1 rounded-full">
                      {c.difficulty}
                    </span>
                  </div>
                  <ArrowUpRight className="w-6 h-6 text-[#a0a0b0] group-hover:text-white transition-colors duration-300" />
                </div>
                <div className="text-[#a0a0b0] text-sm space-y-1">
                  <div>Автор: {c.author}</div>
                  <div>Тем: {(c.modules || []).reduce((acc, m) => acc + (m.lessons?.length || 0), 0)}</div>
                  <div>Стоимость: {c.price && c.price > 0 ? `${c.price.toLocaleString()}₸` : "0₸"}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
      {/* Continue Section */}
      <section className="mb-12">
        <h2 className="text-white text-xl font-medium mb-6 animate-slide-up" style={{ animationDelay: "200ms" }}>
          Продолжить
        </h2>
        <div className="grid grid-cols-2 gap-6">
          {/* WEB Development Card */}
          <div
            onClick={() => onOpenCourse?.(createCourse("web-dev", "WEB - Разработка", "Легкий", "S7 Robotics"))}
            role="link"
            tabIndex={0}
            className="bg-[#16161c] border border-[#636370]/20 rounded-2xl p-6 hover:border-[#636370]/40 transition-all duration-300 cursor-pointer group hover:scale-102 animate-slide-up"
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
            onClick={() => onOpenCourse?.(createCourse("web-pro", "WEB - PRO", "Средний", "Асанов А"))}
            role="link"
            tabIndex={0}
            className="bg-[#16161c] border border-[#636370]/20 rounded-2xl p-6 hover:border-[#636370]/40 transition-all duration-300 cursor-pointer group hover:scale-102 animate-slide-up"
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

      {/* Recommended Courses Section */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-white text-xl font-medium animate-slide-up" style={{ animationDelay: "500ms" }}>
            Рекомендованные курсы
          </h2>
          <div className="relative animate-slide-up" style={{ animationDelay: "600ms" }}>
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#a0a0b0] w-4 h-4" />
            <Input
              placeholder="Поиск"
              className="bg-[#16161c] border-[#636370]/20 text-white placeholder:text-[#a0a0b0] pl-10 w-64 focus:border-[#00a3ff] transition-colors duration-200"
            />
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-2 mb-8 animate-slide-up" style={{ animationDelay: "700ms" }}>
          <button className="bg-[#00a3ff] text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-[#0088cc] transition-colors duration-200">
            Все
          </button>
          <button className="bg-[#636370]/20 text-[#a0a0b0] hover:text-white hover:bg-[#636370]/30 px-4 py-2 rounded-full text-sm transition-all duration-200">
            Новые
          </button>
          <button className="bg-[#636370]/20 text-[#a0a0b0] hover:text-white hover:bg-[#636370]/30 px-4 py-2 rounded-full text-sm transition-all duration-200">
            Популярные
          </button>
        </div>

        {/* Course Grid */}
        <div className="grid grid-cols-2 gap-6">
          {/* FIRST Basics */}
          <div
            onClick={() => onOpenCourse?.(createCourse("first-basics", "Основы FIRST", "Легкий", "Серик Серикбаев"))}
            role="link"
            tabIndex={0}
            className="bg-[#16161c] border border-[#636370]/20 rounded-2xl p-6 hover:border-[#636370]/40 transition-all duration-300 cursor-pointer group hover:scale-102 animate-slide-up"
            style={{ animationDelay: "800ms" }}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-white text-lg font-medium mb-2">Основы FIRST</h3>
                <div className="flex space-x-2">
                  <span className="inline-block bg-[#22c55e] text-black text-xs font-medium px-3 py-1 rounded-full">
                    Легкий
                  </span>
                  <span className="inline-block bg-[#00a3ff] text-white text-xs font-medium px-3 py-1 rounded-full">
                    Популярное
                  </span>
                  <span className="inline-block bg-[#f59e0b] text-black text-xs font-medium px-3 py-1 rounded-full">
                    Новое
                  </span>
                </div>
              </div>
              <ArrowUpRight className="w-6 h-6 text-[#a0a0b0] group-hover:text-white transition-colors duration-300" />
            </div>
            <div className="text-[#a0a0b0] text-sm space-y-1">
              <div>Автор: Серик Серикбаев</div>
              <div>Тем: 30</div>
              <div>Стоимость: 0₸</div>
            </div>
          </div>

          {/* Robotics */}
          <div
            onClick={() => onOpenCourse?.(createCourse("robotics", "Робототехника", "Сложный", "Дмитрий Дмитриевич", 12000))}
            role="link"
            tabIndex={0}
            className="bg-[#16161c] border border-[#636370]/20 rounded-2xl p-6 hover:border-[#636370]/40 transition-all duration-300 cursor-pointer group hover:scale-102 animate-slide-up"
            style={{ animationDelay: "900ms" }}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-white text-lg font-medium mb-2">Робототехника</h3>
                <span className="inline-block bg-[#ef4444] text-white text-xs font-medium px-3 py-1 rounded-full">
                  Сложный
                </span>
              </div>
              <ArrowUpRight className="w-6 h-6 text-[#a0a0b0] group-hover:text-white transition-colors duration-300" />
            </div>
            <div className="text-[#a0a0b0] text-sm space-y-1">
              <div>Автор: Дмитрий Дмитриевич</div>
              <div>Тем: 12</div>
              <div>Стоимость: 12.000₸</div>
            </div>
          </div>

          {/* WRO BASIC */}
          <div
            onClick={() => onOpenCourse?.(createCourse("wro-basic", "WRO - BASIC", "Легкий", "S7 Robotics"))}
            role="link"
            tabIndex={0}
            className="bg-[#16161c] border border-[#636370]/20 rounded-2xl p-6 hover:border-[#636370]/40 transition-all duration-300 cursor-pointer group hover:scale-102 animate-slide-up"
            style={{ animationDelay: "1000ms" }}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-white text-lg font-medium mb-2">WRO - BASIC</h3>
                <div className="flex space-x-2">
                  <span className="inline-block bg-[#22c55e] text-black text-xs font-medium px-3 py-1 rounded-full">
                    Легкий
                  </span>
                  <span className="inline-block bg-[#f59e0b] text-black text-xs font-medium px-3 py-1 rounded-full">
                    Новое
                  </span>
                </div>
              </div>
              <ArrowUpRight className="w-6 h-6 text-[#a0a0b0] group-hover:text-white transition-colors duration-300" />
            </div>
            <div className="text-[#a0a0b0] text-sm space-y-1">
              <div>Автор: S7 Robotics</div>
              <div>Тем: 20</div>
              <div>Стоимость: 0₸</div>
            </div>
          </div>

          {/* Arduino Basics */}
          <div
            onClick={() => onOpenCourse?.(createCourse("arduino-start", "Arduino Начало", "Легкий", "Акан Аканов"))}
            role="link"
            tabIndex={0}
            className="bg-[#16161c] border border-[#636370]/20 rounded-2xl p-6 hover:border-[#636370]/40 transition-all duration-300 cursor-pointer group hover:scale-102 animate-slide-up"
            style={{ animationDelay: "1100ms" }}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-white text-lg font-medium mb-2">Arduino Начало</h3>
                <span className="inline-block bg-[#22c55e] text-black text-xs font-medium px-3 py-1 rounded-full">
                  Легкий
                </span>
              </div>
              <ArrowUpRight className="w-6 h-6 text-[#a0a0b0] group-hover:text-white transition-colors duration-300" />
            </div>
            <div className="text-[#a0a0b0] text-sm space-y-1">
              <div>Автор: Акан Аканов</div>
              <div>Тем: 10</div>
              <div>Стоимость: 9.000₸</div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
