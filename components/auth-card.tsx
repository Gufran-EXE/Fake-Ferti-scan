"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft } from "lucide-react"
import { supabase } from "@/lib/supabase"
import OTPInput from "@/components/otp-input"
import SignUpForm from "@/components/signup-form"

interface AuthCardProps {
  isDark: boolean
}

export default function AuthCard({ isDark }: AuthCardProps) {
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login")
  const [email, setEmail] = useState("")
  const [showOTP, setShowOTP] = useState(false)
  const [otpLoading, setOtpLoading] = useState(false)
  const [otpStatus, setOtpStatus] = useState<"pending" | "success" | "error">("pending")
  const [resendTimer, setResendTimer] = useState(0)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [devMode, setDevMode] = useState(false) // Development bypass mode

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (resendTimer > 0) {
      interval = setInterval(() => setResendTimer((t) => t - 1), 1000)
    }
    return () => clearInterval(interval)
  }, [resendTimer])

  const handleSendOTP = async () => {
    if (!email || !email.includes('@')) {
      alert("Please enter a valid email address")
      return
    }
    
    setOtpLoading(true)
    
    // Development Mode - Skip Supabase for testing
    if (devMode) {
      setTimeout(() => {
        setOtpLoading(false)
        setShowSuccessMessage(true)
        
        setTimeout(() => {
          setShowSuccessMessage(false)
          setShowOTP(true)
          setResendTimer(60)
        }, 2000)
      }, 1000)
      return
    }
    
    // Production Mode - Use Supabase
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
          shouldCreateUser: true,
          emailRedirectTo: undefined, // Disable magic link redirect
        }
      })
      
      if (error) {
        if (error.message.includes('rate limit')) {
          alert("Too many requests. Please wait a few minutes before trying again, or check your email for an existing OTP code.")
        } else {
          alert(`Error: ${error.message}`)
        }
        setOtpLoading(false)
        return
      }
      
      setOtpLoading(false)
      setShowSuccessMessage(true)
      
      // Show success message for 2 seconds, then show OTP form
      setTimeout(() => {
        setShowSuccessMessage(false)
        setShowOTP(true)
        setResendTimer(60)
      }, 2000)
      
    } catch (error) {
      console.error('Error sending OTP:', error)
      alert("Failed to send OTP. Please try again.")
      setOtpLoading(false)
    }
  }

  const handleOTPSuccess = async (otp: string) => {
    // Development Mode - Accept any 6+ digit code
    if (devMode) {
      if (otp.length >= 6) {
        setOtpStatus("success")
        setTimeout(() => {
          window.location.href = "/dashboard"
        }, 1000)
        return
      } else {
        setOtpStatus("error")
        alert("Please enter at least 6 digits")
        return
      }
    }
    
    // Production Mode - Use Supabase verification
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: email,
        token: otp,
        type: 'email'
      })
      
      if (error) {
        setOtpStatus("error")
        alert(`Error: ${error.message}`)
        return
      }
      
      if (data.user) {
        setOtpStatus("success")
        setTimeout(() => {
          window.location.href = "/dashboard"
        }, 1000)
      }
      
    } catch (error) {
      console.error('Error verifying OTP:', error)
      setOtpStatus("error")
      alert("Invalid OTP. Please try again.")
    }
  }

  const handleResendOTP = async () => {
    if (resendTimer === 0) {
      try {
        const { error } = await supabase.auth.signInWithOtp({
          email: email,
          options: {
            shouldCreateUser: true,
            emailRedirectTo: undefined, // Disable magic link redirect
          }
        })
        
        if (error) {
          if (error.message.includes('rate limit')) {
            alert("Too many requests. Please wait a few minutes before trying again.")
          } else {
            alert(`Error: ${error.message}`)
          }
          return
        }
        
        setResendTimer(60)
        setOtpStatus("pending")
        
        // Show success message for resend
        setShowSuccessMessage(true)
        setTimeout(() => {
          setShowSuccessMessage(false)
        }, 2000)
        
      } catch (error) {
        console.error('Error resending OTP:', error)
        alert("Failed to resend OTP. Please try again.")
      }
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
                  setEmail("")
                  setShowSuccessMessage(false)
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
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Welcome Back</h2>
                  
                  {/* Development Mode Toggle */}
                  <button
                    onClick={() => setDevMode(!devMode)}
                    className={`px-3 py-1 text-xs rounded-full transition-all ${
                      devMode 
                        ? "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800" 
                        : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
                    }`}
                  >
                    {devMode ? "🧪 DEV MODE" : "🔒 PROD MODE"}
                  </button>
                </div>

                {/* Success Message Popup */}
                {showSuccessMessage && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center">
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 0.6 }}
                          className="text-green-600 dark:text-green-400"
                        >
                          ✓
                        </motion.div>
                      </div>
                      <div>
                        <p className="font-semibold text-green-800 dark:text-green-200">
                          {devMode ? "DEV: OTP Ready!" : "OTP Sent Successfully!"}
                        </p>
                        <p className="text-sm text-green-600 dark:text-green-400">
                          {devMode ? "Enter any 6+ digits to continue" : `Check your email: ${email}`}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {!showOTP && !showSuccessMessage ? (
                  <div className="space-y-4">
                    {/* Input field */}
                    <div className="relative">
                      <input
                        type="email"
                        placeholder="Enter email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
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
                      onClick={() => window.location.href = "/dashboard"}
                      className="w-full text-center text-sm text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-lime-400 transition-colors py-2"
                    >
                      Continue as Guest
                    </button>

                    {/* Back to home arrow */}
                    <div className="flex justify-center mt-4">
                      <motion.button
                        onClick={() => window.location.href = "/"}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-lime-400 transition-colors py-2 px-4 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <ArrowLeft size={16} />
                        Back to Home
                      </motion.button>
                    </div>
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
