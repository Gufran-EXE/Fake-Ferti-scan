"use client"

import { motion } from "framer-motion"
import { useState, useEffect } from "react"

const features = [
  {
    id: 1,
    name: "Golden Harvest",
    status: "Verified",
    composition: "NPK 20-20-20",
    image: "🌽",
  },
  {
    id: 2,
    name: "Terra Premium",
    status: "Verified",
    composition: "NPK 15-15-15",
    image: "🌱",
  },
  {
    id: 3,
    name: "Soil Guard",
    status: "Suspected",
    composition: "NPK Unknown",
    image: "⚠️",
  },
  {
    id: 4,
    name: "Green Growth",
    status: "Verified",
    composition: "Organic Blend",
    image: "🍃",
  },
  {
    id: 5,
    name: "Agro Blend",
    status: "Verified",
    composition: "NPK 10-10-10",
    image: "🌾",
  },
]

export default function FeatureSlider() {
  const [current, setCurrent] = useState(0)
  const [autoPlay, setAutoPlay] = useState(true)

  useEffect(() => {
    if (!autoPlay) return
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % features.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [autoPlay])

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-background via-emerald-50/30 dark:via-emerald-950/20 to-background">
      <div className="container mx-auto max-w-6xl">
        <h2 className="text-4xl font-bold text-center mb-4 text-foreground text-balance">
          Verified Fertilizer Showcase
        </h2>
        <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
          Browse verified products and check authenticity status in real-time
        </p>

        <div className="relative">
          {/* Cards carousel */}
          <div className="flex justify-center items-center gap-4 overflow-hidden h-96">
            <AnimatedCards current={current} features={features} />
          </div>

          <div className="flex justify-center gap-3 mt-8">
            {features.map((_, idx) => (
              <motion.button
                key={idx}
                onClick={() => {
                  setCurrent(idx)
                  setAutoPlay(false)
                }}
                className={`h-3 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:ring-offset-2 dark:focus:ring-offset-slate-900 ${
                  idx === current ? "bg-emerald-600 dark:bg-emerald-400 w-8" : "bg-emerald-200 dark:bg-emerald-700 w-3"
                }`}
                whileHover={{ scale: 1.2 }}
                aria-label={`Show product ${idx + 1}`}
                aria-current={idx === current}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function AnimatedCards({ current, features }: any) {
  return (
    <motion.div className="flex gap-4 w-full justify-center">
      {features.map((feature: any, idx: number) => {
        const offset = (idx - current) * 100
        const isCenter = idx === current

        return (
          <motion.div
            key={feature.id}
            initial={{ x: offset, opacity: 0.5 }}
            animate={{
              x: offset - (idx - current) * 20,
              opacity: isCenter ? 1 : 0.4,
              scale: isCenter ? 1 : 0.8,
            }}
            transition={{ type: "spring", stiffness: 200, damping: 30 }}
            className={`flex-shrink-0 w-72 ${isCenter ? "cursor-grab" : "cursor-pointer"}`}
          >
            <motion.div
              className={`h-80 rounded-2xl p-6 backdrop-blur-sm transition-all ${
                isCenter
                  ? "bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/40 dark:to-emerald-800/40 shadow-2xl ring-2 ring-emerald-400 dark:ring-emerald-500"
                  : "bg-white/40 dark:bg-slate-800/40 shadow-lg"
              }`}
              whileHover={isCenter ? { y: -10 } : {}}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-5xl">{feature.image}</span>
                <motion.span
                  className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${
                    feature.status === "Verified"
                      ? "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300"
                      : "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300"
                  }`}
                  animate={
                    feature.status === "Verified"
                      ? {
                          boxShadow: ["0 0 0 0 rgba(34, 197, 94, 0.4)", "0 0 0 10px rgba(34, 197, 94, 0)"],
                        }
                      : {
                          boxShadow: ["0 0 0 0 rgba(217, 119, 6, 0.4)", "0 0 0 10px rgba(217, 119, 6, 0)"],
                        }
                  }
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                >
                  {feature.status === "Verified" ? "✓" : "⚠"} {feature.status}
                </motion.span>
              </div>

              <h3 className="text-2xl font-bold mb-2 text-foreground">{feature.name}</h3>
              <p className="text-muted-foreground mb-6 text-sm">{feature.composition}</p>

              {isCenter && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="w-full mt-auto bg-emerald-600 dark:bg-emerald-500 text-white py-2 rounded-lg font-semibold hover:bg-emerald-700 dark:hover:bg-emerald-600 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
                >
                  View Details
                </motion.button>
              )}
            </motion.div>
          </motion.div>
        )
      })}
    </motion.div>
  )
}
