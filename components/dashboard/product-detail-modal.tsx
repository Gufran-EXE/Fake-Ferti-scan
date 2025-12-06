"use client"

import { motion } from "framer-motion"
import { X } from "lucide-react"

interface ProductDetailModalProps {
  check: {
    id: string
    productName: string
    registrationNo: string
    status: "verified" | "suspected"
    timestamp: string
    image: string
  }
  onClose: () => void
}

export default function ProductDetailModal({ check, onClose }: ProductDetailModalProps) {
  const isVerified = check.status === "verified"

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center px-4 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl rounded-2xl backdrop-blur-xl border border-white/20 dark:border-white/10 p-8 overflow-hidden relative"
        style={{
          background: "var(--card)",
        }}
      >
        {/* Close button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors"
        >
          <X className="w-5 h-5 text-slate-600 dark:text-slate-400" />
        </motion.button>

        {/* Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {/* Product image */}
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1 }}
            className="flex items-center justify-center rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 h-64 sm:h-80"
          >
            <img
              src={check.image || "/placeholder.svg"}
              alt={check.productName}
              className="w-full h-full object-cover"
            />
          </motion.div>

          {/* Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            {/* Status badge */}
            <div className="flex items-center gap-2">
              <motion.div
                className={`px-4 py-2 rounded-full font-bold text-sm ${
                  isVerified
                    ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300"
                    : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                }`}
                animate={
                  isVerified
                    ? { scale: [1, 1.05, 1] }
                    : {
                        boxShadow: [
                          "0 0 0px rgba(239, 68, 68, 0)",
                          "0 0 15px rgba(239, 68, 68, 0.5)",
                          "0 0 0px rgba(239, 68, 68, 0)",
                        ],
                      }
                }
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
              >
                {isVerified ? "✓ Verified Authentic" : "⚠ Suspected Counterfeit"}
              </motion.div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{check.productName}</h2>
              <p className="text-slate-600 dark:text-slate-400">
                Registration: <span className="font-mono font-semibold">{check.registrationNo}</span>
              </p>
            </div>

            {/* Mock details tabs */}
            <div className="border-t border-slate-200 dark:border-slate-700 pt-4 space-y-3">
              <div>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Product Details</h4>
                <div className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                  <p>Composition: NPK 20:20:20</p>
                  <p>Manufacturer: Green Agro Industries</p>
                  <p>Batch: 2024-001</p>
                  <p>Expiry: Dec 2025</p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Last Checked</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">{check.timestamp}</p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 pt-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 px-4 py-2 bg-emerald-500 text-white font-semibold rounded-lg hover:bg-emerald-600 transition-colors"
              >
                Mark as Reviewed
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 px-4 py-2 border-2 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white font-semibold rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Report Issue
              </motion.button>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  )
}
