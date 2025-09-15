"use client"

import { useState } from "react"
import { Eye, ExternalLink, ArrowLeft, Play } from "lucide-react"

interface Course {
  id: number
  title: string
  views: number
  tag: string
  tagColor: string
  videoUrl?: string
  description?: string
}

export default function ByteSizeTab() {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const courses = [
    {
      id: 1,
      title: "Основы WRO",
      views: 990,
      tag: "Robotics",
      tagColor: "bg-[#00a3ff]",
      videoUrl: "/placeholder-video.mp4",
      description: "Изучите основы World Robot Olympiad и подготовьтесь к соревнованиям",
    },
    {
      id: 2,
      title: "FLL - Tools",
      views: 990,
      tag: "FIRST",
      tagColor: "bg-[#00a3ff]",
      videoUrl: "/placeholder-video.mp4",
      description: "Освойте инструменты для участия в FIRST LEGO League",
    },
    // Empty placeholder cards
    ...Array.from({ length: 6 }, (_, i) => ({
      id: i + 3,
      title: "",
      views: 0,
      tag: "",
      tagColor: "",
    })),
  ]

  const handleCourseClick = (course: Course) => {
    if (course.title) {
      setIsTransitioning(true)
      setTimeout(() => {
        setSelectedCourse(course)
        setIsTransitioning(false)
      }, 300)
    }
  }

  const handleBackClick = () => {
    setIsTransitioning(true)
    setTimeout(() => {
      setSelectedCourse(null)
      setIsTransitioning(false)
    }, 300)
  }

  if (selectedCourse) {
    return (
      <div
        className={`flex-1 p-4 md:p-8 transition-all duration-500 ease-out ${
          isTransitioning ? "opacity-0 scale-95" : "opacity-100 scale-100 animate-slide-up"
        }`}
      >
        {/* Back button */}
        <button
          onClick={handleBackClick}
          className="flex items-center space-x-2 text-[#a0a0b0] hover:text-white transition-all duration-300 mb-8 group hover:scale-105"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-2 transition-all duration-300" />
          <span className="group-hover:translate-x-1 transition-all duration-300">Back</span>
        </button>

        {/* Video player area */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-[#2a2a35] rounded-xl overflow-hidden mb-6 aspect-video flex items-center justify-center group cursor-pointer hover:bg-[#323242] transition-all duration-300 animate-fade-in-scale">
            <div className="text-center">
              <div className="w-20 h-20 bg-[#00a3ff] rounded-full flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-all duration-300">
                <Play className="w-8 h-8 text-white ml-1 transition-all duration-300" fill="currentColor" />
              </div>
            </div>
          </div>

          {/* Video title */}
          <div className="text-center animate-slide-up-delayed">
            <h2 className="text-white text-2xl md:text-3xl font-medium mb-4 hover:text-[#00a3ff] transition-colors duration-300">
              Видео
            </h2>
            <div className="flex items-center justify-center space-x-4 text-[#a0a0b0]">
              <div className="flex items-center space-x-2 hover:text-white transition-colors duration-300">
                <Eye className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                <span>{selectedCourse.views}</span>
              </div>
              <span
                className={`${selectedCourse.tagColor} text-white text-sm px-3 py-1 rounded-full font-medium hover:scale-110 group-hover:shadow-lg transition-all duration-300 cursor-pointer`}
              >
                {selectedCourse.tag}
              </span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`flex-1 p-4 md:p-8 transition-all duration-500 ease-out ${
        isTransitioning ? "opacity-0 scale-95" : "opacity-100 scale-100 animate-slide-up"
      }`}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {courses.map((course, index) => (
          <div
            key={course.id}
            className={`bg-[#2a2a35] rounded-xl p-6 transition-all duration-300 hover:bg-[#323242] group cursor-pointer animate-slide-up border border-transparent hover:border-[#00a3ff]/30 ${
              course.title ? "hover:scale-102 hover:shadow-lg hover:shadow-[#00a3ff]/10" : ""
            }`}
            style={{ animationDelay: `${index * 150}ms` }}
            onClick={() => handleCourseClick(course)}
          >
            {course.title ? (
              <>
                {/* Course content */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-2 text-[#a0a0b0] group-hover:text-white transition-colors duration-300">
                    <Eye className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                    <span className="text-sm">{course.views}</span>
                  </div>
                  <ExternalLink className="w-5 h-5 text-[#a0a0b0] group-hover:text-[#00a3ff] group-hover:scale-125 group-hover:rotate-12 transition-all duration-300" />
                </div>

                <div className="mb-4">
                  <h3 className="text-white text-lg font-medium mb-3 group-hover:text-[#00a3ff] transition-all duration-300 group-hover:scale-105">
                    {course.title}
                  </h3>
                </div>

                <div className="flex justify-start">
                  <span
                    className={`${course.tagColor} text-white text-xs px-3 py-1 rounded-full font-medium group-hover:scale-110 group-hover:shadow-lg transition-all duration-300`}
                  >
                    {course.tag}
                  </span>
                </div>
              </>
            ) : (
              /* Empty placeholder card */
              <div className="h-full min-h-[120px] flex items-center justify-center opacity-30 group-hover:opacity-50 transition-opacity duration-300">
                <div className="w-full h-full bg-[#1a1a24] rounded-lg border-2 border-dashed border-[#636370]/30 group-hover:border-[#636370]/50 transition-colors duration-300"></div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
