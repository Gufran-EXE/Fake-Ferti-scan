"use client"

import type React from "react"

import { motion } from "framer-motion"
import { useState } from "react"
import { Eye, EyeOff, Lock, Mail, Shield } from 'lucide-react'

export default function AdminLoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [enable2FA, setEnable2FA] = useState(false)
  const [twoFACode, setTwoFACode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    // Mock validation
    if (!email || !password) {
      setError("Please fill in all fields")
      setIsLoading(false)
      return
    }

    if (enable2FA && !twoFACode) {
      setError("Please enter 2FA code")
      setIsLoading(false)
      return
    }

    // Simulate API call
    setTimeout(() => {
      // Mock successful login with email: admin@fertilizer.gov password: admin123
      if (email === "admin@fertilizer.gov" && password === "admin123" && (!enable2FA || twoFACode === "123456")) {
        setSuccess(true)
        setIsLoading(false)

        // Redirect after animation
        setTimeout(() => {
          window.location.href = "/admin-dashboard"
        }, 1500)
      } else {
        setError("Invalid credentials")
        setIsLoading(false)
      }
    }, 1000)
  }

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        className="flex flex-col items-center justify-center space-y-4"
      >
        {/* Data flow animation */}
        <svg className="w-20 h-20 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <motion.path
            d="M13 10V3L4 14h7v7l9-11h-7z"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5 }}
            fill="currentColor"
          />
        </svg>
        <p className="text-emerald-400 font-semibold">Access Granted</p>
        <p className="text-foreground/60 text-sm">Redirecting to dashboard...</p>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-slate-900/60 backdrop-blur-xl border border-emerald-500/30 rounded-2xl p-8 space-y-6"
    >
      <div className="text-center mb-2">
        <h2 className="text-2xl font-bold text-white">Sign In</h2>
        <p className="text-sm text-white/60 mt-1">Admin Access Required</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Field */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-2"
        >
          <label htmlFor="email" className="text-sm font-medium text-white">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400/60" />
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@fertilizer.gov"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-800/50 border border-emerald-500/20 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20 transition-all"
              disabled={isLoading}
            />
          </div>
        </motion.div>

        {/* Password Field */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
          className="space-y-2"
        >
          <label htmlFor="password" className="text-sm font-medium text-white">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400/60" />
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-10 py-2.5 bg-slate-800/50 border border-emerald-500/20 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20 transition-all"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-400/60 hover:text-emerald-400 transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </motion.div>

        {/* 2FA Toggle */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-3 py-2"
        >
          <button
            type="button"
            onClick={() => setEnable2FA(!enable2FA)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              enable2FA ? "bg-emerald-600" : "bg-slate-700"
            }`}
            aria-label="Toggle 2FA"
          >
            <motion.span
              layout
              className="inline-block h-5 w-5 transform rounded-full bg-white"
              initial={false}
              animate={{ x: enable2FA ? 20 : 2 }}
              transition={{ type: "spring", stiffness: 500, damping: 40 }}
            />
          </button>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span className="text-sm text-white">Enable 2FA</span>
          </div>
        </motion.div>

        {/* 2FA Code Input */}
        {enable2FA && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2 overflow-hidden"
          >
            <label htmlFor="2fa" className="text-sm font-medium text-white">
              2FA Code
            </label>
            <input
              id="2fa"
              type="text"
              value={twoFACode}
              onChange={(e) => setTwoFACode(e.target.value.slice(0, 6))}
              placeholder="000000"
              maxLength="6"
              className="w-full px-4 py-2.5 bg-slate-800/50 border border-emerald-500/20 rounded-lg text-white text-center tracking-widest placeholder:text-white/40 focus:outline-none focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20 transition-all"
              disabled={isLoading}
            />
            <p className="text-xs text-emerald-400/70">Try: 123456</p>
          </motion.div>
        )}

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm"
            role="alert"
          >
            {error}
          </motion.div>
        )}

        {/* Sign In Button */}
        <motion.button
          type="submit"
          disabled={isLoading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 disabled:from-slate-600 disabled:to-slate-600 text-slate-950 font-semibold rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:cursor-not-allowed"
          aria-label="Sign in to admin portal"
        >
          {isLoading ? (
            <motion.span
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
            >
              Verifying...
            </motion.span>
          ) : (
            "Sign In"
          )}
        </motion.button>
      </form>

      {/* Footer links */}
      <div className="flex justify-between items-center text-xs text-white/60 pt-2 border-t border-emerald-500/10">
        <a
          href="#"
          className="hover:text-emerald-400 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400/50 rounded px-1"
        >
          Forgot password?
        </a>
        <div className="text-xs text-white/40">Admin Portal v1.0</div>
      </div>

      {/* Mock credentials hint */}
      <div className="pt-4 border-t border-emerald-500/10 space-y-1">
        <p className="text-xs text-emerald-300 font-mono">Demo: admin@fertilizer.gov / admin123</p>
        <p className="text-xs text-white/60">For production, use official credentials and mandatory 2FA.</p>
      </div>
    </motion.div>
  )
}
