"use client"

import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { FileText, Heart, LogOut, Home } from 'lucide-react'

interface Favorite {
  id: string
  productName: string
  registrationNo: string
}

interface LeftSidebarProps {
  favorites: Favorite[]
}

export default function LeftSidebar({ favorites }: LeftSidebarProps) {
  const router = useRouter()
  
  const menuItems = [
    { icon: Home, label: "Dashboard", href: "#" },
    { icon: FileText, label: "My Reports", href: "#" },
    { icon: Heart, label: "Favorites", href: "#" },
  ]

  return (
    <motion.aside
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="space-y-6 sticky top-24"
    >
      {/* Profile Card */}
      <motion.div
        className="rounded-2xl backdrop-blur-xl border border-white/20 dark:border-white/10 p-6 overflow-hidden"
        style={{
          background: "var(--card)",
        }}
        whileHover={{ y: -2 }}
      >
        <div className="flex flex-col items-center">
          <motion.div
            className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-lime-400 flex items-center justify-center text-3xl mb-4"
            whileHover={{ scale: 1.1 }}
          >
            👨‍🌾
          </motion.div>
          <h3 className="font-bold text-white text-center">Sudarshan Ahire</h3>
          <p className="text-sm text-white/70 text-center mt-1">Maharashtra, India</p>
          <p className="text-xs text-white/60 mt-3">Farm Size: 5 Acres</p>
        </div>
      </motion.div>

      {/* Quick Links */}
      <div className="space-y-2">
        {menuItems.map((item, idx) => (
          <motion.a
            key={idx}
            href={item.href}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + idx * 0.1 }}
            className="flex items-center gap-3 px-4 py-3 rounded-lg bg-slate-100 dark:bg-slate-800/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors text-white dark:text-white font-medium"
            whileHover={{ x: 4 }}
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </motion.a>
        ))}
      </div>

      {/* Favorites Preview */}
      <motion.div
        className="rounded-2xl backdrop-blur-xl border border-white/20 dark:border-white/10 p-4 overflow-hidden"
        style={{
          background: "var(--card)",
        }}
      >
        <h4 className="font-semibold text-white mb-3 text-sm">Saved Items ({favorites.length})</h4>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {favorites.length > 0 ? (
            favorites.map((fav) => (
              <motion.div
                key={fav.id}
                className="text-xs p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg text-white dark:text-white hover:bg-emerald-50 dark:hover:bg-emerald-900/20 cursor-pointer transition-colors"
                whileHover={{ x: 2 }}
              >
                <p className="font-medium truncate">{fav.productName}</p>
                <p className="text-white/60">{fav.registrationNo}</p>
              </motion.div>
            ))
          ) : (
            <p className="text-xs text-white/50 italic">No saved items yet</p>
          )}
        </div>
      </motion.div>

      {/* Logout */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => router.push('/')}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors font-medium"
      >
        <LogOut className="w-4 h-4" />
        Logout
      </motion.button>
    </motion.aside>
  )
}
