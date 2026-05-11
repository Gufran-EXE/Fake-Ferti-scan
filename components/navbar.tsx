"use client"

import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import { useLanguage } from "@/lib/language-context"
import { translations } from "@/lib/translations"

export default function Navbar() {
  const { language } = useLanguage()
  const t = translations[language].navbar
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains("dark")
    setIsDark(isDarkMode)

    // Listen for theme changes
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"))
    })
    observer.observe(document.documentElement, { attributes: true })
    return () => observer.disconnect()
  }, [])

  return (
    <nav className="fixed top-0 w-full z-50 backdrop-blur-md bg-background/80 border-b border-foreground/10">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => window.location.href = '/'}
        >
          <div className="text-2xl font-bold text-green-700 dark:text-emerald-400">🌾</div>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-foreground">{t.title}</p>
            <p className="text-xs text-muted-foreground">{t.subtitle}</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex items-center gap-1.5 sm:gap-2"
        >
          {/* Government Portal */}
          <motion.button
            onClick={() => (window.location.href = "/admin-login")}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            className="px-2.5 py-2 sm:px-4 sm:py-2.5 bg-slate-800 dark:bg-slate-900 text-emerald-400 font-semibold rounded-full text-xs sm:text-sm border border-emerald-500/30 hover:border-emerald-500/60 hover:shadow-lg hover:shadow-emerald-500/20 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
            aria-label="Government portal login"
          >
            <span className="sm:hidden">🏛️</span>
            <span className="hidden sm:inline">🏛️ Gov Portal</span>
          </motion.button>

          {/* Company Portal */}
          <motion.button
            onClick={() => (window.location.href = "/company-login")}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            className="px-2.5 py-2 sm:px-4 sm:py-2.5 bg-slate-800 dark:bg-slate-900 text-yellow-400 font-semibold rounded-full text-xs sm:text-sm border border-yellow-500/30 hover:border-yellow-500/60 hover:shadow-lg hover:shadow-yellow-500/20 transition-all focus:outline-none focus:ring-2 focus:ring-yellow-400/50"
            aria-label="Company portal login"
          >
            <span className="sm:hidden">🏢</span>
            <span className="hidden sm:inline">🏢 Company</span>
          </motion.button>

          {/* Verify Product */}
          <motion.button
            onClick={() => (window.location.href = "/verify")}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            className="px-3 py-2 sm:px-5 sm:py-2.5 bg-gradient-to-r from-yellow-500 to-yellow-400 dark:from-yellow-400 dark:to-yellow-300 text-slate-900 font-semibold rounded-full text-xs sm:text-sm hover:shadow-lg transition-shadow focus:outline-none focus:ring-2 focus:ring-yellow-400/50"
            aria-label="Verify a product"
          >
            <span className="sm:hidden">🔍</span>
            <span className="hidden sm:inline">🔍 Verify</span>
          </motion.button>
        </motion.div>
      </div>
    </nav>
  )
}
