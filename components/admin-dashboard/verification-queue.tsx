"use client"

import { motion } from "framer-motion"
import { ChevronRight, AlertTriangle } from "lucide-react"

export default function VerificationQueue({ reports }: { reports: any[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-slate-800/50 backdrop-blur-sm border border-emerald-500/20 rounded-lg p-6 space-y-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-white flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          Verification Queue
        </h3>
        <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-1 rounded-full">{reports.length} pending</span>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2">
        {reports.map((report, idx) => (
          <motion.div
            key={report.id}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            whileHover={{ y: -4 }}
            className="flex-shrink-0 w-80 bg-gradient-to-br from-slate-700/50 to-slate-800/50 border border-emerald-500/20 rounded-lg p-4 space-y-3 hover:border-emerald-500/50 transition-colors cursor-pointer"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="font-mono text-sm text-emerald-400">{report.id}</p>
                <p className="font-semibold text-white mt-1">{report.product}</p>
              </div>
              <motion.div whileHover={{ x: 4 }}>
                <ChevronRight className="w-4 h-4 text-emerald-400" />
              </motion.div>
            </div>

            <div className="space-y-1 text-xs text-white">
              <p>Reporter: {report.reporter}</p>
              <p>Region: {report.region}</p>
            </div>

            <div className="pt-2 border-t border-emerald-500/10">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Review Now
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
