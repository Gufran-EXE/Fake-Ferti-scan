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
      <div className="relative z-10 max-w-5xl w-full px-4 mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left side - Copy and Shield Icon */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="hidden md:block"
          >
            <div className="space-y-8">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">Admin Portal</h1>
                <p className="text-lg text-emerald-300 font-semibold">Manage Verifications & Reports</p>
              </div>

              <p className="text-white/90 text-base leading-relaxed max-w-sm">
                Secure access for authorized administrators. Monitor fertilizer verifications, manage fraud reports, and
                maintain database integrity.
              </p>

              {/* Animated Shield Icon */}
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
                className="w-20 h-20 bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/50 rounded-2xl flex items-center justify-center"
              >
                <svg className="w-10 h-10 text-emerald-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
                </svg>
              </motion.div>

              {/* Security note */}
              <div className="pt-4 border-t border-emerald-500/20">
                <p className="text-xs text-emerald-300 font-mono">
                  ⚠️ Admins only — use official credentials. Enable 2FA for production.
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
