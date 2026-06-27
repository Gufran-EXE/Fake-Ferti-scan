"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import {
  Clock, CheckCircle, XCircle, BarChart3,
  Bell, Search, LogOut, Building2, Package,
  RefreshCw, Eye, ChevronDown, ChevronUp,
  X, MapPin, Mail, Phone, Globe, Hash, FileText, User, Calendar
} from "lucide-react"

interface Product {
  _id: string
  productName: string
  productType: string
  composition: string
  batchNumber: string
  manufacturingDate: string
  expiryDate: string
  netWeight: string
  pricePerKg: string
  targetCrops: string
  storageConditions: string
  companyId: string
  companyName: string
  status: "PENDING" | "APPROVED" | "REJECTED"
  qrRequested: boolean
  submittedAt: string
  rejectionReason?: string
  productId?: string
  hash?: string
  quantity?: number
  serialsGenerated?: boolean
}

type TabType = "pending" | "approved" | "rejected" | "analytics"

export default function GovernmentDashboard() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<TabType>("pending")
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [rejectReason, setRejectReason] = useState("")
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [companyModal, setCompanyModal] = useState<any | null>(null)
  const [companyLoading, setCompanyLoading] = useState(false)
  const [notifyModal, setNotifyModal] = useState<{ companyId: string; companyName: string; productId?: string; productName?: string } | null>(null)
  const [notifyMessage, setNotifyMessage] = useState("")
  const [notifySending, setNotifySending] = useState(false)
  const [notifySuccess, setNotifySuccess] = useState(false)

  const fetchCompanyInfo = async (companyId: string) => {
    setCompanyLoading(true)
    try {
      const res = await fetch(`/api/gov/company?companyId=${companyId}`)
      const data = await res.json()
      if (data.success) setCompanyModal(data.company)
    } catch (err) {
      console.error("Failed to fetch company:", err)
    } finally {
      setCompanyLoading(false)
    }
  }

  const handleSendNotification = async () => {
    if (!notifyMessage.trim() || !notifyModal) return
    setNotifySending(true)
    try {
      const res = await fetch("/api/notifications/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId: notifyModal.companyId,
          productId: notifyModal.productId,
          productName: notifyModal.productName,
          message: notifyMessage,
          sentBy: "Government Portal",
        }),
      })
      const data = await res.json()
      if (data.success) {
        setNotifyMessage("")
        setNotifyModal(null)
        setNotifySuccess(true)
        setTimeout(() => setNotifySuccess(false), 3000)
      }
    } catch (err) {
      alert("Failed to send notification")
    } finally {
      setNotifySending(false)
    }
  }

  const [generatingZip, setGeneratingZip] = useState<string | null>(null)

  // ── Scan History Modal ──────────────────────────────────────────────────────
  const [scanModal, setScanModal] = useState<{ productId: string; productName: string } | null>(null)
  const [scanHistory, setScanHistory] = useState<any | null>(null)
  const [scanHistoryLoading, setScanHistoryLoading] = useState(false)

  const fetchScanHistory = async (productId: string, productName: string) => {
    setScanModal({ productId, productName })
    setScanHistory(null)
    setScanHistoryLoading(true)
    try {
      const res = await fetch(`/api/products/scan-history?productId=${productId}`)
      const data = await res.json()
      if (data.success) setScanHistory(data)
    } catch (err) {
      console.error("Failed to fetch scan history:", err)
    } finally {
      setScanHistoryLoading(false)
    }
  }

  const handleGenerateSerials = async (
    productMongoId: string,
    productName: string,
    quantityOverride?: number,
    forceRegenerate = false,
  ) => {
    setGeneratingZip(productMongoId)
    try {
      const res = await fetch("/api/products/generate-serials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: productMongoId, quantityOverride, forceRegenerate }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: "Unknown error" }))
        alert(`Error: ${err.message}`)
        return
      }

      // Always a ZIP now — download it directly
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${productName.replace(/\s+/g, "_")}_QRCodes.zip`
      a.click()
      URL.revokeObjectURL(url)

      // Refresh product list so serialsGenerated badge updates
      await fetchProducts(activeTab)
    } catch (err) {
      alert("Failed to generate QR codes. Please try again.")
    } finally {
      setGeneratingZip(null)
    }
  }

  const handleApprove = async (productId: string) => {
    setActionLoading(productId)
    try {
      const res = await fetch("/api/gov/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      })
      const data = await res.json()
      if (data.success) {
        await fetchProducts("PENDING")
      } else {
        alert(`Error: ${data.message}`)
      }
    } catch (err) {
      alert("Failed to approve. Please try again.")
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (productId: string) => {
    if (!rejectReason.trim()) {
      alert("Please enter a rejection reason")
      return
    }
    setActionLoading(productId)
    try {
      const res = await fetch("/api/gov/reject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, rejectionReason: rejectReason }),
      })
      const data = await res.json()
      if (data.success) {
        setRejectingId(null)
        setRejectReason("")
        await fetchProducts("PENDING")
      } else {
        alert(`Error: ${data.message}`)
      }
    } catch (err) {
      alert("Failed to reject. Please try again.")
    } finally {
      setActionLoading(null)
    }
  }

  const fetchProducts = async (status?: string) => {
    setLoading(true)
    try {
      const url = status ? `/api/gov/products?status=${status}` : "/api/gov/products"
      const res = await fetch(url)
      const data = await res.json()
      if (data.success) setProducts(data.products)
    } catch (err) {
      console.error("Failed to fetch:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const statusMap: Record<TabType, string | undefined> = {
      pending: "PENDING",
      approved: "APPROVED",
      rejected: "REJECTED",
      analytics: undefined,
    }
    fetchProducts(statusMap[activeTab])
  }, [activeTab])

  const filtered = products.filter(p =>
    p.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.companyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.companyId?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const tabs = [
    { id: "pending", label: "Pending Approvals", icon: Clock, color: "text-yellow-400", border: "border-yellow-500" },
    { id: "approved", label: "Approved Products", icon: CheckCircle, color: "text-emerald-400", border: "border-emerald-500" },
    { id: "rejected", label: "Rejected Products", icon: XCircle, color: "text-red-400", border: "border-red-500" },
    { id: "analytics", label: "Analytics", icon: BarChart3, color: "text-blue-400", border: "border-blue-500" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Grid Background */}
      <div className="fixed inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(0deg, transparent 24%, rgba(0,255,148,.05) 25%, rgba(0,255,148,.05) 26%, transparent 27%, transparent 74%, rgba(0,255,148,.05) 75%, rgba(0,255,148,.05) 76%, transparent 77%, transparent),
            linear-gradient(90deg, transparent 24%, rgba(0,255,148,.05) 25%, rgba(0,255,148,.05) 26%, transparent 27%, transparent 74%, rgba(0,255,148,.05) 75%, rgba(0,255,148,.05) 76%, transparent 77%, transparent)
          `,
          backgroundSize: "50px 50px",
        }}
      />

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-50 backdrop-blur-xl bg-slate-900/80 border-b border-emerald-500/20"
      >
        <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => router.push("/")}
          >
            <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">🏛️</span>
            </div>
            <span className="font-semibold text-white hidden sm:inline">Government Portal</span>
          </motion.div>

          <div className="flex-1 max-w-md hidden sm:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500/60" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by product or company..."
                className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-emerald-500/20 rounded-lg text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-emerald-500/60"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => fetchProducts(activeTab === "analytics" ? undefined : activeTab.toUpperCase())}
              className="p-2 text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-5 h-5" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push("/")}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors group"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center text-white font-semibold text-sm">G</div>
              <span className="text-sm text-white hidden sm:inline">Gov Admin</span>
              <LogOut className="w-4 h-4 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.button>
          </div>
        </div>
      </motion.header>

      <main className="container mx-auto px-4 py-8 relative z-10">

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all border ${
                activeTab === tab.id
                  ? `bg-slate-800 ${tab.color} ${tab.border}`
                  : "bg-slate-900/50 text-slate-400 border-slate-700 hover:border-slate-500"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </motion.button>
          ))}
        </div>

        <AnimatePresence mode="wait">

          {/* Pending Tab */}
          {activeTab === "pending" && (
            <motion.div key="pending" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-yellow-400" />
                  Pending Approvals
                  <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded-full border border-yellow-500/30">{filtered.length}</span>
                </h2>
              </div>

              {loading ? <LoadingState /> : filtered.length === 0 ? (
                <EmptyState icon={Clock} message="No pending approvals" color="text-yellow-400" />
              ) : (
                <div className="space-y-4">
                  {filtered.map((product) => (
                    <ProductCard
                      key={product._id}
                      product={product}
                      expanded={expandedId === product._id}
                      onToggle={() => setExpandedId(expandedId === product._id ? null : product._id)}
                      onCompanyInfo={() => fetchCompanyInfo(product.companyId)}
                      onNotify={() => setNotifyModal({ companyId: product.companyId, companyName: product.companyName, productId: product._id, productName: product.productName })}
                      actions={
                        <div className="flex gap-3 mt-4">
                          <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            disabled={actionLoading === product._id}
                            className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-emerald-500 to-lime-500 text-white font-semibold rounded-lg text-sm hover:shadow-lg hover:shadow-emerald-500/20 transition-all disabled:opacity-60"
                            onClick={() => handleApprove(product._id)}
                          >
                            {actionLoading === product._id ? (
                              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <CheckCircle className="w-4 h-4" />
                            )}
                            Approve
                          </motion.button>

                          {rejectingId === product._id ? (
                            <div className="flex gap-2 flex-1">
                              <input
                                type="text"
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                placeholder="Enter rejection reason..."
                                className="flex-1 px-3 py-2 bg-slate-800 border border-red-500/30 rounded-lg text-white text-sm focus:outline-none focus:border-red-500"
                              />
                              <motion.button
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                className="px-4 py-2 bg-red-500 text-white font-semibold rounded-lg text-sm"
                                onClick={() => handleReject(product._id)}
                              >
                                Confirm
                              </motion.button>
                              <button onClick={() => setRejectingId(null)} className="px-3 py-2 text-slate-400 hover:text-white text-sm">Cancel</button>
                            </div>
                          ) : (
                            <motion.button
                              whileHover={{ scale: 1.03 }}
                              whileTap={{ scale: 0.97 }}
                              className="flex items-center gap-2 px-5 py-2 bg-red-500/10 border border-red-500/30 text-red-400 font-semibold rounded-lg text-sm hover:bg-red-500/20 transition-all"
                              onClick={() => setRejectingId(product._id)}
                            >
                              <XCircle className="w-4 h-4" />
                              Reject
                            </motion.button>
                          )}
                        </div>
                      }
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Approved Tab */}
          {activeTab === "approved" && (
            <motion.div key="approved" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                  Approved Products
                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs rounded-full border border-emerald-500/30">{filtered.length}</span>
                </h2>
              </div>

              {loading ? <LoadingState /> : filtered.length === 0 ? (
                <EmptyState icon={CheckCircle} message="No approved products yet" color="text-emerald-400" />
              ) : (
                <div className="space-y-4">
                  {filtered.map((product) => (
                    <ProductCard
                      key={product._id}
                      product={product}
                      expanded={expandedId === product._id}
                      onToggle={() => setExpandedId(expandedId === product._id ? null : product._id)}
                      onCompanyInfo={() => fetchCompanyInfo(product.companyId)}
                      onNotify={() => setNotifyModal({ companyId: product.companyId, companyName: product.companyName, productId: product._id, productName: product.productName })}
                      badge={
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2 text-xs text-slate-400">
                            {product.productId && <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded">ID: {product.productId}</span>}
                            {(product as any).quantity && <span className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded">📦 {(product as any).quantity} bags</span>}
                            {product.hash && <span className="px-2 py-0.5 bg-slate-700 text-slate-300 rounded font-mono">Hash: {product.hash.slice(0, 12)}...</span>}
                          </div>
                          {/* Generate Serialized QR Codes Button */}
                          {!product.serialsGenerated ? (
                            <button
                              onClick={() => {
                                const qty = product.quantity
                                // Only prompt if quantity was never set (null/undefined)
                                if (qty == null) {
                                  const entered = window.prompt(
                                    `How many bags/units are in this batch?\n(Enter a number between 1 and 10000)`,
                                    "10"
                                  )
                                  if (!entered || isNaN(Number(entered))) return
                                  const n = Math.min(10000, Math.max(1, parseInt(entered)))
                                  handleGenerateSerials(product._id, product.productName, n)
                                } else {
                                  handleGenerateSerials(product._id, product.productName, qty)
                                }
                              }}
                              disabled={generatingZip === product._id}
                              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white text-sm font-semibold rounded-lg transition-all disabled:opacity-60 w-fit"
                            >
                              {generatingZip === product._id ? (
                                <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Generating {product.quantity ?? '?'} QR Codes...</>
                              ) : (
                                <>📦 Generate {product.quantity ?? '?'} Unique QR Codes → Download ZIP</>
                              )}
                            </button>
                          ) : (
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs rounded-lg font-medium">
                                ✅ {product.quantity ?? '?'} Serialized QR Codes Generated
                              </span>
                              <button
                                onClick={() => handleGenerateSerials(product._id, product.productName, product.quantity ?? undefined)}
                                disabled={generatingZip === product._id}
                                className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 disabled:opacity-60 text-slate-300 text-xs rounded-lg transition-colors flex items-center gap-1"
                              >
                                {generatingZip === product._id ? (
                                  <><span className="w-3 h-3 border-2 border-slate-300 border-t-transparent rounded-full animate-spin" /> Building ZIP...</>
                                ) : (
                                  <>↓ Re-download ZIP</>
                                )}
                              </button>
                              <button
                                onClick={() => {
                                  const entered = window.prompt(
                                    `Re-generate with a different quantity?\nCurrent: ${product.quantity ?? 'unknown'} bags\nEnter new number (1–10000):`,
                                    String(product.quantity ?? 10)
                                  )
                                  if (!entered || isNaN(Number(entered))) return
                                  const n = Math.min(10000, Math.max(1, parseInt(entered)))
                                  handleGenerateSerials(product._id, product.productName, n, true)
                                }}
                                disabled={generatingZip === product._id}
                                className="px-3 py-1.5 bg-orange-500/10 border border-orange-500/20 hover:bg-orange-500/20 disabled:opacity-60 text-orange-400 text-xs rounded-lg transition-colors"
                              >
                                ↺ Re-generate
                              </button>
                              {product.productId && (
                                <button
                                  onClick={() => fetchScanHistory(product.productId!, product.productName)}
                                  className="px-3 py-1.5 bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20 text-purple-400 text-xs rounded-lg transition-colors flex items-center gap-1"
                                >
                                  <MapPin className="w-3 h-3" /> Scan History
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      }
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Rejected Tab */}
          {activeTab === "rejected" && (
            <motion.div key="rejected" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-red-400" />
                  Rejected Products
                  <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded-full border border-red-500/30">{filtered.length}</span>
                </h2>
              </div>

              {loading ? <LoadingState /> : filtered.length === 0 ? (
                <EmptyState icon={XCircle} message="No rejected products" color="text-red-400" />
              ) : (
                <div className="space-y-4">
                  {filtered.map((product) => (
                    <ProductCard
                      key={product._id}
                      product={product}
                      expanded={expandedId === product._id}
                      onToggle={() => setExpandedId(expandedId === product._id ? null : product._id)}
                      onCompanyInfo={() => fetchCompanyInfo(product.companyId)}
                      onNotify={() => setNotifyModal({ companyId: product.companyId, companyName: product.companyName, productId: product._id, productName: product.productName })}
                      badge={
                        product.rejectionReason ? (
                          <div className="px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs">
                            Reason: {product.rejectionReason}
                          </div>
                        ) : null
                      }
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Analytics Tab */}
          {activeTab === "analytics" && (
            <AnalyticsTab />
          )}

        </AnimatePresence>
      </main>

      {/* Notification Sent Success Popup */}
      <AnimatePresence>
        {notifySuccess && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center">
            {/* Blur backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-md"
            />

            {/* Success card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.7, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -20 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className="relative z-10 bg-slate-900 border border-emerald-500/30 rounded-3xl p-10 flex flex-col items-center gap-5 shadow-2xl max-w-sm w-full mx-4"
            >
              {/* Animated green tick circle */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 15, stiffness: 400, delay: 0.1 }}
                className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-lime-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30"
              >
                <motion.svg
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="w-10 h-10 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <motion.path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  />
                </motion.svg>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-center"
              >
                <h3 className="text-2xl font-bold text-white mb-2">Message Sent!</h3>
                <p className="text-slate-400 text-sm">Notification delivered to the company successfully.</p>
              </motion.div>

              {/* Auto-close progress bar */}
              <motion.div className="w-full h-1 bg-slate-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: "100%" }}
                  animate={{ width: "0%" }}
                  transition={{ duration: 3, ease: "linear" }}
                  className="h-full bg-gradient-to-r from-emerald-500 to-lime-500 rounded-full"
                />
              </motion.div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Notify Company Modal */}
      <AnimatePresence>
        {notifyModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => { setNotifyModal(null); setNotifyMessage("") }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-slate-900 border border-emerald-500/20 rounded-2xl shadow-2xl z-10 p-6"
            >
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-lg font-bold text-white">📨 Notify Company</h2>
                  <p className="text-sm text-slate-400 mt-0.5">
                    To: <span className="text-emerald-400">{notifyModal.companyName}</span>
                    {notifyModal.productName && <span className="text-slate-500"> · {notifyModal.productName}</span>}
                  </p>
                </div>
                <button onClick={() => { setNotifyModal(null); setNotifyMessage("") }}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <textarea
                value={notifyMessage}
                onChange={(e) => setNotifyMessage(e.target.value)}
                placeholder="Type your message to the company..."
                rows={5}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors text-sm resize-none mb-4"
              />

              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: notifySending ? 1 : 1.02 }}
                  whileTap={{ scale: notifySending ? 1 : 0.98 }}
                  onClick={handleSendNotification}
                  disabled={notifySending || !notifyMessage.trim()}
                  className="flex-1 py-2.5 bg-gradient-to-r from-emerald-500 to-lime-500 text-white font-semibold rounded-lg text-sm hover:shadow-lg transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {notifySending ? (
                    <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Sending...</>
                  ) : (
                    "Send Notification"
                  )}
                </motion.button>
                <button onClick={() => { setNotifyModal(null); setNotifyMessage("") }}
                  className="px-5 py-2.5 border border-slate-600 text-slate-300 rounded-lg hover:bg-slate-800 transition-colors text-sm">
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Company Info Modal */}
      <AnimatePresence>
        {(companyModal || companyLoading) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCompanyModal(null)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-slate-900 border border-emerald-500/20 rounded-2xl shadow-2xl z-10 overflow-hidden"
            >
              {companyLoading ? (
                <div className="p-12 text-center">
                  <span className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin inline-block" />
                  <p className="text-slate-400 mt-4">Loading company info...</p>
                </div>
              ) : companyModal && (
                <>
                  {/* Modal Header */}
                  <div className="bg-gradient-to-r from-emerald-500/10 to-emerald-400/5 border-b border-emerald-500/20 px-6 py-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-400 rounded-xl flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-white">{companyModal.companyName}</h2>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-emerald-400 text-sm">{companyModal.companyId}</span>
                          <span className="px-2 py-0.5 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs rounded-full">
                            ✅ {companyModal.status?.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setCompanyModal(null)}
                      className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Modal Body */}
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Company Details */}
                    <div className="space-y-4">
                      <h3 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">🏢 Company Details</h3>
                      {[
                        { icon: User, label: "Owner / Director", value: companyModal.ownerName },
                        { icon: Hash, label: "Registration No.", value: companyModal.registrationNumber },
                        { icon: FileText, label: "License No.", value: companyModal.licenseNumber },
                        { icon: FileText, label: "GST Number", value: companyModal.gstNumber },
                        { icon: Calendar, label: "Established", value: companyModal.establishedYear },
                      ].map((item) => (
                        <div key={item.label} className="flex items-start gap-3">
                          <item.icon className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
                          <div>
                            <p className="text-xs text-slate-500">{item.label}</p>
                            <p className="text-sm text-white font-medium">{item.value || "N/A"}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Contact & Location */}
                    <div className="space-y-4">
                      <h3 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">📞 Contact & Location</h3>
                      {[
                        { icon: Mail, label: "Email", value: companyModal.contactEmail },
                        { icon: Phone, label: "Phone", value: companyModal.contactPhone },
                        { icon: Globe, label: "Website", value: companyModal.website || "N/A" },
                        { icon: MapPin, label: "Location", value: `${companyModal.city}, ${companyModal.state} ${companyModal.pincode || ""}` },
                      ].map((item) => (
                        <div key={item.label} className="flex items-start gap-3">
                          <item.icon className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
                          <div>
                            <p className="text-xs text-slate-500">{item.label}</p>
                            <p className="text-sm text-white font-medium">{item.value}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Scan History Modal */}
      <AnimatePresence>
        {scanModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => { setScanModal(null); setScanHistory(null) }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-3xl max-h-[85vh] bg-slate-900 border border-purple-500/20 rounded-2xl shadow-2xl z-10 flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-500/10 to-purple-400/5 border-b border-purple-500/20 px-6 py-4 flex items-center justify-between shrink-0">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-purple-400" />
                    Scan History
                  </h2>
                  <p className="text-sm text-slate-400 mt-0.5">{scanModal.productName} · <span className="text-purple-400 font-mono text-xs">{scanModal.productId}</span></p>
                </div>
                <button onClick={() => { setScanModal(null); setScanHistory(null) }}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="overflow-y-auto p-6 space-y-4">
                {scanHistoryLoading ? (
                  <div className="text-center py-12">
                    <span className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin inline-block" />
                    <p className="text-slate-400 mt-3">Loading scan history...</p>
                  </div>
                ) : scanHistory ? (
                  <>
                    {/* Summary cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-2">
                      {[
                        { label: "Total Bags", value: scanHistory.summary.totalSerials, color: "text-slate-300", border: "border-slate-600" },
                        { label: "Bags Scanned", value: scanHistory.summary.scannedSerials, color: "text-emerald-400", border: "border-emerald-500/30" },
                        { label: "Total Scans", value: scanHistory.summary.totalScans, color: "text-blue-400", border: "border-blue-500/30" },
                        { label: "⚠️ Suspicious", value: scanHistory.summary.suspiciousSerials, color: "text-orange-400", border: "border-orange-500/30" },
                      ].map((s) => (
                        <div key={s.label} className={`bg-slate-800/60 border ${s.border} rounded-xl p-3 text-center`}>
                          <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                          <p className="text-slate-500 text-xs mt-1">{s.label}</p>
                        </div>
                      ))}
                    </div>

                    {/* Serial list */}
                    {scanHistory.serials.length === 0 ? (
                      <div className="text-center py-10 text-slate-500">No serials found for this product.</div>
                    ) : (
                      <div className="space-y-3">
                        {scanHistory.serials.map((s: any) => (
                          <div key={s.serial}
                            className={`rounded-xl border p-4 ${s.suspicious
                              ? "bg-orange-500/5 border-orange-500/20"
                              : s.scanCount > 0
                                ? "bg-emerald-500/5 border-emerald-500/20"
                                : "bg-slate-800/40 border-slate-700"}`}
                          >
                            {/* Serial header */}
                            <div className="flex items-center justify-between gap-3 flex-wrap">
                              <span className="font-mono text-xs text-slate-300">{s.serial}</span>
                              <div className="flex items-center gap-2">
                                {s.suspicious && (
                                  <span className="px-2 py-0.5 bg-orange-500/20 text-orange-400 text-xs rounded-full border border-orange-500/30">
                                    ⚠️ Suspicious
                                  </span>
                                )}
                                <span className={`px-2 py-0.5 text-xs rounded-full border font-medium ${
                                  s.scanCount === 0
                                    ? "bg-slate-700 text-slate-400 border-slate-600"
                                    : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                                }`}>
                                  {s.scanCount === 0 ? "Not scanned" : `${s.scanCount} scan${s.scanCount > 1 ? "s" : ""}`}
                                </span>
                              </div>
                            </div>

                            {/* Scan events */}
                            {s.scanHistory.length > 0 && (
                              <div className="mt-3 space-y-2">
                                {s.scanHistory.map((ev: any, idx: number) => (
                                  <div key={idx} className="flex items-center justify-between gap-3 pl-3 border-l-2 border-slate-700 text-xs flex-wrap">
                                    <div className="flex items-center gap-2 text-slate-400">
                                      <span className="w-5 h-5 rounded-full bg-slate-700 text-slate-300 flex items-center justify-center text-[10px] font-bold shrink-0">
                                        {idx + 1}
                                      </span>
                                      <span>{new Date(ev.scannedAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      {ev.lat != null && ev.lng != null ? (
                                        <>
                                          <span className="text-slate-400 font-mono">
                                            {ev.cityName
                                              ? <span className="text-slate-300 not-italic font-semibold">{ev.cityName}</span>
                                              : `${ev.lat.toFixed(4)}, ${ev.lng.toFixed(4)}`
                                            }
                                          </span>
                                          {ev.cityName && (
                                            <span className="text-slate-600 font-mono text-[10px]">
                                              ({ev.lat.toFixed(4)}, {ev.lng.toFixed(4)})
                                            </span>
                                          )}
                                          <a
                                            href={ev.mapUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1 px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded hover:bg-blue-500/20 transition-colors"
                                          >
                                            <MapPin className="w-3 h-3" /> View on Map
                                          </a>
                                        </>
                                      ) : (
                                        <span className="text-slate-600 italic">Location not shared</span>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-10 text-red-400">Failed to load scan history.</div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Product Card Component
function ProductCard({ product, expanded, onToggle, onCompanyInfo, onNotify, actions, badge }: {
  product: Product
  expanded: boolean
  onToggle: () => void
  onCompanyInfo?: () => void
  onNotify?: () => void
  actions?: React.ReactNode
  badge?: React.ReactNode
}) {
  return (
    <motion.div
      layout
      className="bg-slate-900/60 border border-slate-700 rounded-xl overflow-hidden hover:border-emerald-500/30 transition-colors"
    >
      {/* Card Header */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <h3 className="text-white font-bold text-lg">{product.productName}</h3>
              <span className="px-2 py-0.5 bg-slate-700 text-slate-300 text-xs rounded font-mono">{product.productType}</span>
            </div>

            <div className="flex items-center gap-3 text-sm text-slate-400 flex-wrap">
              <span className="flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5" />
                {product.companyName || product.companyId}
              </span>
              <span className="flex items-center gap-1">
                <Package className="w-3.5 h-3.5" />
                Batch: {product.batchNumber}
              </span>
              <span className="text-slate-500 text-xs">
                Submitted: {new Date(product.submittedAt).toLocaleDateString("en-IN")}
              </span>
            </div>

            {badge && <div className="mt-2">{badge}</div>}
          </div>

          {/* Top right buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {onNotify && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onNotify}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-lg text-xs font-semibold hover:bg-blue-500/20 transition-colors"
              >
                <Bell className="w-3.5 h-3.5" />
                Notify
              </motion.button>
            )}
            {onCompanyInfo && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onCompanyInfo}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-lg text-xs font-semibold hover:bg-emerald-500/20 transition-colors"
              >
                <Eye className="w-3.5 h-3.5" />
                Company Info
              </motion.button>
            )}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onToggle}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
            >
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </motion.button>
          </div>
        </div>

        {/* Expanded Details */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-slate-700"
            >
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 text-sm">
                {[
                  { label: "Composition", value: product.composition },
                  { label: "Mfg. Date", value: product.manufacturingDate },
                  { label: "Expiry Date", value: product.expiryDate },
                  { label: "Net Weight", value: product.netWeight || "N/A" },
                  { label: "Price/KG", value: product.pricePerKg ? `₹${product.pricePerKg}` : "N/A" },
                  { label: "Target Crops", value: product.targetCrops || "N/A" },
                  { label: "Storage", value: product.storageConditions || "N/A" },
                  { label: "Company ID", value: product.companyId },
                ].map((item) => (
                  <div key={item.label} className="bg-slate-800/50 rounded-lg p-3">
                    <p className="text-slate-500 text-xs mb-1">{item.label}</p>
                    <p className="text-white font-medium text-sm">{item.value}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {actions && <div>{actions}</div>}
      </div>
    </motion.div>
  )
}

// Analytics Tab
function AnalyticsTab() {
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/gov/products")
        const data = await res.json()
        if (data.success) {
          const all = data.products
          setStats({
            total: all.length,
            pending: all.filter((p: Product) => p.status === "PENDING").length,
            approved: all.filter((p: Product) => p.status === "APPROVED").length,
            rejected: all.filter((p: Product) => p.status === "REJECTED").length,
          })
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  const statCards = [
    { label: "Total Submissions", value: stats.total, color: "text-white", bg: "border-slate-600", icon: Package },
    { label: "Pending Approval", value: stats.pending, color: "text-yellow-400", bg: "border-yellow-500/30", icon: Clock },
    { label: "Approved", value: stats.approved, color: "text-emerald-400", bg: "border-emerald-500/30", icon: CheckCircle },
    { label: "Rejected", value: stats.rejected, color: "text-red-400", bg: "border-red-500/30", icon: XCircle },
  ]

  return (
    <motion.div key="analytics" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
      <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
        <BarChart3 className="w-5 h-5 text-blue-400" />
        Analytics Overview
      </h2>

      {loading ? <LoadingState /> : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {statCards.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`bg-slate-900/60 border ${stat.bg} rounded-xl p-6 text-center`}
            >
              <stat.icon className={`w-8 h-8 ${stat.color} mx-auto mb-3`} />
              <p className={`text-4xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-slate-400 text-sm mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      )}

      <div className="bg-slate-900/60 border border-slate-700 rounded-xl p-6">
        <h3 className="text-white font-semibold mb-4">📋 Registered Companies</h3>
        <p className="text-slate-400 text-sm">Total pre-registered companies: <span className="text-emerald-400 font-bold text-lg">50</span></p>
        <p className="text-slate-500 text-xs mt-2">All companies are government-verified and pre-registered in the system.</p>
      </div>
    </motion.div>
  )
}

// Loading State
function LoadingState() {
  return (
    <div className="text-center py-20">
      <span className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin inline-block" />
      <p className="text-slate-400 mt-4">Loading...</p>
    </div>
  )
}

// Empty State
function EmptyState({ icon: Icon, message, color }: { icon: any, message: string, color: string }) {
  return (
    <div className="text-center py-20 bg-slate-900/40 rounded-2xl border border-slate-700">
      <Icon className={`w-12 h-12 ${color} mx-auto mb-4 opacity-50`} />
      <p className="text-slate-400 text-lg">{message}</p>
    </div>
  )
}
