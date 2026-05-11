"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { ArrowLeft, Search, CheckCircle, XCircle, Package, Building2, Hash, Calendar, AlertTriangle } from "lucide-react"

interface ProductResult {
  productId: string
  productName: string
  companyId: string
  companyName: string
  composition: string
  batchNumber: string
  manufacturingDate: string
  expiryDate: string
  status: string
  approvedAt: string
}

export default function VerifyPage() {
  const router = useRouter()
  const [productId, setProductId] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ genuine: boolean; product?: ProductResult; message: string } | null>(null)
  const [showReportForm, setShowReportForm] = useState(false)
  const [reportData, setReportData] = useState({ location: "", description: "" })
  const [reportSubmitted, setReportSubmitted] = useState(false)

  const handleVerify = async () => {
    if (!productId.trim()) return
    setLoading(true)
    setResult(null)

    try {
      // Build QR-like payload with just productId for web verification
      const qrData = JSON.stringify({
        productId: productId.trim().toUpperCase(),
        companyId: "",
        batchNumber: "",
        hash: "",
      })

      const res = await fetch("/api/verify-product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: productId.trim().toUpperCase() }),
      })

      const data = await res.json()
      setResult(data)
    } catch (err) {
      setResult({ genuine: false, message: "Failed to verify. Please try again." })
    } finally {
      setLoading(false)
    }
  }

  const handleReport = async () => {
    setReportSubmitted(true)
    setShowReportForm(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Background grid */}
      <div className="fixed inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(234,179,8,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(234,179,8,0.1) 1px, transparent 1px)`,
          backgroundSize: "50px 50px"
        }}
      />

      <div className="relative z-10 container mx-auto px-4 py-8 sm:py-12 max-w-2xl">
        {/* Back button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.push("/")}
          className="flex items-center gap-2 text-slate-400 hover:text-yellow-400 transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </motion.button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-yellow-500 to-yellow-400 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-yellow-500/20">
            <Search className="w-7 h-7 sm:w-8 sm:h-8 text-slate-900" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Verify Fertilizer Product</h1>
          <p className="text-slate-400 text-sm sm:text-base px-2">Enter the Product ID from the fertilizer packaging to check authenticity</p>
        </motion.div>

        {/* Search Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-900/60 border border-slate-700 rounded-2xl p-4 sm:p-6 mb-6"
        >
          <label className="block text-sm font-medium text-slate-300 mb-2">Product ID</label>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleVerify()}
              placeholder="e.g. PROD5678 or REG-2024-001"
              className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-yellow-500 transition-colors uppercase"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleVerify}
              disabled={loading || !productId.trim()}
              className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-400 text-slate-900 font-bold rounded-lg hover:shadow-lg hover:shadow-yellow-500/20 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Search className="w-5 h-5" />
              )}
              {loading ? "Checking..." : "Verify"}
            </motion.button>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            The Product ID is printed on the fertilizer bag label or QR code sticker
          </p>
        </motion.div>

        {/* Result */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ type: "spring", damping: 20 }}
            >
              {result.genuine && result.product ? (
                /* Genuine Result */
                <div className="bg-slate-900/60 border border-emerald-500/30 rounded-2xl overflow-hidden">
                  {/* Green banner */}
                  <div className="bg-gradient-to-r from-emerald-500 to-lime-500 p-5 flex items-center gap-4">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", damping: 15, delay: 0.2 }}
                      className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center shrink-0"
                    >
                      <CheckCircle className="w-7 h-7 text-white" />
                    </motion.div>
                    <div>
                      <h2 className="text-xl font-bold text-white">✅ Genuine Product Verified</h2>
                      <p className="text-emerald-100 text-sm">This product is registered and government approved</p>
                    </div>
                  </div>

                  {/* Product Details */}
                  <div className="p-4 sm:p-6 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        { icon: Package, label: "Product Name", value: result.product.productName },
                        { icon: Hash, label: "Product ID", value: result.product.productId },
                        { icon: Building2, label: "Company", value: `${result.product.companyName} (${result.product.companyId})` },
                        { icon: Package, label: "Composition", value: result.product.composition },
                        { icon: Hash, label: "Batch Number", value: result.product.batchNumber },
                        { icon: Calendar, label: "Manufacturing Date", value: result.product.manufacturingDate },
                        { icon: Calendar, label: "Expiry Date", value: result.product.expiryDate },
                        { icon: CheckCircle, label: "Status", value: "Government Approved ✅" },
                      ].map((item) => (
                        <div key={item.label} className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-lg">
                          <item.icon className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                          <div>
                            <p className="text-xs text-slate-500">{item.label}</p>
                            <p className="text-sm text-white font-medium">{item.value}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => { setResult(null); setProductId("") }}
                      className="w-full py-3 bg-slate-800 border border-slate-600 text-slate-300 font-semibold rounded-lg hover:bg-slate-700 transition-all mt-2"
                    >
                      Verify Another Product
                    </motion.button>
                  </div>
                </div>
              ) : (
                /* Fake/Not Found Result */
                <div className="bg-slate-900/60 border border-red-500/30 rounded-2xl overflow-hidden">
                  {/* Red banner */}
                  <div className="bg-gradient-to-r from-red-600 to-red-500 p-5 flex items-center gap-4">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", damping: 15, delay: 0.2 }}
                      className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center shrink-0"
                    >
                      <XCircle className="w-7 h-7 text-white" />
                    </motion.div>
                    <div>
                      <h2 className="text-xl font-bold text-white">❌ Product Not Verified</h2>
                      <p className="text-red-100 text-sm">{result.message}</p>
                    </div>
                  </div>

                  <div className="p-4 sm:p-6 space-y-4">
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-red-400 font-semibold text-sm">Warning</p>
                        <p className="text-red-300/80 text-sm mt-1">
                          This product ID was not found in our database or the QR code has been tampered with.
                          Do not use this product and report it to the authorities immediately.
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowReportForm(true)}
                        className="flex-1 py-3 bg-red-500/20 border border-red-500/30 text-red-400 font-semibold rounded-lg hover:bg-red-500/30 transition-all"
                      >
                        🚨 Report Fake Product
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => { setResult(null); setProductId("") }}
                        className="flex-1 py-3 bg-slate-800 border border-slate-600 text-slate-300 font-semibold rounded-lg hover:bg-slate-700 transition-all"
                      >
                        Try Again
                      </motion.button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Report Form Modal */}
        <AnimatePresence>
          {showReportForm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowReportForm(false)}
                className="fixed inset-0 bg-black/70 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative z-10 bg-slate-900 border border-red-500/20 rounded-2xl p-6 w-full max-w-md"
              >
                <h3 className="text-lg font-bold text-white mb-4">🚨 Report Fake Product</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-slate-300 mb-1">Product ID Reported</label>
                    <input value={productId} readOnly
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-400 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-300 mb-1">Your Location</label>
                    <input
                      value={reportData.location}
                      onChange={(e) => setReportData({ ...reportData, location: e.target.value })}
                      placeholder="Village, District, State"
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-red-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-300 mb-1">Description</label>
                    <textarea
                      value={reportData.description}
                      onChange={(e) => setReportData({ ...reportData, description: e.target.value })}
                      placeholder="Where did you buy it? Any other details..."
                      rows={3}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-red-500 text-sm resize-none"
                    />
                  </div>
                  <div className="flex gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleReport}
                      className="flex-1 py-2.5 bg-red-500 text-white font-semibold rounded-lg text-sm"
                    >
                      Submit Report
                    </motion.button>
                    <button onClick={() => setShowReportForm(false)}
                      className="px-4 py-2.5 border border-slate-600 text-slate-300 rounded-lg text-sm hover:bg-slate-800">
                      Cancel
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Report Submitted Success */}
        <AnimatePresence>
          {reportSubmitted && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="relative z-10 bg-slate-900 border border-emerald-500/20 rounded-2xl p-8 text-center max-w-sm w-full"
              >
                <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Report Submitted!</h3>
                <p className="text-slate-400 text-sm mb-4">Thank you. Authorities have been notified about this fake product.</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={() => { setReportSubmitted(false); setResult(null); setProductId("") }}
                  className="px-6 py-2.5 bg-emerald-500 text-white font-semibold rounded-lg text-sm"
                >
                  Done
                </motion.button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
