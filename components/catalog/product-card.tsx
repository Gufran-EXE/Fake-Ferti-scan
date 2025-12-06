"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Heart, Eye, AlertTriangle, CheckCircle, HelpCircle } from "lucide-react"

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

interface ProductCardProps {
  product: Fertilizer
  isFavorite: boolean
  onFavorite: () => void
  onViewDetails: () => void
}

export default function ProductCard({ product, isFavorite, onFavorite, onViewDetails }: ProductCardProps) {
  const [isFlipped, setIsFlipped] = useState(false)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "verified":
        return "border-[#00FF94] bg-[#00FF94]/5"
      case "suspected":
        return "border-destructive bg-destructive/5"
      case "unknown":
        return "border-muted bg-muted/5"
      default:
        return "border-border"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "verified":
        return <CheckCircle className="w-4 h-4 text-[#00FF94]" />
      case "suspected":
        return <AlertTriangle className="w-4 h-4 text-destructive" />
      case "unknown":
        return <HelpCircle className="w-4 h-4 text-muted-foreground" />
      default:
        return null
    }
  }

  return (
    <motion.div
      className="h-full"
      whileHover={{ y: -4 }}
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
    >
      <motion.div
        className="relative h-full rounded-xl overflow-hidden border border-border bg-card shadow-lg hover:shadow-xl transition-shadow"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.4 }}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Front */}
        <motion.div className="p-4 space-y-3" style={{ backfaceVisibility: "hidden" }}>
          {/* Image */}
          <div className="relative overflow-hidden rounded-lg bg-muted aspect-square flex items-center justify-center">
            <img src={product.image || "/placeholder.svg"} alt={product.name} className="w-full h-full object-cover" />
            {/* Status Badge */}
            <div
              className={`absolute top-2 right-2 px-2 py-1 rounded-lg border ${getStatusColor(product.status)} flex items-center gap-1 bg-card/90 backdrop-blur-sm`}
            >
              {getStatusIcon(product.status)}
              <span className="text-xs font-medium text-foreground capitalize">{product.status}</span>
            </div>
          </div>

          {/* Content */}
          <div>
            <h3 className="font-semibold text-foreground line-clamp-2 text-sm">{product.name}</h3>
            <p className="text-xs text-muted-foreground">{product.manufacturer}</p>
          </div>

          {/* NPK Chips */}
          <div className="flex gap-1">
            <div className="px-2 py-1 rounded-full bg-primary/10 border border-primary/30 text-xs font-medium text-foreground">
              N: {product.npk.n}
            </div>
            <div className="px-2 py-1 rounded-full bg-primary/10 border border-primary/30 text-xs font-medium text-foreground">
              P: {product.npk.p}
            </div>
            <div className="px-2 py-1 rounded-full bg-primary/10 border border-primary/30 text-xs font-medium text-foreground">
              K: {product.npk.k}
            </div>
          </div>

          {/* Price & Rating */}
          <div className="flex justify-between items-end pt-2 border-t border-border">
            <div>
              <p className="text-xs text-muted-foreground">Price</p>
              <p className="text-lg font-bold text-accent">₹{product.price}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">{product.reviews} reviews</p>
              <p className="text-sm font-semibold text-foreground">{product.rating} ★</p>
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-2 pt-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onViewDetails}
              className="py-2 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-1"
            >
              <Eye className="w-3 h-3" />
              View
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onFavorite}
              className={`py-2 rounded-lg border text-xs font-medium transition-colors flex items-center justify-center gap-1 ${
                isFavorite
                  ? "bg-accent/10 border-accent text-accent"
                  : "border-border text-muted-foreground hover:border-primary hover:text-primary"
              }`}
            >
              <Heart className={`w-3 h-3 ${isFavorite ? "fill-current" : ""}`} />
              Save
            </motion.button>
          </div>
        </motion.div>

        {/* Back */}
        <motion.div
          className="absolute inset-0 p-4 bg-card rounded-xl border border-border flex flex-col justify-between"
          style={{ backfaceVisibility: "hidden", rotateY: 180 }}
        >
          <div>
            <h4 className="font-semibold text-foreground mb-2 text-sm">About</h4>
            <p className="text-xs text-muted-foreground leading-relaxed mb-4">{product.description}</p>
            <div className="space-y-2 text-xs">
              <p className="text-muted-foreground">
                <span className="font-medium text-foreground">Type:</span> {product.type}
              </p>
              <p className="text-muted-foreground">
                <span className="font-medium text-foreground">Rating:</span> {product.rating}/5
              </p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05, backgroundColor: "rgba(0, 255, 148, 0.2)" }}
            whileTap={{ scale: 0.95 }}
            className="w-full py-2 rounded-lg border-2 border-destructive text-destructive font-medium text-xs hover:bg-destructive/5 transition-colors"
          >
            Report Fraud
          </motion.button>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
