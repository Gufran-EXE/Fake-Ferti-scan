"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useLanguage } from "@/lib/language-context"
import { translations } from "@/lib/translations"

export default function Footer() {
  const { language, setLanguage } = useLanguage()
  const t = translations[language].footer
  const [windowWidth, setWindowWidth] = useState(1200)

  useEffect(() => {
    setWindowWidth(window.innerWidth)
    const handleResize = () => setWindowWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <footer className="relative bg-slate-900 dark:bg-black text-white pt-32 pb-20 mt-32 overflow-hidden">
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-3xl opacity-20 pointer-events-none"
          animate={{
            x: [-100, windowWidth + 100],
            y: [Math.random() * 100, Math.random() * 100],
            rotate: [0, 360],
          }}
          transition={{
            duration: 15 + i * 2,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
          style={{
            left: `${i * 15}%`,
            top: `${Math.random() * 50}%`,
          }}
        >
          🍃
        </motion.div>
      ))}

      <div className="container mx-auto max-w-5xl px-4 relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12"
        >
          {/* Brand */}
          <motion.div variants={itemVariants}>
            <h3 className="text-2xl font-bold mb-4 text-balance">{t.brand}</h3>
            <p className="text-slate-400 text-sm">{t.brandDesc}</p>
          </motion.div>

          {/* Quick Links */}
          <motion.div variants={itemVariants}>
            <h4 className="font-semibold mb-4">{t.quickLinks}</h4>
            <ul className="space-y-2 text-slate-400 text-sm">
              <li>
                <a href="#" className="hover:text-white transition-colors focus:outline-none focus:text-white">
                  {t.home}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors focus:outline-none focus:text-white">
                  {t.about}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors focus:outline-none focus:text-white">
                  {t.contact}
                </a>
              </li>
            </ul>
          </motion.div>

          {/* Resources */}
          <motion.div variants={itemVariants}>
            <h4 className="font-semibold mb-4">{t.resources}</h4>
            <ul className="space-y-2 text-slate-400 text-sm">
              <li>
                <a href="#" className="hover:text-white transition-colors focus:outline-none focus:text-white">
                  {t.faq}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors focus:outline-none focus:text-white">
                  {t.helpCenter}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors focus:outline-none focus:text-white">
                  {t.blog}
                </a>
              </li>
            </ul>
          </motion.div>

          {/* Contact */}
          <motion.div variants={itemVariants}>
            <h4 className="font-semibold mb-4">{t.support}</h4>
            <div className="space-y-2">
              <p className="text-slate-400 text-sm">
                {t.helpline} <span className="text-emerald-400 font-semibold">1-800-VERIFY</span>
              </p>
              <p className="text-slate-400 text-sm">
                {t.email} <span className="text-emerald-400 font-semibold">gufran2098@gmail.com</span>
              </p>
            </div>
          </motion.div>
        </motion.div>

        {/* Bottom section */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-slate-800 gap-4"
        >
          <div className="flex gap-2">
            {["EN", "HI"].map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang as "EN" | "HI")}
                className={`px-4 py-2 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:ring-offset-2 focus:ring-offset-slate-900 ${
                  language === lang ? "bg-emerald-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"
                }`}
                aria-label={`Switch to ${lang === "EN" ? "English" : "Hindi"}`}
                aria-pressed={language === lang}
              >
                {lang}
              </button>
            ))}
          </div>

          {/* Social icons */}
          <div className="flex gap-4 text-2xl">
            <motion.a href="#" whileHover={{ scale: 1.2 }} aria-label="Facebook">
              📘
            </motion.a>
            <motion.a href="#" whileHover={{ scale: 1.2 }} aria-label="Twitter">
              𝕏
            </motion.a>
            <motion.a href="#" whileHover={{ scale: 1.2 }} aria-label="Instagram">
              📷
            </motion.a>
            <motion.a href="#" whileHover={{ scale: 1.2 }} aria-label="YouTube">
              ▶️
            </motion.a>
          </div>

          {/* Copyright */}
          <p className="text-slate-500 text-sm">{t.copyright}</p>
        </motion.div>
      </div>
    </footer>
  )
}
