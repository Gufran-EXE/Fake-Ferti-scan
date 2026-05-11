"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import {
  Plus, QrCode, Clock, CheckCircle, XCircle, LogOut,
  Building2, Package, ChevronRight, MapPin, Mail,
  Phone, Globe, Hash, Calendar, FileText, User, Bell, X, Trash2
} from "lucide-react"

interface Product {
  _id: string
  productName: string
  batchNumber: string
  manufacturingDate: string
  expiryDate: string
  composition: string
  productType: string
  netWeight: string
  pricePerKg: string
  targetCrops: string
  storageConditions: string
  status: "PENDING" | "APPROVED" | "REJECTED"
  companyId: string
  submittedAt: string
  qrRequested: boolean
  rejectionReason?: string
  qrCode?: string
  productId?: string
  hash?: string
}

interface CompanySession {
  companyId: string
  companyName: string
  registrationNumber: string
  licenseNumber: string
  ownerName: string
  contactEmail: string
  contactPhone: string
  address: string
  city: string
  state: string
  pincode: string
  gstNumber: string
  website: string
  establishedYear: string
  status: string
}

export default function CompanyDashboard() {
  const router = useRouter()
  const [session, setSession] = useState<CompanySession | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [activeTab, setActiveTab] = useState<"products" | "add">("products")
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [productSubmitPopup, setProductSubmitPopup] = useState(false)
  const [showProfile, setShowProfile] = useState(true)
  const [loadingProducts, setLoadingProducts] = useState(false)
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [showNotifications, setShowNotifications] = useState(false)

  const [form, setForm] = useState({
    productName: "", batchNumber: "", manufacturingDate: "",
    expiryDate: "", composition: "", productType: "",
    netWeight: "", pricePerKg: "", targetCrops: "", storageConditions: "",
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem("companySession")
    if (!stored) { router.push("/company-login"); return }
    const parsedSession = JSON.parse(stored)
    setSession(parsedSession)
    fetchProducts(parsedSession.companyId)
    fetchNotifications(parsedSession.companyId)
  }, [router])

  const fetchNotifications = async (companyId: string) => {
    try {
      const res = await fetch(`/api/notifications/list?companyId=${companyId}`)
      const data = await res.json()
      if (data.success) {
        setNotifications(data.notifications)
        setUnreadCount(data.unreadCount)
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err)
    }
  }

  const markAllRead = async (companyId: string) => {
    try {
      await fetch("/api/notifications/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId }),
      })
      setUnreadCount(0)
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    } catch (err) {
      console.error("Failed to mark as read:", err)
    }
  }

  const fetchProducts = async (companyId: string) => {
    setLoadingProducts(true)
    try {
      const res = await fetch(`/api/products/list?companyId=${companyId}`)
      const data = await res.json()
      if (data.success) setProducts(data.products)
    } catch (err) {
      console.error("Failed to fetch products:", err)
    } finally {
      setLoadingProducts(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmitProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const res = await fetch("/api/products/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId: session?.companyId, ...form }),
      })

      const data = await res.json()

      if (data.success) {
        setSubmitSuccess(true)
        setForm({
          productName: "", batchNumber: "", manufacturingDate: "",
          expiryDate: "", composition: "", productType: "",
          netWeight: "", pricePerKg: "", targetCrops: "", storageConditions: "",
        })
        // Refresh products from MongoDB
        await fetchProducts(session?.companyId || "")
        setProductSubmitPopup(true)
        setTimeout(() => {
          setProductSubmitPopup(false)
          setSubmitSuccess(false)
          setActiveTab("products")
        }, 3000)
      } else {
        alert(`Error: ${data.message}`)
      }
    } catch (err) {
      alert("Failed to submit product. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDownloadQR = (qrCode: string, productName: string, productId: string) => {
    const link = document.createElement("a")
    link.href = qrCode
    link.download = `${productName.replace(/\s+/g, "_")}_${productId}_QR.png`
    link.click()
  }

  const handleDeleteProduct = async (productId: string) => {
    try {
      await fetch(`/api/products/delete?productId=${productId}`, { method: "DELETE" })
      setProducts(prev => prev.filter(p => p._id !== productId))
    } catch (err) {
      console.error("Failed to delete product:", err)
    }
  }

  const handleRequestQR = async (productId: string) => {
    try {
      const res = await fetch("/api/products/generate-qr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      })
      const data = await res.json()
      if (data.success) {
        await fetchProducts(session?.companyId || "")
      } else {
        alert(`Error: ${data.message}`)
      }
    } catch (err) {
      console.error("Failed to generate QR:", err)
      alert("Failed to generate QR. Please try again.")
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("companySession")
    router.push("/")
  }

  const statusConfig = {
    PENDING: { color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/30", label: "🟡 Pending Approval" },
    APPROVED: { color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/30", label: "✅ Approved" },
    REJECTED: { color: "text-red-400", bg: "bg-red-500/10 border-red-500/30", label: "❌ Rejected" },
  }

  if (!session) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="fixed inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(234,179,8,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(234,179,8,0.05) 1px, transparent 1px)`,
          backgroundSize: "50px 50px"
        }}
      />

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-50 backdrop-blur-xl bg-slate-900/80 border-b border-yellow-500/20"
      >
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-yellow-500 to-yellow-400 rounded-lg flex items-center justify-center shrink-0">
              <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-slate-900" />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-white text-xs sm:text-sm truncate max-w-[120px] sm:max-w-none">{session.companyName}</p>
              <p className="text-xs text-yellow-400">{session.companyId}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Notification Bell */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setShowNotifications(!showNotifications)
                  if (!showNotifications && unreadCount > 0 && session) {
                    markAllRead(session.companyId)
                  }
                }}
                className="relative p-2 text-slate-400 hover:text-yellow-400 hover:bg-yellow-500/10 rounded-lg transition-colors"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center"
                  >
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </motion.span>
                )}
              </motion.button>

              {/* Notification Dropdown */}
              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-72 sm:w-80 bg-slate-900 border border-yellow-500/20 rounded-xl shadow-2xl z-50 overflow-hidden"
                  >
                    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
                      <h3 className="font-semibold text-white text-sm">Notifications</h3>
                      <button onClick={() => setShowNotifications(false)} className="text-slate-400 hover:text-white">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-slate-500 text-sm">No notifications yet</div>
                      ) : (
                        notifications.map((notif) => (
                          <div
                            key={notif._id}
                            className={`px-4 py-3 border-b border-slate-800 last:border-0 ${!notif.read ? "bg-yellow-500/5" : ""}`}
                          >
                            <div className="flex items-start gap-2">
                              {!notif.read && <span className="w-2 h-2 bg-yellow-400 rounded-full mt-1.5 shrink-0" />}
                              <div className="flex-1">
                                {notif.productName && (
                                  <p className="text-xs text-yellow-400 font-medium mb-0.5">{notif.productName}</p>
                                )}
                                <p className="text-sm text-white">{notif.message}</p>
                                <p className="text-xs text-slate-500 mt-1">
                                  {notif.sentBy} · {new Date(notif.createdAt).toLocaleDateString("en-IN")}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors text-xs sm:text-sm"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </motion.button>
          </div>
        </div>
      </motion.header>

      <main className="container mx-auto px-4 py-8 relative z-10 space-y-6">

        {/* Company Profile Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900/60 border border-yellow-500/20 rounded-2xl overflow-hidden"
        >
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-yellow-500/10 to-yellow-400/5 border-b border-yellow-500/20 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-400 rounded-xl flex items-center justify-center shadow-lg shadow-yellow-500/20">
                <Building2 className="w-6 h-6 text-slate-900" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{session.companyName}</h2>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-yellow-400 text-sm font-medium">{session.companyId}</span>
                  <span className="w-1 h-1 rounded-full bg-slate-500" />
                  <span className="px-2 py-0.5 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs rounded-full font-medium">
                    ✅ {session.status?.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => setShowProfile(!showProfile)}
              className="text-slate-400 hover:text-yellow-400 text-sm transition-colors"
            >
              {showProfile ? "Hide Profile" : "Show Profile"}
            </motion.button>
          </div>

          {/* Profile Details */}
          <AnimatePresence>
            {showProfile && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="p-6"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Company Info */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-semibold text-yellow-400 uppercase tracking-wider mb-3">🏢 Company Info</h3>
                    <div className="flex items-start gap-2">
                      <User className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs text-slate-500">Owner / Director</p>
                        <p className="text-sm text-white font-medium">{session.ownerName}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Hash className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs text-slate-500">Registration Number</p>
                        <p className="text-sm text-white font-medium">{session.registrationNumber}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <FileText className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs text-slate-500">License Number</p>
                        <p className="text-sm text-white font-medium">{session.licenseNumber}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <FileText className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs text-slate-500">GST Number</p>
                        <p className="text-sm text-white font-medium">{session.gstNumber}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Calendar className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs text-slate-500">Established Year</p>
                        <p className="text-sm text-white font-medium">{session.establishedYear}</p>
                      </div>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-semibold text-yellow-400 uppercase tracking-wider mb-3">📞 Contact Details</h3>
                    <div className="flex items-start gap-2">
                      <Mail className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs text-slate-500">Email</p>
                        <p className="text-sm text-white font-medium">{session.contactEmail}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Phone className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs text-slate-500">Phone</p>
                        <p className="text-sm text-white font-medium">{session.contactPhone}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Globe className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs text-slate-500">Website</p>
                        <p className="text-sm text-white font-medium">{session.website || "N/A"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Location + Stats */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-semibold text-yellow-400 uppercase tracking-wider mb-3">📍 Location</h3>
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs text-slate-500">Address</p>
                        <p className="text-sm text-white font-medium">
                          {session.address ? `${session.address}, ` : ""}{session.city}, {session.state} {session.pincode}
                        </p>
                      </div>
                    </div>

                    {/* Product Stats */}
                    <div className="mt-4 pt-4 border-t border-slate-700">
                      <h3 className="text-xs font-semibold text-yellow-400 uppercase tracking-wider mb-3">📦 Product Stats</h3>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="bg-slate-800 rounded-lg p-2 text-center">
                          <p className="text-lg font-bold text-white">{products.length}</p>
                          <p className="text-xs text-slate-400">Total</p>
                        </div>
                        <div className="bg-slate-800 rounded-lg p-2 text-center">
                          <p className="text-lg font-bold text-yellow-400">{products.filter(p => p.status === "PENDING").length}</p>
                          <p className="text-xs text-slate-400">Pending</p>
                        </div>
                        <div className="bg-slate-800 rounded-lg p-2 text-center">
                          <p className="text-lg font-bold text-emerald-400">{products.filter(p => p.status === "APPROVED").length}</p>
                          <p className="text-xs text-slate-400">Approved</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2">
          {[
            { id: "products", label: "My Products", icon: Package },
            { id: "add", label: "Add Product", icon: Plus },
          ].map((tab) => (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab(tab.id as "products" | "add")}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-yellow-500 to-yellow-400 text-slate-900"
                  : "bg-slate-800 text-slate-400 hover:text-white border border-slate-700"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </motion.button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Products List */}
          {activeTab === "products" && (
            <motion.div
              key="products"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              {loadingProducts ? (
                <div className="text-center py-20">
                  <span className="w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin inline-block" />
                  <p className="text-slate-400 mt-4">Loading products...</p>
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-20 bg-slate-900/40 rounded-2xl border border-slate-700">
                  <Package className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400 text-lg">No products added yet</p>
                  <p className="text-slate-500 text-sm mt-1">Click "Add New Product" to get started</p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveTab("add")}
                    className="mt-4 px-6 py-2.5 bg-yellow-500 text-slate-900 font-semibold rounded-lg"
                  >
                    Add First Product
                  </motion.button>
                </div>
              ) : (
                <div className="space-y-4">
                  {products.map((product, i) => {
                    const cfg = statusConfig[product.status]
                    const isRejected = product.status === "REJECTED"
                    return (
                      <motion.div
                        key={product._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className={`relative border rounded-xl p-5 transition-colors ${
                          isRejected
                            ? "bg-slate-900/30 border-red-500/20 opacity-70"
                            : "bg-slate-900/60 border-slate-700 hover:border-yellow-500/30"
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row items-start sm:items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className={`font-bold text-lg ${isRejected ? "text-slate-400" : "text-white"}`}>
                                {product.productName}
                              </h3>
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${cfg.bg} ${cfg.color}`}>
                                {cfg.label}
                              </span>
                            </div>

                            {/* Rejection reason */}
                            {isRejected && product.rejectionReason && (
                              <motion.div
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-3 flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg"
                              >
                                <span className="text-red-400 text-sm shrink-0">⚠️</span>
                                <div>
                                  <p className="text-red-400 text-xs font-semibold mb-0.5">Rejection Reason:</p>
                                  <p className="text-red-300/80 text-sm italic">"{product.rejectionReason}"</p>
                                </div>
                              </motion.div>
                            )}

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                              <div>
                                <p className="text-slate-500 text-xs">Batch Number</p>
                                <p className={`font-medium ${isRejected ? "text-slate-500" : "text-slate-300"}`}>{product.batchNumber}</p>
                              </div>
                              <div>
                                <p className="text-slate-500 text-xs">Composition</p>
                                <p className={`font-medium ${isRejected ? "text-slate-500" : "text-slate-300"}`}>{product.composition}</p>
                              </div>
                              <div>
                                <p className="text-slate-500 text-xs">Mfg. Date</p>
                                <p className={`font-medium ${isRejected ? "text-slate-500" : "text-slate-300"}`}>{product.manufacturingDate}</p>
                              </div>
                              <div>
                                <p className="text-slate-500 text-xs">Expiry Date</p>
                                <p className={`font-medium ${isRejected ? "text-slate-500" : "text-slate-300"}`}>{product.expiryDate}</p>
                              </div>
                            </div>
                            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                              <span className="truncate">ID: {product._id}</span>
                              <span>Company: {product.companyId}</span>
                              <span>Submitted: {new Date(product.submittedAt).toLocaleDateString()}</span>
                            </div>
                          </div>

                          {/* Right side actions */}
                          <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0 w-full sm:w-auto">
                            {/* Delete bin button - only for rejected products */}
                            {isRejected && (
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleDeleteProduct(product._id)}
                                className="p-1.5 text-slate-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                title="Delete rejected product"
                              >
                                <Trash2 className="w-4 h-4" />
                              </motion.button>
                            )}

                            {/* QR Request Button */}
                            {product.qrCode ? (
                              // QR Generated - show image + download
                              <div className="flex flex-col items-end gap-2">
                                <div className="bg-white p-2 rounded-lg shadow-lg">
                                  <img
                                    src={product.qrCode}
                                    alt="QR Code"
                                    className="w-24 h-24 object-contain"
                                  />
                                </div>
                                <p className="text-xs text-emerald-400 font-medium">{product.productId}</p>
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => handleDownloadQR(product.qrCode!, product.productName, product.productId!)}
                                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-lg text-xs font-semibold hover:bg-emerald-500/30 transition-all"
                                >
                                  ⬇️ Download QR
                                </motion.button>
                              </div>
                            ) : product.qrRequested ? (
                              <div className="flex items-center gap-2 px-4 py-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-yellow-400 text-sm font-medium">
                                <Clock className="w-4 h-4" />
                                Generating QR...
                              </div>
                            ) : product.status === "APPROVED" ? (
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleRequestQR(product._id)}
                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-lime-500 text-white rounded-lg text-sm font-semibold hover:shadow-lg transition-all"
                              >
                                <QrCode className="w-4 h-4" />
                                Request QR Generation
                              </motion.button>
                            ) : isRejected ? (
                              <div className="flex items-center gap-2 px-4 py-2 bg-red-500/5 border border-red-500/10 rounded-lg text-slate-600 text-sm line-through">
                                <QrCode className="w-4 h-4" />
                                Awaiting Approval
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-500 text-sm">
                                <QrCode className="w-4 h-4" />
                                Awaiting Approval
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </motion.div>
          )}

          {/* Add Product Form */}
          {activeTab === "add" && (
            <motion.div
              key="add"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-slate-900/60 border border-slate-700 rounded-2xl p-6"
            >
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Plus className="w-5 h-5 text-yellow-400" />
                Add New Product
              </h2>

              {submitSuccess && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex items-center gap-3"
                >
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                  <div>
                    <p className="text-emerald-400 font-semibold">Product submitted successfully!</p>
                    <p className="text-emerald-300/70 text-sm">
                      {`{ "status": "PENDING", "companyId": "${session.companyId}" }`}
                    </p>
                  </div>
                </motion.div>
              )}

              <form onSubmit={handleSubmitProduct} className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-yellow-400 mb-3 uppercase tracking-wider">📦 Product Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { label: "Product Name", name: "productName", required: true, placeholder: "e.g. GreenGrow NPK Fertilizer" },
                      { label: "Product Type", name: "productType", required: true, placeholder: "e.g. NPK, Organic, Micronutrient" },
                      { label: "Composition", name: "composition", required: true, placeholder: "e.g. NPK 10:26:26" },
                      { label: "Batch Number", name: "batchNumber", required: true, placeholder: "e.g. BATCH-2024-001" },
                      { label: "Net Weight / Volume", name: "netWeight", placeholder: "e.g. 50 KG" },
                      { label: "Price Per KG (₹)", name: "pricePerKg", type: "number", placeholder: "e.g. 45" },
                      { label: "Target Crops", name: "targetCrops", placeholder: "e.g. Wheat, Rice, Sugarcane" },
                      { label: "Storage Conditions", name: "storageConditions", placeholder: "e.g. Cool dry place" },
                    ].map((field) => (
                      <div key={field.name}>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">
                          {field.label} {field.required && <span className="text-red-400">*</span>}
                        </label>
                        <input
                          type={field.type || "text"}
                          name={field.name}
                          value={form[field.name as keyof typeof form]}
                          onChange={handleChange}
                          required={field.required}
                          placeholder={field.placeholder}
                          className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-yellow-500 transition-colors text-sm"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-yellow-400 mb-3 uppercase tracking-wider">📅 Dates</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5">Manufacturing Date <span className="text-red-400">*</span></label>
                      <input type="date" name="manufacturingDate" value={form.manufacturingDate} onChange={handleChange} required
                        className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-yellow-500 transition-colors text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5">Expiry Date <span className="text-red-400">*</span></label>
                      <input type="date" name="expiryDate" value={form.expiryDate} onChange={handleChange} required
                        className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-yellow-500 transition-colors text-sm" />
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <motion.button
                    type="submit"
                    disabled={submitting}
                    whileHover={{ scale: submitting ? 1 : 1.02 }}
                    whileTap={{ scale: submitting ? 1 : 0.98 }}
                    className="flex-1 py-3 bg-gradient-to-r from-yellow-500 to-yellow-400 text-slate-900 font-bold rounded-lg hover:shadow-lg hover:shadow-yellow-500/20 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <><span className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" /> Submitting...</>
                    ) : (
                      <><ChevronRight className="w-5 h-5" /> Submit Product for Approval</>
                    )}
                  </motion.button>
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveTab("products")}
                    className="px-6 py-3 border border-slate-600 text-slate-300 font-semibold rounded-lg hover:bg-slate-800 transition-all"
                  >
                    Cancel
                  </motion.button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Product Submit Success Popup */}
      <AnimatePresence>
        {productSubmitPopup && (
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
              className="relative z-10 bg-slate-900 border border-yellow-500/30 rounded-3xl p-10 flex flex-col items-center gap-5 shadow-2xl max-w-sm w-full mx-4"
            >
              {/* Animated green tick circle */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 15, stiffness: 400, delay: 0.1 }}
                className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-lime-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30"
              >
                <motion.svg
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
                <h3 className="text-2xl font-bold text-white mb-2">Product Submitted!</h3>
                <p className="text-slate-400 text-sm">Your product has been sent for government review. You'll be notified once it's approved.</p>
              </motion.div>

              {/* Auto-close progress bar */}
              <motion.div className="w-full h-1 bg-slate-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: "100%" }}
                  animate={{ width: "0%" }}
                  transition={{ duration: 3, ease: "linear" }}
                  className="h-full bg-gradient-to-r from-yellow-500 to-yellow-400 rounded-full"
                />
              </motion.div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
