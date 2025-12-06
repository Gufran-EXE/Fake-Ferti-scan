"use client"

import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import Navbar from "@/components/navbar"
import CatalogFilters from "@/components/catalog/catalog-filters"
import ProductCard from "@/components/catalog/product-card"
import ProductDetailModal from "@/components/catalog/product-detail-modal"

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

const mockFertilizers: Fertilizer[] = [
  {
    id: "1",
    name: "GreenGrow NPK 20-20-20",
    manufacturer: "AgroTech Industries",
    image: "/fertilizer-green-package.jpg",
    npk: { n: 20, p: 20, k: 20 },
    price: 850,
    status: "verified",
    type: "compound",
    description: "High-quality balanced fertilizer for all crops",
    reviews: 245,
    rating: 4.8,
  },
  {
    id: "2",
    name: "NutriMaxx Organic",
    manufacturer: "Organic Farms Co",
    image: "/organic-fertilizer-brown.jpg",
    npk: { n: 15, p: 10, k: 15 },
    price: 1200,
    status: "verified",
    type: "organic",
    description: "100% organic fertilizer with natural nutrients",
    reviews: 189,
    rating: 4.9,
  },
  {
    id: "3",
    name: "PhosBoost Premium",
    manufacturer: "PhosAgro Ltd",
    image: "/phosphorus-fertilizer-yellow.jpg",
    npk: { n: 10, p: 25, k: 10 },
    price: 920,
    status: "verified",
    type: "phosphate",
    description: "Phosphorus-rich formula for flowering crops",
    reviews: 156,
    rating: 4.6,
  },
  {
    id: "4",
    name: "PotassiumPro Max",
    manufacturer: "ChemCrop Solutions",
    image: "/potassium-fertilizer-red.jpg",
    npk: { n: 12, p: 8, k: 30 },
    price: 1050,
    status: "suspected",
    type: "potassic",
    description: "High potassium content for root development",
    reviews: 98,
    rating: 3.4,
  },
  {
    id: "5",
    name: "CropShield Enhanced",
    manufacturer: "BioDefense Corp",
    image: "/crop-protection-fertilizer.jpg",
    npk: { n: 16, p: 12, k: 18 },
    price: 1350,
    status: "verified",
    type: "bio-fertilizer",
    description: "Enriched with beneficial microbes",
    reviews: 312,
    rating: 4.7,
  },
  {
    id: "6",
    name: "SilentGrower",
    manufacturer: "UnknownBrand Ltd",
    image: "/unknown-fertilizer-grey.jpg",
    npk: { n: 18, p: 18, k: 18 },
    price: 650,
    status: "unknown",
    type: "compound",
    description: "Generic compound fertilizer",
    reviews: 45,
    rating: 2.8,
  },
  {
    id: "7",
    name: "VerdaGrow Deluxe",
    manufacturer: "AgroTech Industries",
    image: "/deluxe-fertilizer-gold.jpg",
    npk: { n: 22, p: 16, k: 14 },
    price: 1100,
    status: "verified",
    type: "compound",
    description: "Premium balanced fertilizer with micronutrients",
    reviews: 267,
    rating: 4.8,
  },
  {
    id: "8",
    name: "MicroNutrient Boost",
    manufacturer: "NutriScience Corp",
    image: "/micronutrient-fertilizer.jpg",
    npk: { n: 8, p: 8, k: 8 },
    price: 780,
    status: "verified",
    type: "micro-nutrient",
    description: "Micronutrient fortified blend",
    reviews: 134,
    rating: 4.5,
  },
  {
    id: "9",
    name: "FarmPremium Plus",
    manufacturer: "Agricultural Plus",
    image: "/farm-premium-fertilizer.jpg",
    npk: { n: 14, p: 14, k: 14 },
    price: 900,
    status: "suspected",
    type: "compound",
    description: "Standard farm fertilizer",
    reviews: 76,
    rating: 3.2,
  },
  {
    id: "10",
    name: "EcoBlend Organic",
    manufacturer: "Organic Farms Co",
    image: "/eco-organic-fertilizer.jpg",
    npk: { n: 12, p: 8, k: 12 },
    price: 1250,
    status: "verified",
    type: "organic",
    description: "Eco-friendly sustainable fertilizer",
    reviews: 198,
    rating: 4.7,
  },
  {
    id: "11",
    name: "QuickGrow Fast",
    manufacturer: "SpeedCrop Inc",
    image: "/quick-grow-fertilizer.jpg",
    npk: { n: 24, p: 10, k: 10 },
    price: 980,
    status: "suspected",
    type: "nitrogen",
    description: "High-nitrogen quick-release formula",
    reviews: 112,
    rating: 3.6,
  },
  {
    id: "12",
    name: "HarvestMax Pro",
    manufacturer: "AgroTech Industries",
    image: "/harvest-max-fertilizer.jpg",
    npk: { n: 15, p: 15, k: 20 },
    price: 1180,
    status: "verified",
    type: "compound",
    description: "Specially formulated for maximum yield",
    reviews: 287,
    rating: 4.9,
  },
]

