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
          className="flex items-center gap-3"
        >
          <motion.button
            onClick={() => (window.location.href = "/admin-login")}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 bg-slate-800 dark:bg-slate-900 text-emerald-400 font-semibold rounded-full text-sm border border-emerald-500/30 hover:border-emerald-500/60 hover:shadow-lg hover:shadow-emerald-500/20 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:ring-offset-2 dark:focus:ring-offset-slate-950"
            aria-label="Admin portal login"
          >
            {t.admin}
          </motion.button>
          <motion.button
            onClick={() => (window.location.href = "/auth")}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-2 bg-gradient-to-r from-yellow-500 to-yellow-400 dark:from-yellow-400 dark:to-yellow-300 text-slate-900 font-semibold rounded-full text-sm hover:shadow-lg transition-shadow focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:ring-offset-2 dark:focus:ring-offset-slate-950"
            aria-label="Login to your account"
          >
            {t.login}
          </motion.button>
        </motion.div>
      </div>
    </nav>
  )
}
