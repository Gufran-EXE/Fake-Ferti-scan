"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Check } from "lucide-react"

interface SignUpFormProps {
  isDark: boolean
  onSuccess?: () => void
}

export default function SignUpForm({ isDark, onSuccess }: SignUpFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    location: "",
    farmSize: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      setSuccess(true)
      setTimeout(() => {
        if (onSuccess) {
          onSuccess()
        } else {
          alert("Account created successfully!")
        }
      }, 1500)
    }, 1500)
  }

  if (success) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, 10, 0] }}
          transition={{ duration: 0.6 }}
          className="inline-block mb-4"
        >
          <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <Check size={32} className="text-green-600 dark:text-green-400" />
          </div>
        </motion.div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Account Created!</h3>
        <p className="text-slate-600 dark:text-slate-400">Welcome to Fertilizer Detection System</p>
      </motion.div>
    )
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Create Account</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">Full Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Your full name"
            required
            className="w-full px-4 py-2 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 dark:focus:border-lime-500 transition-all"
          />
        </motion.div>

        {/* Phone */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">Phone Number</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="10-digit phone number"
            required
            className="w-full px-4 py-2 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 dark:focus:border-lime-500 transition-all"
          />
        </motion.div>

        {/* Location */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">Village / State</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="Village or state name"
            required
            className="w-full px-4 py-2 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 dark:focus:border-lime-500 transition-all"
          />
        </motion.div>

        {/* Farm Size */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }}>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
            Farm Size (Optional)
          </label>
          <select
            name="farmSize"
            value={formData.farmSize}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 dark:focus:border-lime-500 transition-all"
          >
            <option value="">Select farm size</option>
            <option value="small">Small (&lt; 1 acre)</option>
            <option value="medium">Medium (1-5 acres)</option>
            <option value="large">Large (&gt; 5 acres)</option>
          </select>
        </motion.div>

        {/* Submit button */}
        <motion.button
          type="submit"
          disabled={isSubmitting}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="w-full py-3 mt-6 bg-gradient-to-r from-emerald-500 to-lime-500 text-white font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-70 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Creating Account...
            </span>
          ) : (
            "Create Account"
          )}
        </motion.button>
      </form>
    </div>
  )
}
