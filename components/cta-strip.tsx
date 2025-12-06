"use client"

import type React from "react"
import { motion } from "framer-motion"
import { useState } from "react"
import { AnimatePresence } from "framer-motion"

const suggestions = ["REG-2024-001", "Golden Harvest NPK 20-20-20", "Soil Guard Premium", "Terra Green Organic"]

export default function CTAStrip() {
  const [input, setInput] = useState("")
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInput(value)

    if (value.length > 0) {
      const filtered = suggestions.filter((s) => s.toLowerCase().includes(value.toLowerCase()))
      setFilteredSuggestions(filtered)
      setShowSuggestions(true)
    } else {
      setShowSuggestions(false)
    }
  }

  return (
    <motion.section
      className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-emerald-900 dark:from-slate-900 to-emerald-800/90 dark:to-slate-800/90 backdrop-blur-md border-t border-emerald-700/50 dark:border-slate-700 z-50"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ delay: 0.5 }}
    >
      <div className="container mx-auto max-w-5xl px-4 py-4 flex flex-col md:flex-row gap-3 items-stretch md:items-center">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Enter registration no. or product name..."
            value={input}
            onChange={handleInputChange}
            onFocus={() => input.length > 0 && setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            className="w-full px-4 py-3 rounded-lg bg-white/10 dark:bg-slate-700/20 border border-emerald-300/30 dark:border-slate-600/30 text-white placeholder-emerald-200/60 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 backdrop-blur-sm transition-all"
          />

          {/* Smart suggestions dropdown */}
          <AnimatePresence>
            {showSuggestions && filteredSuggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute bottom-full left-0 right-0 mb-2 bg-slate-800/95 dark:bg-slate-900/95 border border-emerald-600/30 rounded-lg overflow-hidden shadow-lg"
              >
                {filteredSuggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setInput(suggestion)
                      setShowSuggestions(false)
                    }}
                    className="w-full text-left px-4 py-2 text-white/80 hover:bg-emerald-600/30 dark:hover:bg-emerald-700/30 transition-colors text-sm focus:outline-none focus:bg-emerald-600/30"
                  >
                    {suggestion}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 dark:from-yellow-500 dark:to-yellow-600 text-slate-900 font-semibold rounded-lg hover:shadow-lg hover:shadow-yellow-400/50 transition-shadow whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
        >
          Quick Check
        </motion.button>
      </div>

      {/* Accessibility: reduced motion support */}
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </motion.section>
  )
}