export default function CatalogPage() {
  const [filters, setFilters] = useState({
    types: [] as string[],
    manufacturer: "",
    priceRange: [0, 1500],
    status: [] as string[],
  })
  const [sortBy, setSortBy] = useState<"price-low" | "price-high" | "rating" | "name">("rating")
  const [selectedProduct, setSelectedProduct] = useState<Fertilizer | null>(null)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())

  // Filter and sort logic
  const filteredFertilizers = useMemo(() => {
    const result = mockFertilizers.filter((f) => {
      const matchesType = filters.types.length === 0 || filters.types.includes(f.type)
      const matchesManufacturer =
        filters.manufacturer === "" || f.manufacturer.toLowerCase().includes(filters.manufacturer.toLowerCase())
      const matchesPrice = f.price >= filters.priceRange[0] && f.price <= filters.priceRange[1]
      const matchesStatus = filters.status.length === 0 || filters.status.includes(f.status)

      return matchesType && matchesManufacturer && matchesPrice && matchesStatus
    })

    // Sort
    if (sortBy === "price-low") result.sort((a, b) => a.price - b.price)
    if (sortBy === "price-high") result.sort((a, b) => b.price - a.price)
    if (sortBy === "rating") result.sort((a, b) => b.rating - a.rating)
    if (sortBy === "name") result.sort((a, b) => a.name.localeCompare(b.name))

    return result
  }, [filters, sortBy])

  const toggleFavorite = (id: string) => {
    const newFavorites = new Set(favorites)
    if (newFavorites.has(id)) {
      newFavorites.delete(id)
    } else {
      newFavorites.add(id)
    }
    setFavorites(newFavorites)
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      {/* Header */}
      <div className="sticky top-16 z-20 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Fertilizer Catalog</h1>
              <p className="text-muted-foreground">Browse verified and authentic fertilizers</p>
            </div>
            <div className="flex gap-3">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-2 rounded-lg bg-card border border-border text-foreground hover:border-primary transition-colors"
              >
                <option value="rating">Sort by Rating</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name">Sort by Name</option>
              </select>
              <div className="text-sm font-medium text-muted-foreground bg-card px-4 py-2 rounded-lg">
                {filteredFertilizers.length} products
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters */}
          <div className="lg:col-span-1">
            <CatalogFilters filters={filters} setFilters={setFilters} />
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" layout>
              {filteredFertilizers.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  layout
                >
                  <ProductCard
                    product={product}
                    isFavorite={favorites.has(product.id)}
                    onFavorite={() => toggleFavorite(product.id)}
                    onViewDetails={() => setSelectedProduct(product)}
                  />
                </motion.div>
              ))}
            </motion.div>

            {filteredFertilizers.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">No fertilizers match your filters</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          isFavorite={favorites.has(selectedProduct.id)}
          onFavorite={() => toggleFavorite(selectedProduct.id)}
        />
      )}
    </main>
  )
}
