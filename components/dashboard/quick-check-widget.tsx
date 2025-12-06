"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Search } from 'lucide-react'

export default function QuickCheckWidget() {
  const [input, setInput] = useState("")
  const [suggestions, setSuggestions] = useState<string[]>([])

  const mockSuggestions = [
    "GreenGrow NPK 20:20:20",
    "SoilMax Calcium",
    "OrganicPro Compost",
    "Micro Blend Plus",
    "PotassiumMax",
  ]

  const handleInputChange = (e: string) => {
    setInput(e)
    if (e.length > 0) {
      setSuggestions(mockSuggestions.filter((s) => s.toLowerCase().includes(e.toLowerCase())).slice(0, 3))
    } else {
      setSuggestions([])
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="rounded-2xl backdrop-blur-xl border border-white/20 dark:border-white/10 p-6 overflow-hidden relative"
      style={{
        background: "var(--card)",
      }}
    >
      {/* Gradient accent */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-lime-400/10 to-emerald-500/10 rounded-full blur-3xl -z-10" />

      <h3 className="text-lg font-bold text-white mb-4">Quick Check</h3>

      <div className="relative">
        <div className="flex gap-2">
          <motion.div className="flex-1 relative" animate={{ y: 0 }} transition={{ type: "spring", damping: 20 }}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={input}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="Enter reg. no. or product name..."
              className="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-white dark:text-white placeholder-white/40 dark:placeholder-white/40 focus:outline-none focus:border-emerald-500 dark:focus:border-lime-500 focus:ring-2 focus:ring-emerald-500/20 dark:focus:ring-lime-500/20 transition-all"
            />
          </motion.div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-lime-500 text-white font-semibold rounded-lg hover:shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          >
            Check
          </motion.button>
        </div>

        {/* Smart suggestions */}
        {suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-lg z-50 overflow-hidden"
          >
            {suggestions.map((suggestion, idx) => (
              <motion.button
                key={idx}
                onClick={() => {
                  setInput(suggestion)
                  setSuggestions([])
                }}
                className="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 text-white dark:text-white text-sm transition-colors"
                whileHover={{ x: 4 }}
              >
                {suggestion}
              </motion.button>
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
