"use client"

import type React from "react"

import { useState, useRef } from "react"
import { motion } from "framer-motion"
import { Check, X } from "lucide-react"

interface OTPInputProps {
  onSuccess: (otp: string) => void
  status: "pending" | "success" | "error"
  onResend: () => void
  resendTimer: number
}

export default function OTPInput({ onSuccess, status, onResend, resendTimer }: OTPInputProps) {
  const [otp, setOtp] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  const handleChange = (value: string) => {
    // Only allow digits and limit to 10 characters
    const cleanValue = value.replace(/\D/g, '').slice(0, 10)
    setOtp(cleanValue)

    // Auto-submit when user enters 6 or more digits
    if (cleanValue.length >= 6) {
      onSuccess(cleanValue)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Allow backspace, delete, arrow keys, etc.
    if (e.key === 'Backspace' || e.key === 'Delete' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      return
    }
    // Only allow digits
    if (!/^\d$/.test(e.key)) {
      e.preventDefault()
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Enter OTP</h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
          Enter the verification code sent to your email (6-10 digits).
        </p>

        {/* Single OTP Input field */}
        <div className="flex justify-center mb-4">
          <motion.input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            placeholder="Enter OTP code"
            value={otp}
            onChange={(e) => handleChange(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            className={`w-full max-w-xs px-4 py-3 text-center text-xl font-mono font-bold rounded-lg border-2 transition-all focus:outline-none ${
              status === "success"
                ? "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400"
                : status === "error"
                  ? "border-red-500 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
                  : "border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:border-emerald-500 dark:focus:border-lime-500 focus:ring-2 focus:ring-emerald-500/20"
            }`}
            animate={status === "error" ? { x: [-5, 5, -5, 0] } : status === "success" ? { scale: 1.05 } : {}}
            transition={{ duration: status === "error" ? 0.4 : 0.3 }}
          />
        </div>

        {/* Status messages */}
        {status === "success" && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400 font-semibold"
          >
            <Check size={20} />
            OTP Verified!
          </motion.div>
        )}

        {status === "error" && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-2 text-red-600 dark:text-red-400 font-semibold"
          >
            <X size={20} />
            Incorrect OTP
          </motion.div>
        )}
      </div>

      {/* Resend timer */}
      <div className="text-center">
        {resendTimer > 0 ? (
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Resend OTP in <span className="font-semibold">{resendTimer}s</span>
          </p>
        ) : (
          <button
            onClick={onResend}
            className="text-sm font-semibold text-emerald-600 dark:text-lime-400 hover:text-emerald-700 dark:hover:text-lime-300 transition-colors"
          >
            Resend OTP
          </button>
        )}
      </div>
    </div>
  )
}
