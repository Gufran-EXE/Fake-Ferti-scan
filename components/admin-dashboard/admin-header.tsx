"use client"

import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Bell, Search, LogOut } from "lucide-react"
import { useState } from "react"

export default function AdminHeader() {
  const router = useRouter()
  const [showNotifications, setShowNotifications] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const notifications = [
    { id: 1, text: "New report from Maharashtra", time: "2 min ago", unread: true },
    { id: 2, text: "Report #RPT-001 escalated", time: "15 min ago", unread: true },
    { id: 3, text: "Batch verification completed", time: "1 hour ago", unread: false },
  ]

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-50 backdrop-blur-xl bg-slate-900/80 border-b border-emerald-500/20"
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <motion.div 
            whileHover={{ scale: 1.05 }} 
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => router.push('/')}
          >
            <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">FFD</span>
            </div>
            <span className="font-semibold text-white hidden sm:inline">Admin Panel</span>
          </motion.div>

          {/* Search */}
          <div className="flex-1 max-w-md hidden sm:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500/60" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search reports..."
                className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-emerald-500/20 rounded-lg text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              </motion.button>

              {/* Notification Dropdown */}
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 mt-2 w-80 bg-slate-800/95 backdrop-blur-xl border border-emerald-500/20 rounded-lg shadow-lg overflow-hidden"
                >
                  <div className="p-4 border-b border-emerald-500/10">
                    <h3 className="font-semibold text-white">Notifications</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.map((notif) => (
                      <motion.div
                        key={notif.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`p-4 border-b border-emerald-500/10 last:border-0 ${
                          notif.unread ? "bg-emerald-500/5" : ""
                        } cursor-pointer hover:bg-emerald-500/10 transition-colors`}
                      >
                        <p className="text-sm font-medium text-white">{notif.text}</p>
                        <p className="text-xs text-white/50 mt-1">{notif.time}</p>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* User Menu */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/')}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-emerald-500/10 transition-colors group"
              title="Logout"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center text-white font-semibold text-sm">
                A
              </div>
              <span className="text-sm text-white hidden sm:inline">Admin</span>
              <motion.div
                whileHover={{ rotate: 180 }}
                transition={{ duration: 0.3 }}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <LogOut className="w-4 h-4 text-red-500" />
              </motion.div>
            </motion.button>
          </div>
        </div>
      </div>
    </motion.header>
  )
}
