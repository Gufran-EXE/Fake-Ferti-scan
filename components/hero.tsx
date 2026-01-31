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
  const [windowWidth, setWindowWidth] = useState(1200)
  const [isRegModalOpen, setIsRegModalOpen] = useState(false)
  const [regNumber, setRegNumber] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // Mock product data - same as dashboard
  const mockProducts = {
    "REG-2024-001": {
      id: "REG-2024-001",
      name: "XYZ Fertilizer",
      type: "Fo2e ted",
      composition: "NPK 10:10:10",
      manufacturer: "XYZ Fertilizer Ltd.",
      batch: "2024-001",
      expiry: "Dec 2025",
      status: "verified",
      image: "/fertilizer-green-package.jpg"
    },
    "REG-2024-002": {
      id: "REG-2024-002", 
      name: "ABC Organic Fertilizer",
      type: "Organic",
      composition: "NPK 15:15:15",
      manufacturer: "ABC Organic Ltd.",
      batch: "2024-002",
      expiry: "Nov 2025",
      status: "verified",
      image: "/organic-fertilizer.jpg"
    }
  }

  const handleRegCheck = () => {
    console.log("handleRegCheck called with:", regNumber)
    
    if (!regNumber.trim()) {
      alert("Please enter a registration number")
      return
    }

    setIsLoading(true)
    
    // Simulate API call
    setTimeout(() => {
      const product = mockProducts[regNumber.toUpperCase()]
      console.log("Looking for product:", regNumber.toUpperCase())
      console.log("Found product:", product)
      
      if (product) {
        // Store product data and redirect to a results page
        localStorage.setItem('regCheckResult', JSON.stringify(product))
        console.log("Redirecting to results page")
        router.push('/reg-check-result')
      } else {
        alert("Registration number not found. Try: REG-2024-001 or REG-2024-002")
      }
      
      setIsLoading(false)
      setIsRegModalOpen(false)
      setRegNumber("")
    }, 1500)
  }

  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains("dark")
    setIsDark(isDarkMode)
    
    setWindowWidth(window.innerWidth)
    const handleResize = () => setWindowWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener('resize', handleResize)
    }
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
              left: `${(i * 37) % 100}%`,
              top: `${(i * 23) % 100}%`,
            }}
            animate={{
              x: [0, (i * 13) % 100 - 50],
              y: [0, -((i * 17) % 200)],
              opacity: [0.5, 0],
            }}
            transition={{
              duration: (i % 3) + 4,
              repeat: Number.POSITIVE_INFINITY,
              repeatDelay: (i % 2),
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
              onClick={() => setIsRegModalOpen(true)}
              className="px-8 py-4 border-2 border-emerald-400 dark:border-lime-400 text-emerald-700 dark:text-lime-300 font-semibold rounded-full text-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:ring-offset-2 dark:focus:ring-offset-slate-950"
              aria-label="Check fertilizer by registration"
            >
              {t.checkRegistration}
            </motion.button>
          </div>
        </motion.div>

        {/* Animated illustration with carousel */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="mt-16"
        >
          <div className="relative w-full max-w-5xl mx-auto h-[500px] bg-gradient-to-b from-emerald-200/40 dark:from-emerald-900/30 to-transparent rounded-3xl border border-emerald-200 dark:border-emerald-800/40 overflow-hidden backdrop-blur-sm">
            {/* Image Carousel with Blur Transitions */}
            <div className="relative w-full h-full">
              {/* All images positioned absolutely for fade effect */}
              {[
                { src: "/1.png", alt: "Login Interface" },
                { src: "/2.png", alt: "Genuine vs Fake Detection" },
                { src: "/3.png", alt: "Fertiscan App" },
                { src: "/4.png", alt: "QR Scanning" },
                { src: "/5.png", alt: "Happy Farmer" },
              ].map((image, index) => (
                <motion.div
                  key={index}
                  className="absolute inset-0 flex items-center justify-center p-2"
                  animate={{
                    opacity: [0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0],
                    filter: [
                      "blur(10px)",
                      "blur(5px)", 
                      "blur(0px)",
                      "blur(0px)",
                      "blur(5px)",
                      "blur(10px)",
                      "blur(10px)",
                      "blur(10px)",
                      "blur(10px)",
                      "blur(10px)",
                      "blur(10px)"
                    ],
                  }}
                  transition={{
                    duration: 10, // Total cycle time (2s * 5 images)
                    repeat: Number.POSITIVE_INFINITY,
                    delay: index * 2, // Each image starts 2s after the previous
                    ease: "easeInOut",
                  }}
                >
                  <img
                    src={image.src}
                    alt={image.alt}
                    className="w-full h-full object-contain rounded-2xl shadow-2xl"
                    onError={(e) => {
                      if (index === 0) e.currentTarget.src = "/fertilizer-application.png"
                    }}
                  />
                </motion.div>
              ))}
              
              {/* Carousel indicators */}
              <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3">
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-3 h-3 rounded-full bg-white/60 backdrop-blur-sm"
                    animate={{
                      backgroundColor: [
                        "rgba(255,255,255,0.6)",
                        "rgba(34,197,94,1)",
                        "rgba(255,255,255,0.6)",
                        "rgba(255,255,255,0.6)",
                        "rgba(255,255,255,0.6)",
                        "rgba(255,255,255,0.6)",
                      ],
                      scale: [1, 1.4, 1, 1, 1, 1],
                    }}
                    transition={{
                      duration: 10,
                      repeat: Number.POSITIVE_INFINITY,
                      delay: i * 2,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Registration Check Modal */}
      {isRegModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-900 rounded-2xl p-8 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-700"
          >
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 text-center">
              Check Registration Number
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Registration Number
                </label>
                <input
                  type="text"
                  value={regNumber}
                  onChange={(e) => setRegNumber(e.target.value)}
                  placeholder="Enter registration number (e.g., REG-2024-001)"
                  className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 dark:focus:border-lime-500 transition-all"
                  onKeyPress={(e) => e.key === 'Enter' && handleRegCheck()}
                />
              </div>
              
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Try demo numbers: REG-2024-001 or REG-2024-002
              </p>
              
              <div className="flex gap-3 pt-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleRegCheck}
                  disabled={isLoading}
                  className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-lime-500 text-white font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-70 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Checking...
                    </span>
                  ) : (
                    "Check Registration"
                  )}
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setIsRegModalOpen(false)
                    setRegNumber("")
                  }}
                  className="px-6 py-3 border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-semibold rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                >
                  Cancel
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

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
