"use client"

import { motion } from "framer-motion"

export function ThemeToggle({ isDark, onToggle }: { isDark: boolean; onToggle: () => void }) {
  return (
    <motion.button
      onClick={onToggle}
      className="fixed top-6 right-6 z-50 p-3 rounded-full bg-white dark:bg-slate-800 shadow-lg border border-emerald-200 dark:border-emerald-800/40 text-slate-900 dark:text-white hover:shadow-xl transition-shadow"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      aria-label="Toggle theme"
    >
      {isDark ? "☀️" : "🌙"}
    </motion.button>
  )
}
