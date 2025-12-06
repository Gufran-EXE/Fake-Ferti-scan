"use client"

import { motion } from "framer-motion"
import { useInView } from "react-intersection-observer"
import { useEffect, useState } from "react"

const stats = [
  { label: "Verified Fertilizers", target: 0, suffix: "+" },
  { label: "Suspected Fakes", target: 0, suffix: "+" },
  { label: "Regions Covered", target: 0, suffix: "" },
  { label: "Reports Filed", target: 0, suffix: "+" },
]

function Counter({ target, suffix }: { target: number; suffix: string }) {
  const [count, setCount] = useState(0)
  const { ref, inView } = useInView({ threshold: 0.5 })

  useEffect(() => {
    if (!inView) return

    const duration = 2000
    const increment = target / (duration / 50)
    let current = 0

    const timer = setInterval(() => {
      current += increment
      if (current >= target) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(Math.floor(current))
      }
    }, 50)

    return () => clearInterval(timer)
  }, [inView, target])

  return (
    <span ref={ref}>
      {count.toLocaleString()}
      {suffix}
    </span>
  )
}

export default function LiveStats() {
  const { ref, inView } = useInView({ threshold: 0.3 })

  return (
    <section
      ref={ref}
      className="py-20 px-4 bg-gradient-to-r from-emerald-600 dark:from-emerald-900/50 via-green-600 dark:via-emerald-800/50 to-emerald-600 dark:to-emerald-900/50"
    >
      <div className="container mx-auto max-w-5xl">
        <h2 className="text-4xl font-bold text-center mb-4 text-white text-balance">Live Verification Stats</h2>
        <p className="text-center text-emerald-100 mb-12 max-w-2xl mx-auto">
          Real-time statistics from our verification system
        </p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={inView ? { scale: 1, opacity: 1 } : { scale: 0.8, opacity: 0 }}
              transition={{ delay: idx * 0.1, duration: 0.6 }}
              className="text-center p-6 bg-white/10 dark:bg-slate-800/20 backdrop-blur-sm rounded-lg border border-white/20 hover:bg-white/20 dark:hover:bg-slate-800/30 transition-colors"
            >
              <div className="text-5xl font-bold text-white mb-2">
                <Counter target={stat.target} suffix={stat.suffix} />
              </div>
              <p className="text-emerald-100 text-sm font-medium">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
