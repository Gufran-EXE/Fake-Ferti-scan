"use client"

import { motion } from "framer-motion"
import { useState } from "react"

interface CatalogFiltersProps {
  filters: {
    types: string[]
    manufacturer: string
    priceRange: [number, number]
    status: string[]
  }
  setFilters: (filters: any) => void
}

const FERTILIZER_TYPES = [
  "compound",
  "organic",
  "phosphate",
  "potassic",
  "bio-fertilizer",
  "micro-nutrient",
  "nitrogen",
]
const STATUSES = ["verified", "suspected", "unknown"]

export default function CatalogFilters({ filters, setFilters }: CatalogFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  const toggleType = (type: string) => {
    const newTypes = filters.types.includes(type) ? filters.types.filter((t) => t !== type) : [...filters.types, type]
    setFilters({ ...filters, types: newTypes })
  }

  const toggleStatus = (status: string) => {
    const newStatus = filters.status.includes(status)
      ? filters.status.filter((s) => s !== status)
      : [...filters.status, status]
    setFilters({ ...filters, status: newStatus })
  }

  return (
    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="sticky top-40 space-y-6">
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Filters</h3>

        {/* Type Filter */}
        <div className="mb-6">
          <h4 className="font-medium text-foreground mb-3">Fertilizer Type</h4>
          <div className="space-y-2">
            {FERTILIZER_TYPES.map((type) => (
              <label key={type} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={filters.types.includes(type)}
                  onChange={() => toggleType(type)}
                  className="w-4 h-4 rounded border-border text-accent accent-accent"
                />
                <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors capitalize">
                  {type.replace("-", " ")}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Status Filter */}
        <div className="mb-6">
          <h4 className="font-medium text-foreground mb-3">Verification Status</h4>
          <div className="space-y-2">
            {STATUSES.map((status) => (
              <label key={status} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={filters.status.includes(status)}
                  onChange={() => toggleStatus(status)}
                  className="w-4 h-4 rounded border-border text-accent accent-accent"
                />
                <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors capitalize">
                  {status}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Manufacturer Filter */}
        <div className="mb-6">
          <h4 className="font-medium text-foreground mb-3">Manufacturer</h4>
          <input
            type="text"
            placeholder="Search manufacturer..."
            value={filters.manufacturer}
            onChange={(e) => setFilters({ ...filters, manufacturer: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        {/* Price Slider */}
        <div>
          <h4 className="font-medium text-foreground mb-3">Price Range</h4>
          <div className="space-y-2">
            <input
              type="range"
              min="0"
              max="1500"
              value={filters.priceRange[0]}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  priceRange: [Number(e.target.value), filters.priceRange[1]],
                })
              }
              className="w-full"
            />
            <input
              type="range"
              min="0"
              max="1500"
              value={filters.priceRange[1]}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  priceRange: [filters.priceRange[0], Number(e.target.value)],
                })
              }
              className="w-full"
            />
            <div className="text-sm text-muted-foreground pt-2">
              ₹{filters.priceRange[0]} - ₹{filters.priceRange[1]}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
