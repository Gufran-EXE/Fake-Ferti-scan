"use client"

import { motion, AnimatePresence } from "framer-motion"
import { X, CheckCircle, AlertTriangle, MapPin, User, Clock, ImageIcon } from "lucide-react"
import { useState } from "react"

export default function ReportDetailSlideOver({
  report,
  isOpen,
  onClose,
}: { report: any; isOpen: boolean; onClose: () => void }) {
  const [showLightbox, setShowLightbox] = useState(false)
  const [selectedImage, setSelectedImage] = useState(0)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [action, setAction] = useState("")

  const handleAction = (actionType: string) => {
    setAction(actionType)
    setShowConfirmModal(true)
  }

  const confirmAction = () => {
    console.log(`Action: ${action} confirmed for report ${report.id}`)
    setShowConfirmModal(false)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />

          {/* Slide Over */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-screen w-full max-w-2xl bg-slate-900 z-50 overflow-y-auto"
          >
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="sticky top-0 bg-gradient-to-b from-slate-900 to-slate-900/80 backdrop-blur-xl border-b border-emerald-500/20 p-6 flex items-center justify-between"
            >
              <div>
                <h2 className="text-2xl font-bold text-white">{report.id}</h2>
                <p className="text-sm text-white/60 mt-1">{report.product}</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="p-2 hover:bg-emerald-500/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </motion.button>
            </motion.div>

            <div className="p-6 space-y-6">
              {/* Status Badge */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border font-semibold ${
                  report.status === "verified"
                    ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                    : "bg-amber-500/20 text-amber-400 border-amber-500/30"
                }`}
              >
                {report.status === "verified" ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <AlertTriangle className="w-5 h-5" />
                )}
                {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
              </motion.div>

              {/* Details Grid */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="grid grid-cols-2 gap-4"
              >
                <div className="bg-slate-800/50 border border-emerald-500/20 rounded-lg p-4">
                  <p className="text-xs text-white/60 mb-1 flex items-center gap-1">
                    <User className="w-3 h-3" />
                    Reporter
                  </p>
                  <p className="font-semibold text-white">{report.reporter}</p>
                </div>
                <div className="bg-slate-800/50 border border-emerald-500/20 rounded-lg p-4">
                  <p className="text-xs text-white/60 mb-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    Region
                  </p>
                  <p className="font-semibold text-white">{report.region}</p>
                </div>
                <div className="bg-slate-800/50 border border-emerald-500/20 rounded-lg p-4 col-span-2">
                  <p className="text-xs text-white/60 mb-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Reported At
                  </p>
                  <p className="font-semibold text-white">{report.createdAt}</p>
                </div>
              </motion.div>

              {/* Description */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-2"
              >
                <h3 className="font-semibold text-white">Description</h3>
                <p className="text-white leading-relaxed">{report.description}</p>
              </motion.div>

              {/* Images */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="space-y-2"
              >
                <h3 className="font-semibold text-white flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  Evidence Images
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {report.images.map((image: string, idx: number) => (
                    <motion.button
                      key={idx}
                      whileHover={{ scale: 1.05 }}
                      onClick={() => {
                        setSelectedImage(idx)
                        setShowLightbox(true)
                      }}
                      className="relative aspect-square rounded-lg overflow-hidden border border-emerald-500/20 hover:border-emerald-500/50 transition-colors cursor-pointer"
                    >
                      <img
                        src={image || "/placeholder.svg"}
                        alt={`Evidence ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                        <motion.div whileHover={{ scale: 1.2 }}>
                          <ImageIcon className="w-6 h-6 text-white" />
                        </motion.div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="grid grid-cols-2 gap-3 pt-4 border-t border-emerald-500/10"
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleAction("verify")}
                  className="py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg transition-colors"
                >
                  Mark Verified
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleAction("escalate")}
                  className="py-2 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-lg transition-colors"
                >
                  Escalate
                </motion.button>
              </motion.div>

              {/* Add Note */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="space-y-2"
              >
                <h3 className="font-semibold text-white">Add Note</h3>
                <textarea
                  placeholder="Add investigation notes..."
                  className="w-full h-24 px-4 py-3 bg-slate-800/50 border border-emerald-500/20 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20 resize-none"
                />
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-colors"
                >
                  Save Note
                </motion.button>
              </motion.div>
            </div>

            {/* Confirm Modal */}
            <AnimatePresence>
              {showConfirmModal && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
                  onClick={() => setShowConfirmModal(false)}
                >
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-slate-900 border border-emerald-500/30 rounded-lg p-6 max-w-sm"
                  >
                    <h3 className="text-lg font-bold text-white mb-2">Confirm Action</h3>
                    <p className="text-white/60 mb-6">
                      Are you sure you want to {action} this report? This action cannot be undone.
                    </p>
                    <div className="flex gap-3">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowConfirmModal(false)}
                        className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                      >
                        Cancel
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={confirmAction}
                        className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors"
                      >
                        Confirm
                      </motion.button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Lightbox */}
            <AnimatePresence>
              {showLightbox && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowLightbox(false)}
                  className="fixed inset-0 bg-black/90 flex items-center justify-center z-50"
                >
                  <motion.div
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0.9 }}
                    className="relative max-w-4xl max-h-screen"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <img
                      src={report.images[selectedImage] || "/placeholder.svg"}
                      alt="Full resolution"
                      className="max-w-full max-h-screen object-contain"
                    />
                    <motion.button
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowLightbox(false)}
                      className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 rounded-lg text-white transition-colors"
                    >
                      <X className="w-6 h-6" />
                    </motion.button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
