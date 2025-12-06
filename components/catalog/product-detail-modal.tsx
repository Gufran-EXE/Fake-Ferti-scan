"use client"

import { motion, AnimatePresence } from "framer-motion"
import { X, Heart, AlertTriangle, CheckCircle, HelpCircle, Share2 } from "lucide-react"
import { useState } from "react"

interface Fertilizer {
  id: string
  name: string
  manufacturer: string
  image: string
  npk: { n: number; p: number; k: number }
  price: number
  status: "verified" | "suspected" | "unknown"
  type: string
  description: string
  reviews: number
  rating: number
}

interface ProductDetailModalProps {
  product: Fertilizer | null
  onClose: () => void
  isFavorite: boolean
  onFavorite: () => void
}

export default function ProductDetailModal({ product, onClose, isFavorite, onFavorite }: ProductDetailModalProps) {
  const [activeTab, setActiveTab] = useState<"details" | "safety" | "reports">("details")

  if (!product) return null

  const getStatusColor = (status: string) => {
    switch (status) {
      case "verified":
        return "text-[#00FF94]"
      case "suspected":
        return "text-destructive"
      case "unknown":
        return "text-muted-foreground"
      default:
        return "text-foreground"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "verified":
        return <CheckCircle className={`w-6 h-6 ${getStatusColor(status)}`} />
      case "suspected":
        return <AlertTriangle className={`w-6 h-6 ${getStatusColor(status)}`} />
      case "unknown":
        return <HelpCircle className={`w-6 h-6 ${getStatusColor(status)}`} />
      default:
        return null
    }
  }

  return (
    <AnimatePresence>
      {product && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, x: 400 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 400 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-2xl bg-card border-l border-border shadow-2xl z-50 overflow-y-auto"
          >
            {/* Close Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-lg hover:bg-muted transition-colors z-10"
            >
              <X className="w-5 h-5 text-foreground" />
            </motion.button>

            <div className="p-6 space-y-6">
              {/* Header */}
              <div className="space-y-4">
                <div className="relative overflow-hidden rounded-lg bg-muted aspect-video flex items-center justify-center">
                  <img
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h2 className="text-2xl font-bold text-foreground">{product.name}</h2>
                      <p className="text-muted-foreground">{product.manufacturer}</p>
                    </div>
                    <div className="flex gap-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onFavorite}
                        className={`p-2 rounded-lg transition-colors ${
                          isFavorite ? "bg-accent/10 text-accent" : "hover:bg-muted text-muted-foreground"
                        }`}
                      >
                        <Heart className={`w-5 h-5 ${isFavorite ? "fill-current" : ""}`} />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
                      >
                        <Share2 className="w-5 h-5" />
                      </motion.button>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="flex items-center gap-2 mb-4">
                    {getStatusIcon(product.status)}
                    <span className={`font-semibold capitalize ${getStatusColor(product.status)}`}>
                      {product.status}
                    </span>
                  </div>

                  {/* Quick Info */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground mb-1">Price</p>
                      <p className="text-lg font-bold text-accent">₹{product.price}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground mb-1">Rating</p>
                      <p className="text-lg font-bold text-foreground">{product.rating}/5 ★</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground mb-1">Reviews</p>
                      <p className="text-lg font-bold text-foreground">{product.reviews}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="border-b border-border">
                <div className="flex gap-4">
                  {(["details", "safety", "reports"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`pb-3 px-1 font-medium text-sm border-b-2 transition-colors ${
                        activeTab === tab
                          ? "border-accent text-accent"
                          : "border-transparent text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Content */}
              <div className="space-y-4">
                {activeTab === "details" && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">Description</h3>
                      <p className="text-muted-foreground text-sm">{product.description}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-3">Composition (NPK)</h3>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="p-3 rounded-lg bg-primary/10 border border-primary/30">
                          <p className="text-xs text-muted-foreground mb-1">Nitrogen (N)</p>
                          <p className="text-2xl font-bold text-foreground">{product.npk.n}%</p>
                        </div>
                        <div className="p-3 rounded-lg bg-primary/10 border border-primary/30">
                          <p className="text-xs text-muted-foreground mb-1">Phosphorus (P)</p>
                          <p className="text-2xl font-bold text-foreground">{product.npk.p}%</p>
                        </div>
                        <div className="p-3 rounded-lg bg-primary/10 border border-primary/30">
                          <p className="text-xs text-muted-foreground mb-1">Potassium (K)</p>
                          <p className="text-2xl font-bold text-foreground">{product.npk.k}%</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "safety" && (
                  <div className="space-y-4">
                    <div className="bg-muted/50 p-4 rounded-lg border border-border">
                      <h4 className="font-semibold text-foreground mb-2">Usage Instructions</h4>
                      <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                        <li>Apply 40-50 kg per hectare for best results</li>
                        <li>Use during pre-planting soil preparation</li>
                        <li>Store in cool, dry place away from moisture</li>
                        <li>Wear gloves while handling</li>
                      </ul>
                    </div>
                    <div className="bg-destructive/10 p-4 rounded-lg border border-destructive/30">
                      <h4 className="font-semibold text-destructive mb-2">Safety Warnings</h4>
                      <p className="text-sm text-destructive/80">
                        Keep away from children and animals. In case of ingestion, seek medical attention immediately.
                      </p>
                    </div>
                  </div>
                )}

                {activeTab === "reports" && (
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-muted/50 border border-border">
                      <p className="text-muted-foreground text-sm mb-4">
                        Total fraud reports on this product: <span className="font-bold text-foreground">2 cases</span>
                      </p>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-full py-2 rounded-lg border-2 border-destructive text-destructive font-medium text-sm hover:bg-destructive/5 transition-colors"
                      >
                        Report as Fraudulent
                      </motion.button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
