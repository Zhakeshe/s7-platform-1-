"use client"
import { useState, useEffect } from "react"
import Sidebar from "@/components/sidebar"
import HomeTab from "@/components/tabs/home-tab"
import CoursesTab from "@/components/tabs/courses-tab"
import TeamsTab from "@/components/tabs/teams-tab"
import S7ToolsTab from "@/components/tabs/s7-tools-tab"
import MasterclassTab from "@/components/tabs/masterclass-tab"
import ProfileTab from "@/components/tabs/profile-tab"
import ByteSizeTab from "@/components/tabs/bytesize-tab"
import FooterSocial from "@/components/footer-social"
import CourseDetailsTab from "@/components/tabs/course-details-tab"
import type { CourseDetails } from "@/components/tabs/course-details-tab"
import CourseLessonTab from "@/components/tabs/course-lesson-tab"
import ProfileDropdown from "@/components/kokonutui/profile-dropdown"
import { useConfirm } from "@/components/ui/confirm"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth/auth-context"

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("home")
  const [currentDate, setCurrentDate] = useState("")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<CourseDetails | null>(null)
  const [selectedModuleId, setSelectedModuleId] = useState<string | number | null>(null)
  const [selectedLessonId, setSelectedLessonId] = useState<string | number | null>(null)
  const { user, logout, loading } = useAuth() as any
  const confirm = useConfirm()
  const router = useRouter()

  useEffect(() => {
    const updateDate = () => {
      const now = new Date()
      const months = [
        "Января",
        "Февраля",
        "Марта",
        "Апреля",
        "Мая",
        "Июня",
        "Июля",
        "Августа",
        "Сентября",
        "Октября",
        "Ноября",
        "Декабря",
      ]
      const day = now.getDate()
      const month = months[now.getMonth()]
      setCurrentDate(`${day} ${month}`)
    }

    updateDate()
    const interval = setInterval(updateDate, 24 * 60 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/")
    }
  }, [loading, user, router])

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.classList.add("mobile-menu-open")
    } else {
      document.body.classList.remove("mobile-menu-open")
    }

    return () => {
      document.body.classList.remove("mobile-menu-open")
    }
  }, [isMobileMenuOpen])

  const handleOpenCourse = (course: CourseDetails) => {
    setSelectedCourse(course)
    setActiveTab("course-details")
  }

  const handleOpenLesson = (course: CourseDetails, moduleId: string | number, lessonId: string | number) => {
    setSelectedCourse(course)
    setSelectedModuleId(moduleId)
    setSelectedLessonId(lessonId)
    setActiveTab("lesson-details")
  }

  const getTabTitle = (tab: string) => {
    switch (tab) {
      case "home":
        return "Главная"
      case "courses":
        return "Курсы"
      case "course-details":
        return "Курсы"
      case "lesson-details":
        return "Курсы"
      case "s7-tools":
        return "S7 Tool"
      case "teams":
        return "Команды"
      case "profile":
        return "Профиль"
      case "masterclass":
        return "Мастерклассы"
      case "bytesize":
        return "Byte Size"
      default:
        return "Главная"
    }
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case "home":
        return <HomeTab onOpenCourse={handleOpenCourse} />
      case "courses":
        return <CoursesTab onOpenCourse={handleOpenCourse} />
      case "course-details":
        return (
          <CourseDetailsTab
            course={selectedCourse}
            onBack={() => setActiveTab("courses")}
            onOpenLesson={(moduleId, lessonId) => selectedCourse && handleOpenLesson(selectedCourse, moduleId, lessonId)}
          />
        )
      case "lesson-details":
        return (
          <CourseLessonTab
            course={selectedCourse}
            moduleId={selectedModuleId}
            lessonId={selectedLessonId}
            onBack={() => setActiveTab("course-details")}
          />
        )
      case "s7-tools":
        return <S7ToolsTab />
      case "teams":
        return <TeamsTab />
      case "masterclass":
        return <MasterclassTab />
      case "profile":
        return <ProfileTab />
      case "bytesize":
        return <ByteSizeTab />
      default:
        return <HomeTab />
    }
  }

  return (
    <div className="min-h-screen bg-[#0e0e12] flex flex-col md:flex-row relative">
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="md:hidden fixed top-4 left-4 z-50 text-white p-2 bg-[#16161c] hover:bg-[#636370]/20 rounded-lg transition-all duration-300 border border-[#636370]/20 hover:border-[#636370]/40 shadow-lg"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <Sidebar
        activeTab={activeTab === "course-details" || activeTab === "lesson-details" ? "courses" : activeTab}
        onTabChange={setActiveTab}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        onCollapseChange={setIsSidebarCollapsed}
      />

      {/* Main Content */}
      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? "md:ml-16" : "md:ml-64"
        }`}
      >
        {/* Header */}
        <header className="bg-[#16161c] border-b border-[#636370]/20 px-4 md:px-8 py-4 md:py-6 flex items-center gap-4 animate-slide-up relative z-10">
          <div className="flex items-center">
            <h1 className="text-white text-xl md:text-2xl font-medium ml-12 md:ml-0">{getTabTitle(activeTab)}</h1>
          </div>
          
          <div className="ml-auto flex items-center gap-4">
            <div className="text-right">
              <div className="text-white text-lg md:text-xl font-medium">{currentDate}</div>
              <div className="text-[#a0a0b0] text-sm">2025</div>
            </div>
            <ProfileDropdown
              data={{ name: user?.fullName || user?.email || "Профиль", email: user?.email || "", avatar: "/logo-s7.png", xp: user?.xp || 0 }}
              onLogout={async () => {
                const ok = await confirm({ preset: 'logout' })
                if (!ok) return
                await logout()
                router.replace('/')
              }}
            />
          </div>
        </header>

        <div className="flex-1 pb-20 md:pb-0">{renderTabContent()}</div>
      </div>

      <FooterSocial />
    </div>
  )
}
