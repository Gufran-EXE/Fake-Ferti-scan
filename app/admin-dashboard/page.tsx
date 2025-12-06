"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import AdminHeader from "@/components/admin-dashboard/admin-header"
import ReportsTable from "@/components/admin-dashboard/reports-table"
import AnalyticsPanel from "@/components/admin-dashboard/analytics-panel"
import VerificationQueue from "@/components/admin-dashboard/verification-queue"
import ReportDetailSlideOver from "@/components/admin-dashboard/report-detail-slide-over"

interface Report {
  id: string
  product: string
  reporter: string
  region: string
  status: string
  createdAt: string
  description?: string
  images?: string[]
  location?: { lat: number; lng: number }
}

export default function AdminDashboard() {
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [showSlideOver, setShowSlideOver] = useState(false)

  const mockReports = [
    {
      id: "RPT-001",
      product: "GreenGrow Fertilizer",
      reporter: "Raj Patel",
      region: "Maharashtra",
      status: "open",
      createdAt: "2024-11-10 14:32",
      description: "Product packaging appears counterfeit",
      images: ["/fertilizer-package.jpg"],
      location: { lat: 19.7515, lng: 75.7139 },
    },
    {
      id: "RPT-002",
      product: "NutriMax NPK",
      reporter: "Amrita Singh",
      region: "Punjab",
      status: "triaged",
      createdAt: "2024-11-09 09:15",
      description: "QR code verification failed",
      images: ["/fertilizer-packaging.jpg"],
      location: { lat: 31.1471, lng: 75.3412 },
    },
    {
      id: "RPT-003",
      product: "EcoFarm Organic",
      reporter: "Vikram Kumar",
      region: "Karnataka",
      status: "verified",
      createdAt: "2024-11-08 16:45",
      description: "Authentic product confirmed",
      images: ["/organic-fertilizer.jpg"],
      location: { lat: 15.3173, lng: 75.7139 },
    },
    {
      id: "RPT-004",
      product: "MegaYield Premium",
      reporter: "Harjit Kaur",
      region: "Haryana",
      status: "open",
      createdAt: "2024-11-07 11:22",
      description: "Suspicious batch numbers detected",
      images: ["/fertilizer-bag.jpg"],
      location: { lat: 29.0588, lng: 77.0745 },
    },
    {
      id: "RPT-005",
      product: "FarmPro Elite",
      reporter: "Meera Nair",
      region: "Tamil Nadu",
      status: "closed",
      createdAt: "2024-11-06 13:50",
      description: "False alarm - authentic batch",
      images: ["/farm-product.jpg"],
      location: { lat: 11.1271, lng: 78.6569 },
    },
  ]

  // Generate more mock data for 20 total reports
  const allReports = [
    ...mockReports,
    ...Array.from({ length: 15 }, (_, i) => ({
      id: `RPT-${String(i + 6).padStart(3, "0")}`,
      product: ["SoilMax", "CropBoost", "YieldMax", "GreenPlus", "FertilPro"][i % 5],
      reporter: ["Farmer " + (i + 1)][0],
      region: ["UP", "MP", "Gujarat", "Rajasthan", "AP", "Bihar"][i % 6],
      status: ["open", "triaged", "verified", "closed"][i % 4],
      createdAt: `2024-11-${String((5 - Math.floor(i / 3)) % 30).padStart(2, "0")} ${String(8 + (i % 8)).padStart(2, "0")}:${String((i * 7) % 60).padStart(2, "0")}`,
      description: "Report description",
      images: ["/fertilizer-application.png"],
      location: { lat: 20 + Math.random() * 15, lng: 72 + Math.random() * 20 },
    })),
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Grid Background */}
      <div className="fixed inset-0 opacity-5 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
            linear-gradient(0deg, transparent 24%, rgba(0, 255, 148, .05) 25%, rgba(0, 255, 148, .05) 26%, transparent 27%, transparent 74%, rgba(0, 255, 148, .05) 75%, rgba(0, 255, 148, .05) 76%, transparent 77%, transparent),
            linear-gradient(90deg, transparent 24%, rgba(0, 255, 148, .05) 25%, rgba(0, 255, 148, .05) 26%, transparent 27%, transparent 74%, rgba(0, 255, 148, .05) 75%, rgba(0, 255, 148, .05) 76%, transparent 77%, transparent)
          `,
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      <div className="relative z-10">
        <AdminHeader />

        <main className="container mx-auto px-4 py-8 space-y-8">
          {/* Main Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Panel - Reports Table */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-2"
            >
              <ReportsTable
                reports={allReports}
                onSelectReport={(report) => {
                  setSelectedReport(report)
                  setShowSlideOver(true)
                }}
              />
            </motion.div>

            {/* Right Panel - Analytics */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="space-y-6"
            >
              <AnalyticsPanel reports={allReports} />
            </motion.div>
          </div>

          {/* Bottom Panel - Verification Queue */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <VerificationQueue reports={allReports.filter((r) => r.status === "triaged").slice(0, 5)} />
          </motion.div>
        </main>
      </div>

      {/* Report Detail Slide Over */}
      {selectedReport && (
        <ReportDetailSlideOver
          report={selectedReport}
          isOpen={showSlideOver}
          onClose={() => {
            setShowSlideOver(false)
            setTimeout(() => setSelectedReport(null), 300)
          }}
        />
      )}
    </div>
  )
}
