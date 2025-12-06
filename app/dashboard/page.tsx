"use client"

import { useState, useEffect } from "react"
import { AnimatePresence } from "framer-motion"
import DashboardHeader from "@/components/dashboard/header"
import LeftSidebar from "@/components/dashboard/left-sidebar"
import QuickCheckWidget from "@/components/dashboard/quick-check-widget"
import RecentChecksList from "@/components/dashboard/recent-checks-list"
import RightSidebar from "@/components/dashboard/right-sidebar"
import ProductDetailModal from "@/components/dashboard/product-detail-modal"

interface RecentCheck {
  id: string
  productName: string
  registrationNo: string
  status: "verified" | "suspected"
  timestamp: string
  image: string
}

interface Favorite {
  id: string
  productName: string
  registrationNo: string
}

export default function DashboardPage() {
  const [isLoaded, setIsLoaded] = useState(false)
  const [selectedCheck, setSelectedCheck] = useState<RecentCheck | null>(null)
  const [favorites, setFavorites] = useState<Favorite[]>([
    { id: "1", productName: "GreenGrow NPK 20:20:20", registrationNo: "REG-2024-001" },
    { id: "2", productName: "FarmBoost Plus", registrationNo: "REG-2024-002" },
  ])

  const [recentChecks] = useState<RecentCheck[]>([
    {
      id: "1",
      productName: "GreenGrow NPK 20:20:20",
      registrationNo: "REG-2024-001",
      status: "verified",
      timestamp: "2 hours ago",
      image: "/fertilizer-package.jpg",
    },
    {
      id: "2",
      productName: "SoilMax Calcium",
      registrationNo: "REG-2024-003",
      status: "suspected",
      timestamp: "5 hours ago",
      image: "/fertilizer-bag.jpg",
    },
    {
      id: "3",
      productName: "OrganicPro Compost",
      registrationNo: "REG-2024-005",
      status: "verified",
      timestamp: "1 day ago",
      image: "/compost-bag.jpg",
    },
    {
      id: "4",
      productName: "Micro Blend Plus",
      registrationNo: "REG-2024-007",
      status: "verified",
      timestamp: "2 days ago",
      image: "/micronutrient.jpg",
    },
    {
      id: "5",
      productName: "PotassiumMax",
      registrationNo: "REG-2024-009",
      status: "suspected",
      timestamp: "3 days ago",
      image: "/potassium-fertilizer.jpg",
    },
  ])

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  const toggleFavorite = (check: RecentCheck) => {
    const isFavorited = favorites.some((fav) => fav.id === check.id)
    if (isFavorited) {
      setFavorites(favorites.filter((fav) => fav.id !== check.id))
    } else {
      setFavorites([
        ...favorites,
        {
          id: check.id,
          productName: check.productName,
          registrationNo: check.registrationNo,
        },
      ])
    }
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 dark:from-slate-950 dark:to-slate-900">
      {/* Animated background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "linear-gradient(135deg, #0F172A 0%, #1B5E20 50%, #0F172A 100%)",
            filter: "blur(60px)",
            opacity: 0.2,
          }}
        />
      </div>

      {/* Header */}
      <DashboardHeader isDark={true} />

      {/* Main content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar */}
          <div className="lg:col-span-3">
            <LeftSidebar favorites={favorites} />
          </div>

          {/* Center Content */}
          <div className="lg:col-span-6 space-y-6">
            <QuickCheckWidget />
            <RecentChecksList
              checks={recentChecks}
              favorites={favorites}
              onCheckClick={setSelectedCheck}
              onToggleFavorite={toggleFavorite}
            />
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-3">
            <RightSidebar />
          </div>
        </div>
      </main>

      {/* Product Detail Modal */}
      <AnimatePresence>
        {selectedCheck && <ProductDetailModal check={selectedCheck} onClose={() => setSelectedCheck(null)} />}
      </AnimatePresence>
    </div>
  )
}
