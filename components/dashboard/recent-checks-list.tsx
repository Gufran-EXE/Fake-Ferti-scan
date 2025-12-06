"use client"

import { motion } from "framer-motion"
import { Heart, Eye } from 'lucide-react'

interface RecentCheck {
  id: string
  productName: string
  registrationNo: string
  status: "verified" | "suspected"
  timestamp: string
  image: string
}

interface Favorite {
  id: string
  productName: string
  registrationNo: string
}

interface RecentChecksListProps {
  checks: RecentCheck[]
  favorites: Favorite[]
  onCheckClick: (check: RecentCheck) => void
  onToggleFavorite: (check: RecentCheck) => void
}

export default function RecentChecksList({ checks, favorites, onCheckClick, onToggleFavorite }: RecentChecksListProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="space-y-4"
    >
      <h3 className="text-lg font-bold text-white">Recent Checks</h3>

      <div className="space-y-3">
        {checks.map((check, idx) => {
          const isFavorited = favorites.some((fav) => fav.id === check.id)
          const isVerified = check.status === "verified"

          return (
            <motion.div
              key={check.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * idx }}
              className="rounded-xl backdrop-blur-xl border border-white/20 dark:border-white/10 p-4 hover:border-emerald-500/50 dark:hover:border-lime-500/50 transition-all group cursor-pointer overflow-hidden relative"
              style={{
                background: "var(--card)",
              }}
              onClick={() => onCheckClick(check)}
              whileHover={{ y: -2 }}
            >
              {/* Gradient background glow */}
              <div
                className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity ${
                  isVerified ? "bg-emerald-500" : "bg-red-500"
                }`}
              />

              <div className="relative flex items-start gap-4">
                {/* Product image */}
                <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <img
                    src={check.image || "/placeholder.svg"}
                    alt={check.productName}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h4 className="font-semibold text-white truncate">{check.productName}</h4>
                      <p className="text-sm text-white truncate">{check.registrationNo}</p>
                    </div>

                    {/* Status pill */}
                    <motion.div
                      className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                        isVerified
                          ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300"
                          : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                      }`}
                      animate={
                        isVerified
                          ? { scale: [1, 1.05, 1] }
                          : {
                              boxShadow: [
                                "0 0 0px rgba(239, 68, 68, 0)",
                                "0 0 10px rgba(239, 68, 68, 0.5)",
                                "0 0 0px rgba(239, 68, 68, 0)",
                              ],
                            }
                      }
                      transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                    >
                      {isVerified ? "✓ Verified" : "⚠ Suspected"}
                    </motion.div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between mt-3 text-xs text-white">
                    <span>{check.timestamp}</span>
                    <div className="flex items-center gap-2">
                      <motion.button
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.stopPropagation()
                          onToggleFavorite(check)
                        }}
                        className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
                        title={isFavorited ? "Remove favorite" : "Add to favorites"}
                      >
                        <Heart
                          className={`w-4 h-4 ${
                            isFavorited ? "fill-red-500 text-red-500" : "text-slate-400 dark:text-slate-500"
                          }`}
                        />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                          e.stopPropagation()
                          onCheckClick(check)
                        }}
                        className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
                        title="View details"
                      >
                        <Eye className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}
