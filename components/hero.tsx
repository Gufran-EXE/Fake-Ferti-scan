"use client"

import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import { useLanguage } from "@/lib/language-context"
import { translations } from "@/lib/translations"
import QRScanner from "./qr-scanner"
import { useRouter } from "next/navigation"

export default function Hero() {
  const { language } = useLanguage()
  const t = translations[language].hero
  const router = useRouter()
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isDark, setIsDark] = useState(false)
  const [isScannerOpen, setIsScannerOpen] = useState(false)

  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains("dark")
    setIsDark(isDarkMode)

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      <div className="absolute inset-0 -z-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: isDark
              ? "linear-gradient(135deg, #0F172A 0%, #1B5E20 50%, #0F172A 100%)"
              : "linear-gradient(135deg, #89F7FE 0%, #C8E6C9 50%, #FDD835 100%)",
          }}
        />

        {/* Animated particles with better performance */}
        {[...Array(25)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full"
            style={{
              backgroundColor: isDark ? "rgba(200, 230, 201, 0.4)" : "rgba(27, 94, 32, 0.3)",
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              x: [0, Math.random() * 100 - 50],
              y: [0, Math.random() * -200],
              opacity: [0.5, 0],
            }}
            transition={{
              duration: Math.random() * 3 + 4,
              repeat: Number.POSITIVE_INFINITY,
              repeatDelay: Math.random() * 2,
            }}
          />
        ))}

        {/* Parallax layers with depth */}
        <motion.div
          className="absolute inset-0 opacity-30"
          animate={{ y: [0, -20] }}
          transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
          style={{
            backgroundImage: "radial-gradient(circle at 20% 50%, rgba(200, 230, 201, 0.2), transparent 50%)",
          }}
        />
      </div>

      <motion.div
        className="absolute w-96 h-96 rounded-full blur-3xl -z-[1]"
        style={{
          backgroundColor: isDark ? "rgba(107, 78, 42, 0.15)" : "rgba(200, 230, 201, 0.3)",
        }}
        animate={{
          x: mousePosition.x - 192,
          y: mousePosition.y - 192,
        }}
        transition={{ type: "spring", damping: 30 }}
      />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <h1 className="text-5xl md:text-7xl font-bold text-balance mb-6">
            <span className="bg-gradient-to-r from-green-700 via-emerald-600 to-green-600 dark:from-lime-300 dark:via-green-300 dark:to-emerald-300 bg-clip-text text-transparent">
              {t.heading1}
            </span>
            <br />
            <span className="text-foreground">{t.heading2}</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">{t.subtext}</p>

          <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(253, 216, 53, 0.4)" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsScannerOpen(true)}
              className="px-8 py-4 bg-yellow-500 dark:bg-yellow-400 text-slate-900 font-semibold rounded-full text-lg hover:shadow-xl transition-shadow focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:ring-offset-2 dark:focus:ring-offset-slate-950"
              aria-label="Scan QR code to verify fertilizer"
            >
              {t.scanQR}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 border-2 border-emerald-400 dark:border-lime-400 text-emerald-700 dark:text-lime-300 font-semibold rounded-full text-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:ring-offset-2 dark:focus:ring-offset-slate-950"
              aria-label="Check fertilizer by registration"
            >
              {t.checkRegistration}
            </motion.button>
          </div>
        </motion.div>

        {/* Animated illustration */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="mt-16"
        >
          <div className="relative w-full max-w-2xl mx-auto h-80 bg-gradient-to-b from-emerald-200/40 dark:from-emerald-900/30 to-transparent rounded-3xl border border-emerald-200 dark:border-emerald-800/40 overflow-hidden backdrop-blur-sm">
            <motion.div
              animate={{ y: [-20, 20] }}
              transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
              className="absolute inset-0 flex items-center justify-center text-6xl"
            >
              🌾
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* QR Scanner Modal */}
      <QRScanner
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanSuccess={(decodedText) => {
          console.log("QR Code scanned:", decodedText)
          // Redirect to home page after successful scan
          router.push("/")
        }}
      />
    </section>
  )
}
