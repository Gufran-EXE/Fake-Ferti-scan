"use client"

import { motion } from "framer-motion"
import { useState } from "react"
import AdminLoginForm from "@/components/admin-login-form"

export default function AdminLoginPage() {
  const [showShield, setShowShield] = useState(true)

  return (
    <div className="min-h-screen w-full bg-slate-950 text-foreground flex items-center justify-center relative overflow-hidden pt-20">
      {/* Animated grid background */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(0deg, transparent 24%, rgba(34, 197, 94, 0.05) 25%, rgba(34, 197, 94, 0.05) 26%, transparent 27%, transparent 74%, rgba(34, 197, 94, 0.05) 75%, rgba(34, 197, 94, 0.05) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(34, 197, 94, 0.05) 25%, rgba(34, 197, 94, 0.05) 26%, transparent 27%, transparent 74%, rgba(34, 197, 94, 0.05) 75%, rgba(34, 197, 94, 0.05) 76%, transparent 77%, transparent)",
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      {/* Glowing orbs */}
      <div className="absolute top-20 right-20 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-emerald-600/5 rounded-full blur-3xl" />

      {/* Main container */}
      <div className="relative z-10 max-w-5xl w-full px-4 mx-auto py-8">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Left side - Copy and Shield Icon */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="hidden md:block"
          >
            <div className="space-y-8">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold rounded-full">
                    🇮🇳 Ministry of Agriculture & Farmers Welfare
                  </span>
                </div>
                <h1 className="text-4xl font-bold text-white mb-2">Government Portal</h1>
                <p className="text-lg text-emerald-300 font-semibold">Fertilizer Regulation Authority</p>
              </div>

              <p className="text-white/90 text-base leading-relaxed max-w-sm">
                Secure access for authorized government officials. Review company product submissions, approve or reject requests, and oversee QR code generation for verified fertilizers.
              </p>

              {/* Animated Government Icon */}
              <motion.div
                animate={showShield ? { y: [0, -10, 0] } : {}}
                transition={{
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatType: "loop",
                }}
                onAnimationComplete={() => {
                  setTimeout(() => setShowShield(true), 500)
                }}
                className="w-20 h-20 bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/50 rounded-2xl flex items-center justify-center text-4xl"
              >
                🏛️
              </motion.div>

              {/* Security note */}
              <div className="pt-4 border-t border-emerald-500/20">
                <p className="text-xs text-emerald-300 font-mono">
                  ⚠️ Government officials only — authorized access. Unauthorized access is prohibited.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Right side - Login Form */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <AdminLoginForm />
          </motion.div>
        </div>
      </div>
    </div>
  )
}
