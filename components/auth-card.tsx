"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import OTPInput from "@/components/otp-input"
import SignUpForm from "@/components/signup-form"

interface AuthCardProps {
  isDark: boolean
}

export default function AuthCard({ isDark }: AuthCardProps) {
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [showOTP, setShowOTP] = useState(false)
  const [otpLoading, setOtpLoading] = useState(false)
  const [otpStatus, setOtpStatus] = useState<"pending" | "success" | "error">("pending")
  const [useEmail, setUseEmail] = useState(false)
  const [resendTimer, setResendTimer] = useState(0)

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (resendTimer > 0) {
      interval = setInterval(() => setResendTimer((t) => t - 1), 1000)
    }
    return () => clearInterval(interval)
  }, [resendTimer])

  const handleSendOTP = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      alert("Please enter a valid phone number")
      return
    }
    setOtpLoading(true)
    setTimeout(() => {
      setOtpLoading(false)
      setShowOTP(true)
      setResendTimer(60)
    }, 1500)
  }

  const handleOTPSuccess = () => {
    setOtpStatus("success")
    setTimeout(() => {
      window.location.href = "/dashboard"
    }, 1000)
  }

  const handleResendOTP = () => {
    if (resendTimer === 0) {
      setResendTimer(60)
      setOtpStatus("pending")
    }
  }

  const handleSignupSuccess = () => {
    window.location.href = "/dashboard"
  }

  return (
    <motion.div
      className="relative w-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Animated leaf pattern border */}
      <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-10 transition-opacity" />

      {/* Glass card */}
      <motion.div
        className="relative rounded-3xl backdrop-blur-xl border border-white/20 dark:border-white/10 overflow-hidden shadow-2xl"
        style={{
          background: isDark ? "rgba(15, 23, 42, 0.7)" : "rgba(255, 255, 255, 0.8)",
        }}
        whileHover={{ y: -2 }}
        transition={{ type: "spring", damping: 20 }}
      >
        {/* Animated leaf icons in background */}
        <motion.div
          className="absolute top-6 right-6 text-4xl opacity-10 dark:opacity-5"
          animate={{ rotate: [0, 10, 0] }}
          transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY }}
        >
          🍃
        </motion.div>
        <motion.div
          className="absolute bottom-6 left-6 text-4xl opacity-10 dark:opacity-5"
          animate={{ rotate: [0, -10, 0] }}
          transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY, delay: 0.5 }}
        >
          🌾
        </motion.div>

        <div className="p-8 sm:p-10">
          {/* Tab buttons */}
          <div className="flex gap-2 mb-8 bg-slate-100 dark:bg-slate-800/50 p-1 rounded-full">
            {["login", "signup"].map((tab) => (
              <motion.button
                key={tab}
                onClick={() => {
                  setActiveTab(tab as "login" | "signup")
                  setShowOTP(false)
                  setOtpStatus("pending")
                  setPhoneNumber("")
                }}
                className={`flex-1 py-2 px-4 rounded-full font-semibold capitalize transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-900 ${
                  activeTab === tab
                    ? "bg-gradient-to-r from-emerald-500 to-lime-500 text-white shadow-lg"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100"
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {tab}
              </motion.button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {/* Login flow */}
            {activeTab === "login" && (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Welcome Back</h2>

                {!showOTP ? (
                  <div className="space-y-4">
                    {/* Phone/Email toggle */}
                    <button
                      onClick={() => setUseEmail(!useEmail)}
                      className="text-sm text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-lime-400 transition-colors mb-4"
                    >
                      {useEmail ? "Use phone instead" : "Use email instead"}
                    </button>

                    {/* Input field */}
                    <div className="relative">
                      <input
                        type={useEmail ? "email" : "tel"}
                        placeholder={useEmail ? "Enter email" : "Enter phone number"}
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:border-emerald-500 dark:focus:border-lime-500 focus:ring-2 focus:ring-emerald-500/20 dark:focus:ring-lime-500/20 transition-all"
                      />
                    </div>

                    {/* Send OTP button */}
                    <motion.button
                      onClick={handleSendOTP}
                      disabled={otpLoading}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-3 bg-gradient-to-r from-emerald-500 to-lime-500 text-white font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-70 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
                    >
                      {otpLoading ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Sending...
                        </span>
                      ) : (
                        "Send OTP"
                      )}
                    </motion.button>

                    {/* Continue as guest */}
                    <button
                      onClick={() => alert("Continuing as guest...")}
                      className="w-full text-center text-sm text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-lime-400 transition-colors py-2"
                    >
                      Continue as Guest
                    </button>
                  </div>
                ) : (
                  <OTPInput
                    onSuccess={handleOTPSuccess}
                    status={otpStatus}
                    onResend={handleResendOTP}
                    resendTimer={resendTimer}
                  />
                )}
              </motion.div>
            )}

            {/* Sign up flow */}
            {activeTab === "signup" && (
              <motion.div
                key="signup"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <SignUpForm isDark={isDark} onSuccess={handleSignupSuccess} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Decorative elements */}
      <motion.div
        className="absolute -bottom-12 -right-12 w-32 h-32 rounded-full bg-gradient-to-br from-lime-400 to-emerald-500 opacity-20 blur-3xl pointer-events-none"
        animate={{ y: [0, 10] }}
        transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
      />
      <motion.div
        className="absolute -top-12 -left-12 w-32 h-32 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 opacity-20 blur-3xl pointer-events-none"
        animate={{ y: [10, 0] }}
        transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse", delay: 0.5 }}
      />
    </motion.div>
  )
}
