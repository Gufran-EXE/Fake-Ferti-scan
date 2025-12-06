"use client"

import { motion } from "framer-motion"
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { MapPin } from "lucide-react"

export default function AnalyticsPanel({ reports }: { reports: any[] }) {
  // Calculate status distribution
  const statusCounts = reports.reduce((acc, report) => {
    const status = report.status
    acc[status] = (acc[status] || 0) + 1
    return acc
  }, {})

  const statusData = [
    { name: "Open", value: statusCounts.open || 0, color: "#F59E0B" },
    { name: "Triaged", value: statusCounts.triaged || 0, color: "#3B82F6" },
    { name: "Verified", value: statusCounts.verified || 0, color: "#10B981" },
    { name: "Closed", value: statusCounts.closed || 0, color: "#6B7280" },
  ]

  // Weekly reports data
  const weeklyData = [
    { name: "Mon", reports: 12 },
    { name: "Tue", reports: 19 },
    { name: "Wed", reports: 15 },
    { name: "Thu", reports: 22 },
    { name: "Fri", reports: 25 },
    { name: "Sat", reports: 18 },
    { name: "Sun", reports: 14 },
  ]

  // Region clusters
  const regionClusters = [
    { region: "Maharashtra", count: 8, color: "#00FF94" },
    { region: "Punjab", count: 6, color: "#00FF94" },
    { region: "Karnataka", count: 5, color: "#00FF94" },
    { region: "Haryana", count: 4, color: "#00FF94" },
    { region: "Tamil Nadu", count: 3, color: "#00FF94" },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="space-y-6"
    >
      {/* Status Distribution */}
      <motion.div
        whileHover={{ y: -2 }}
        className="bg-slate-800/50 backdrop-blur-sm border border-emerald-500/20 rounded-lg p-6 space-y-4"
      >
        <h3 className="font-semibold text-white">Status Distribution</h3>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} dataKey="value">
              {statusData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "#0f172a",
                border: "1px solid #10b981",
                borderRadius: "8px",
                color: "#fff",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {statusData.map((item) => (
            <div key={item.name} className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-white">
                {item.name}: {item.value}
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Weekly Reports */}
      <motion.div
        whileHover={{ y: -2 }}
        className="bg-slate-800/50 backdrop-blur-sm border border-emerald-500/20 rounded-lg p-6 space-y-4"
      >
        <h3 className="font-semibold text-white">Reports by Week</h3>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={weeklyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#10b98122" />
            <XAxis dataKey="name" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#0f172a",
                border: "1px solid #10b981",
                borderRadius: "8px",
                color: "#fff",
              }}
            />
            <Bar dataKey="reports" fill="#10b981" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Region Heatmap */}
      <motion.div
        whileHover={{ y: -2 }}
        className="bg-slate-800/50 backdrop-blur-sm border border-emerald-500/20 rounded-lg p-6 space-y-4"
      >
        <div className="flex items-center gap-2 font-semibold text-white">
          <MapPin className="w-4 h-4 text-emerald-400" />
          Region Heatmap
        </div>
        <div className="space-y-3">
          {regionClusters.map((item) => (
            <motion.div
              key={item.region}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ x: 4 }}
              className="space-y-1"
            >
              <div className="flex justify-between text-xs text-white">
                <span>{item.region}</span>
                <span className="font-semibold text-emerald-400">{item.count}</span>
              </div>
              <div className="w-full bg-slate-700/50 rounded-full h-2 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(item.count / 8) * 100}%` }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400"
                />
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}
