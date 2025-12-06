"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ChevronUp, ChevronDown, Eye, CheckCircle, AlertTriangle, Download } from "lucide-react"

interface Report {
  id: string
  product: string
  reporter: string
  region: string
  status: string
  createdAt: string
}

export default function ReportsTable({
  reports,
  onSelectReport,
}: { reports: Report[]; onSelectReport: (report: Report) => void }) {
  const [sortBy, setSortBy] = useState("createdAt")
  const [sortOrder, setSortOrder] = useState("desc")
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())

  const sortedReports = [...reports].sort((a, b) => {
    const aVal = a[sortBy as keyof Report]
    const bVal = b[sortBy as keyof Report]

    if (sortOrder === "asc") {
      return aVal > bVal ? 1 : -1
    }
    return aVal < bVal ? 1 : -1
  })

  const toggleRow = (id: string) => {
    const newSelected = new Set(selectedRows)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedRows(newSelected)
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      open: "bg-amber-500/20 text-amber-400 border-amber-500/30",
      triaged: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      verified: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
      closed: "bg-slate-500/20 text-slate-400 border-slate-500/30",
    }
    return colors[status] || colors.open
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "verified":
        return <CheckCircle className="w-4 h-4" />
      case "triaged":
        return <AlertTriangle className="w-4 h-4" />
      default:
        return null
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      {/* Toolbar */}
      {selectedRows.size > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4 flex items-center justify-between"
        >
          <span className="text-sm font-medium text-white">{selectedRows.size} selected</span>
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-3 py-1 text-sm bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors"
            >
              Assign
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-3 py-1 text-sm bg-slate-700 hover:bg-slate-600 text-white rounded-lg flex items-center gap-2 transition-colors"
            >
              <Download className="w-3 h-3" />
              Export
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Table */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-emerald-500/20 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-emerald-500/10 bg-slate-900/50">
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedRows.size === reports.length && reports.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedRows(new Set(reports.map((r) => r.id)))
                      } else {
                        setSelectedRows(new Set())
                      }
                    }}
                    className="w-4 h-4 cursor-pointer"
                  />
                </th>
                {[
                  { key: "id", label: "Report ID" },
                  { key: "product", label: "Product" },
                  { key: "reporter", label: "Reporter" },
                  { key: "region", label: "Region" },
                  { key: "status", label: "Status" },
                  { key: "createdAt", label: "Created At" },
                  { key: "actions", label: "Actions" },
                ].map((col) => (
                  <th
                    key={col.key}
                    className="px-4 py-3 text-left font-semibold text-white cursor-pointer hover:text-emerald-400 transition-colors"
                    onClick={() => {
                      if (col.key !== "actions") {
                        setSortBy(col.key)
                        setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                      }
                    }}
                  >
                    <div className="flex items-center gap-2">
                      {col.label}
                      {col.key === sortBy && sortOrder === "asc" && <ChevronUp className="w-3 h-3" />}
                      {col.key === sortBy && sortOrder === "desc" && <ChevronDown className="w-3 h-3" />}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedReports.map((report, idx) => (
                <motion.tr
                  key={report.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className="border-b border-emerald-500/10 hover:bg-emerald-500/5 transition-colors group"
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedRows.has(report.id)}
                      onChange={() => toggleRow(report.id)}
                      className="w-4 h-4 cursor-pointer"
                    />
                  </td>
                  <td className="px-4 py-3 font-mono text-emerald-400">{report.id}</td>
                  <td className="px-4 py-3 text-white">{report.product}</td>
                  <td className="px-4 py-3 text-white">{report.reporter}</td>
                  <td className="px-4 py-3 text-white">{report.region}</td>
                  <td className="px-4 py-3">
                    <div
                      className={`inline-flex items-center gap-2 px-2 py-1 rounded-full border ${getStatusColor(report.status)} text-xs font-medium`}
                    >
                      {getStatusIcon(report.status)}
                      {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-white">{report.createdAt}</td>
                  <td className="px-4 py-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => onSelectReport(report)}
                      className="p-1 text-emerald-400 hover:text-emerald-300 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </motion.button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center text-sm text-white">
        <span>
          Showing {sortedReports.length} of {reports.length} reports
        </span>
        <div className="flex gap-2">
          <motion.button whileHover={{ scale: 1.05 }} className="px-3 py-1 hover:text-emerald-400 transition-colors">
            Previous
          </motion.button>
          <span className="px-3 py-1">1 / 4</span>
          <motion.button whileHover={{ scale: 1.05 }} className="px-3 py-1 hover:text-emerald-400 transition-colors">
            Next
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}
