"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Bell, Search, Globe } from 'lucide-react'

interface DashboardHeaderProps {
  isDark: boolean
}

export default function DashboardHeader({ isDark }: DashboardHeaderProps) {
  const router = useRouter()
  const [notifications, setNotifications] = useState(3)
  const [language, setLanguage] = useState<"en" | "hi">("en")

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="sticky top-0 z-40 border-b border-white/20 dark:border-white/10 backdrop-blur-md"
      style={{
        background: isDark ? "rgba(15, 23, 42, 0.7)" : "rgba(255, 255, 255, 0.7)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <motion.div 
            whileHover={{ scale: 1.05 }} 
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => router.push('/')}
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-lime-500 flex items-center justify-center text-white font-bold">
              ✓
            </div>
            <span className="font-bold text-lg hidden sm:inline text-white">FertCheck</span>
          </motion.div>

          {/* Search */}
          <div className="hidden md:flex flex-1 max-w-md items-center gap-2 bg-slate-100 dark:bg-slate-800/50 rounded-full px-4 py-2">
            <Search className="w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search products..."
              className="flex-1 bg-transparent text-sm placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none text-white dark:text-white"
            />
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            {/* Language toggle */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setLanguage(language === "en" ? "hi" : "en")}
              className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors"
              title="Toggle language"
            >
              <Globe className="w-5 h-5 text-white dark:text-white" />
            </motion.button>

            {/* Notifications */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors"
              title="Notifications"
            >
              <Bell className="w-5 h-5 text-white dark:text-white" />
              {notifications > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-semibold"
                >
                  {notifications}
                </motion.span>
              )}
            </motion.button>

            {/* Avatar */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-lime-400 flex items-center justify-center text-white font-bold cursor-pointer"
            >
              👨
            </motion.div>
          </div>
        </div>
      </div>
    </motion.header>
  )
}
