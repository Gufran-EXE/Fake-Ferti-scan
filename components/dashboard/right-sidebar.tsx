"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ChevronLeft, ChevronRight, AlertCircle, Phone } from 'lucide-react'
import { AnimatePresence } from "framer-motion"

export default function RightSidebar() {
  const [safetyTips] = useState([
    "Always verify QR codes with the government database",
    "Check expiry dates on fertilizer packaging",
    "Report suspicious products immediately",
    "Keep receipts for all purchases",
  ])

  const [newsIdx, setNewsIdx] = useState(0)

  const agriNews = [
    {
      title: "New Fertilizer Quality Standards Released",
      date: "2 days ago",
      icon: "📋",
    },
    {
      title: "Government Launches Farmer Education Program",
      date: "4 days ago",
      icon: "👨‍🎓",
    },
    {
      title: "Monsoon Season Preparation Tips",
      date: "1 week ago",
      icon: "🌧️",
    },
  ]

  return (
    <motion.aside
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="space-y-6 sticky top-24"
    >
      {/* Safety Tips */}
      <motion.div
        className="rounded-2xl backdrop-blur-xl border border-white/20 dark:border-white/10 p-6 overflow-hidden"
        style={{
          background: "var(--card)",
        }}
        whileHover={{ y: -2 }}
      >
        <div className="flex items-center gap-2 mb-4">
          <AlertCircle className="w-5 h-5 text-amber-500" />
          <h4 className="font-bold text-white">Safety Tips</h4>
        </div>

        <div className="space-y-3">
          {safetyTips.map((tip, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * idx }}
              className="flex gap-2 text-sm text-white/80 p-2 bg-amber-50 dark:bg-amber-900/10 rounded-lg"
            >
              <span className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5">•</span>
              <span>{tip}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Agri News Carousel */}
      <motion.div
        className="rounded-2xl backdrop-blur-xl border border-white/20 dark:border-white/10 p-6 overflow-hidden"
        style={{
          background: "var(--card)",
        }}
        whileHover={{ y: -2 }}
      >
        <h4 className="font-bold text-white mb-4">Agri News</h4>

        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={newsIdx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
            >
              <div className="text-3xl">{agriNews[newsIdx].icon}</div>
              <h5 className="font-semibold text-white text-sm">{agriNews[newsIdx].title}</h5>
              <p className="text-xs text-white/60">{agriNews[newsIdx].date}</p>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-4 gap-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setNewsIdx((newsIdx - 1 + agriNews.length) % agriNews.length)}
              className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-white dark:text-white" />
            </motion.button>
            <div className="flex gap-1">
              {agriNews.map((_, idx) => (
                <motion.div
                  key={idx}
                  className={`h-1 rounded-full transition-all ${
                    idx === newsIdx ? "w-6 bg-emerald-500" : "w-1 bg-slate-300 dark:bg-slate-600"
                  }`}
                />
              ))}
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setNewsIdx((newsIdx + 1) % agriNews.length)}
              className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-white dark:text-white" />
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Crime Support Floating Button */}
      <motion.button
        whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(16, 185, 129, 0.4)" }}
        whileTap={{ scale: 0.95 }}
        className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-gradient-to-r from-red-500 to-red-600 text-white font-bold text-lg hover:shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-red-500/50"
      >
        <Phone className="w-6 h-6" />
        <span className="text-sm sm:text-base">🚨 Crime Support</span>
      </motion.button>

      {/* Supportive message */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-xs text-white/70 text-center italic p-4 rounded-lg bg-slate-50 dark:bg-slate-800/30"
      >
        Report fraudulent products immediately to help protect other farmers.
      </motion.div>
    </motion.aside>
  )
}
