"use client"

import type React from "react"

import { useState, useRef } from "react"
import { motion } from "framer-motion"
import { Check, X } from "lucide-react"

interface OTPInputProps {
  onSuccess: () => void
  status: "pending" | "success" | "error"
  onResend: () => void
  resendTimer: number
}

export default function OTPInput({ onSuccess, status, onResend, resendTimer }: OTPInputProps) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const inputs = useRef<(HTMLInputElement | null)[]>([])

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value

    setOtp(newOtp)

    // Auto-focus to next input
    if (value && index < 5) {
      inputs.current[index + 1]?.focus()
    }

    // Check if all fields are filled and match mock OTP (123456)
    if (newOtp.every((digit) => digit) && newOtp.join("") === "123456") {
      onSuccess()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus()
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Enter OTP</h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
          A 6-digit code has been sent to your number. Try: <span className="font-mono font-semibold">123456</span>
        </p>

        {/* OTP Input fields */}
        <div className="flex gap-2 justify-center mb-4">
          {otp.map((digit, index) => (
            <motion.input
              key={index}
              ref={(el) => {
                inputs.current[index] = el
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              autoFocus={index === 0}
              className={`w-12 h-12 text-center text-xl font-bold rounded-lg border-2 transition-all focus:outline-none ${
                status === "success"
                  ? "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400"
                  : status === "error"
                    ? "border-red-500 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
                    : "border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:border-emerald-500 dark:focus:border-lime-500 focus:ring-2 focus:ring-emerald-500/20"
              }`}
              animate={status === "error" ? { x: [-5, 5, -5, 0] } : status === "success" ? { scale: 1.05 } : {}}
              transition={{ duration: status === "error" ? 0.4 : 0.3 }}
            />
          ))}
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
