"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { ArrowLeft, CheckCircle, Package, Calendar, Building2, Hash } from "lucide-react"

interface Product {
  id: string
  name: string
  type: string
  composition: string
  manufacturer: string
  batch: string
  expiry: string
  status: string
  image: string
}

export default function RegCheckResult() {
  const [product, setProduct] = useState<Product | null>(null)
  const router = useRouter()

  useEffect(() => {
    const storedResult = localStorage.getItem('regCheckResult')
    if (storedResult) {
      setProduct(JSON.parse(storedResult))
      localStorage.removeItem('regCheckResult') // Clean up
    } else {
      router.push('/') // Redirect if no data
    }
  }, [router])

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 dark:from-slate-950 dark:to-slate-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-8"
        >
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => router.push('/')}
            className="p-3 rounded-full bg-white dark:bg-slate-800 shadow-lg hover:shadow-xl transition-all"
          >
            <ArrowLeft className="w-6 h-6 text-slate-600 dark:text-slate-300" />
          </motion.button>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Registration Check Result
          </h1>
        </motion.div>

        {/* Product Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700"
        >
          {/* Status Banner */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8" />
              <div>
                <h2 className="text-2xl font-bold">Verified Authentic</h2>
                <p className="text-green-100">This product is genuine and registered</p>
              </div>
            </div>
          </div>

          <div className="p-8">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Product Image */}
              <div className="flex justify-center">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="relative"
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-64 h-64 object-cover rounded-2xl shadow-xl"
                  />
                  <div className="absolute -top-2 -right-2 bg-green-500 text-white p-2 rounded-full">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                </motion.div>
              </div>

              {/* Product Details */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                    {product.name}
                  </h3>
                  <p className="text-lg text-slate-600 dark:text-slate-400">
                    {product.type}
                  </p>
                </div>

                <div className="grid gap-4">
                  <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    <Hash className="w-5 h-5 text-emerald-600" />
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Registration ID</p>
                      <p className="font-semibold text-slate-900 dark:text-white">{product.id}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    <Package className="w-5 h-5 text-emerald-600" />
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Composition</p>
                      <p className="font-semibold text-slate-900 dark:text-white">{product.composition}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    <Building2 className="w-5 h-5 text-emerald-600" />
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Manufacturer</p>
                      <p className="font-semibold text-slate-900 dark:text-white">{product.manufacturer}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                      <div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Batch</p>
                        <p className="font-semibold text-slate-900 dark:text-white">{product.batch}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                      <Calendar className="w-5 h-5 text-emerald-600" />
                      <div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Expiry</p>
                        <p className="font-semibold text-slate-900 dark:text-white">{product.expiry}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 mt-8 pt-8 border-t border-slate-200 dark:border-slate-700">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push('/')}
                className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-lime-500 text-white font-semibold rounded-lg hover:shadow-lg transition-all"
              >
                Check Another Product
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => window.print()}
                className="px-6 py-3 border-2 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-semibold rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-all"
              >
                Print Details
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}