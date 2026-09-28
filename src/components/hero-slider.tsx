'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ChevronRight, ChevronLeft, Camera, Video, MessageCircle, Smartphone } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const slides = [
  {
    id: 1,
    badge: 'Verified & Secure',
    title: 'Premium Social Media',
    subtitle: 'Accounts for Sale',
    graphic: () => (
      <div className="w-64 h-64 md:w-96 md:h-96 relative flex items-center justify-center">
        <div className="absolute top-10 left-10 w-20 h-20 bg-gradient-to-tr from-pink-500 to-orange-400 rounded-2xl flex items-center justify-center shadow-lg transform -rotate-12 animate-pulse">
          <Camera className="w-10 h-10 text-white" />
        </div>
        <div className="absolute bottom-10 left-20 w-24 h-24 bg-red-600 rounded-full flex items-center justify-center shadow-lg transform rotate-6">
          <Video className="w-12 h-12 text-white" />
        </div>
        <div className="absolute top-20 right-10 w-20 h-20 bg-black rounded-2xl flex items-center justify-center shadow-lg transform rotate-12">
          <span className="text-white font-black text-4xl">𝕏</span>
        </div>
        <div className="absolute bottom-20 right-20 w-16 h-16 bg-[#5865F2] rounded-2xl flex items-center justify-center shadow-lg transform -rotate-6">
          <MessageCircle className="w-8 h-8 text-white" />
        </div>
      </div>
    )
  },
  {
    id: 2,
    badge: 'High Engagement',
    title: 'Monetized YouTube',
    subtitle: 'Channels Ready',
    graphic: () => (
      <div className="w-64 h-64 md:w-96 md:h-96 relative flex items-center justify-center">
        <div className="absolute inset-0 bg-red-50 rounded-full blur-3xl opacity-50"></div>
        <div className="relative z-10 w-48 h-32 bg-white rounded-3xl shadow-xl flex items-center justify-center border-4 border-red-100">
          <Video className="w-20 h-20 text-red-600" />
        </div>
        <div className="absolute bottom-20 left-10 w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-md transform -rotate-12">
          <span className="text-2xl font-bold text-green-600">$</span>
        </div>
      </div>
    )
  },
  {
    id: 3,
    badge: 'Viral Potential',
    title: 'Established TikTok',
    subtitle: 'Accounts For Brands',
    graphic: () => (
      <div className="w-64 h-64 md:w-96 md:h-96 relative flex items-center justify-center">
        <div className="absolute inset-0 bg-blue-50 rounded-full blur-3xl opacity-50"></div>
        <div className="relative z-10 w-32 h-56 bg-black rounded-3xl shadow-2xl flex flex-col items-center justify-center border-2 border-gray-800">
           <Smartphone className="w-12 h-12 text-white mb-2" />
           <div className="w-16 h-1 bg-gray-600 rounded-full"></div>
        </div>
        <div className="absolute top-20 right-20 w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg animate-bounce">
           <span className="text-xl font-bold text-pink-500">1M+</span>
        </div>
      </div>
    )
  }
]

export function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length)
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)

  return (
    <div className="relative bg-gradient-to-br from-blue-50 via-white to-blue-100 w-full min-h-[500px] flex items-center justify-center overflow-hidden">
      {/* Subtle geometric background pattern */}
      <div className="absolute inset-0 opacity-5 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdib3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNNTQuNjI3IDU0LjYyN0wyMCAyMEwxMCAzMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utd2lkdGg9IjIiLz48L3N2Zz4=')] mix-blend-overlay"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col md:flex-row items-center relative z-10">
        
        <button onClick={prevSlide} className="hidden md:flex absolute left-4 w-10 h-10 items-center justify-center text-blue-300 hover:text-blue-600 transition z-50">
          <ChevronLeft className="w-8 h-8" />
        </button>
        
        <button onClick={nextSlide} className="hidden md:flex absolute right-4 w-10 h-10 items-center justify-center text-blue-300 hover:text-blue-600 transition z-50">
          <ChevronRight className="w-8 h-8" />
        </button>

        <AnimatePresence mode="wait">
          <motion.div 
            key={currentSlide}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.5 }}
            className="w-full flex flex-col md:flex-row items-center"
          >
            {/* Graphic Representation */}
            <div className="w-full md:w-1/2 flex justify-center py-10 md:py-0 relative">
              {slides[currentSlide].graphic()}
            </div>

            {/* Text Content */}
            <div className="w-full md:w-1/2 text-center md:text-left text-gray-900 md:pl-12 py-10 md:py-0">
              <p className="text-blue-600 font-bold tracking-wide mb-2 uppercase text-sm">
                {slides[currentSlide].badge}
              </p>
              <h1 className="text-4xl md:text-5xl font-light mb-2 leading-tight">
                {slides[currentSlide].title}
              </h1>
              <h2 className="text-4xl md:text-6xl font-black text-blue-900 mb-8">
                {slides[currentSlide].subtitle}
              </h2>
              <Link href="/shop" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3 rounded-full text-sm tracking-wider shadow-md transition transform hover:scale-105">
                BROWSE ACCOUNTS
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Slide Indicators */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
          {slides.map((_, i) => (
            <button 
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`w-2 h-2 rounded-full transition-all ${i === currentSlide ? 'bg-blue-600 w-6' : 'bg-blue-200 hover:bg-blue-400'}`}
            />
          ))}
        </div>

      </div>
    </div>
  )
}
