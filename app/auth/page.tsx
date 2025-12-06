"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import AuthCard from "@/components/auth-card"

export default function AuthPage() {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-emerald-50 to-blue-50 dark:from-slate-950 dark:to-slate-900">
      {/* Animated background with parallax effect */}
      <div className="absolute inset-0 -z-10">
        {/* Gradient background */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "linear-gradient(135deg, #0F172A 0%, #1B5E20 50%, #0F172A 100%)",
            filter: "blur(60px)",
            opacity: 0.4,
          }}
        />

        {/* Animated floating elements */}
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full mix-blend-multiply filter blur-xl opacity-20"
            style={{
              width: Math.random() * 200 + 100,
              height: Math.random() * 200 + 100,
              backgroundColor: i % 3 === 0 ? "#C8E6C9" : i % 3 === 1 ? "#FDD835" : "#89F7FE",
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              x: [0, Math.random() * 50 - 25],
              y: [0, Math.random() * 50 - 25],
            }}
            transition={{
              duration: Math.random() * 8 + 10,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "reverse",
            }}
          />
        ))}
      </div>

      {/* Blur overlay */}
      <div className="absolute inset-0 backdrop-blur-2xl -z-5 opacity-50" />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-8">
        {isLoaded && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-md"
          >
            <AuthCard isDark={true} />
          </motion.div>
        )}
      </div>

      {/* Decorative farmer animation in corner (on desktop) */}
      <motion.div
        className="hidden lg:block fixed bottom-8 right-8 text-6xl"
        animate={{ y: [0, 10] }}
        transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
      >
        👨‍🌾
      </motion.div>
    </div>
  )
}
