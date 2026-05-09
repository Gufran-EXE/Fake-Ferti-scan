"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Download, Plus, Trash2, CheckCircle, AlertCircle } from "lucide-react"

interface AddCompanyModalProps {
  isOpen: boolean
  onClose: () => void
}

const emptyProduct = {
  productName: "", productType: "", composition: "",
  batchNumber: "", manufacturingDate: "", expiryDate: "",
  pricePerKg: "", packagingSizes: "", registrationId: "", status: "verified",
}

export default function AddCompanyModal({ isOpen, onClose }: AddCompanyModalProps) {
  const [formData, setFormData] = useState({
    companyName: "", registrationNumber: "", licenseNumber: "",
    establishedYear: "", ownerName: "", contactEmail: "",
    contactPhone: "", address: "", state: "", city: "",
    pincode: "", gstNumber: "", website: "",
  })
  const [products, setProducts] = useState([{ ...emptyProduct }])
  const [saving, setSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle")
  const [savedFolder, setSavedFolder] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleProductChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const updated = [...products]
    updated[index] = { ...updated[index], [e.target.name]: e.target.value }
    setProducts(updated)
  }

  const addProduct = () => setProducts([...products, { ...emptyProduct }])

  const removeProduct = (index: number) => {
    if (products.length > 1) setProducts(products.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setSaveStatus("idle")

    try {
      const res = await fetch("/api/save-company", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formData, products }),
      })

      const data = await res.json()

      if (data.success) {
        setSaveStatus("success")
        setSavedFolder(data.folder)

        // Also trigger browser download as backup
        generateTxtDownload()

        setTimeout(() => {
          setSaveStatus("idle")
          onClose()
        }, 2500)
      } else {
        setSaveStatus("error")
      }
    } catch (err) {
      console.error(err)
      setSaveStatus("error")
    } finally {
      setSaving(false)
    }
  }

  const generateTxtDownload = () => {
    const now = new Date().toLocaleString()
    let content = `
================================================================================
         FAKE FERTILIZER DETECTION SYSTEM - COMPANY REGISTRATION
================================================================================
Generated On: ${now}

--------------------------------------------------------------------------------
COMPANY INFORMATION
--------------------------------------------------------------------------------
Company Name        : ${formData.companyName}
Registration Number : ${formData.registrationNumber}
License Number      : ${formData.licenseNumber}
Established Year    : ${formData.establishedYear}
Owner / Director    : ${formData.ownerName}
GST Number          : ${formData.gstNumber}
Website             : ${formData.website}

--------------------------------------------------------------------------------
CONTACT DETAILS
--------------------------------------------------------------------------------
Email               : ${formData.contactEmail}
Phone               : ${formData.contactPhone}
Address             : ${formData.address}
City                : ${formData.city}
State               : ${formData.state}
Pincode             : ${formData.pincode}

--------------------------------------------------------------------------------
PRODUCTS (${products.length} Total)
--------------------------------------------------------------------------------
`
    products.forEach((p, i) => {
      content += `
Product #${i + 1}
  Product Name        : ${p.productName}
  Product Type        : ${p.productType}
  Composition         : ${p.composition}
  Registration ID     : ${p.registrationId}
  Batch Number        : ${p.batchNumber}
  Manufacturing Date  : ${p.manufacturingDate}
  Expiry Date         : ${p.expiryDate}
  Price Per KG        : ₹${p.pricePerKg}
  Packaging Sizes     : ${p.packagingSizes}
  Status              : ${p.status.toUpperCase()}
`
    })
    content += `\n================================================================================\n                          END OF RECORD\n================================================================================\n`

    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${formData.companyName.replace(/\s+/g, "_") || "company"}_registration.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto py-8 px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-4xl bg-slate-900 border border-emerald-500/20 rounded-2xl shadow-2xl z-10"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-emerald-500/20">
              <div>
                <h2 className="text-2xl font-bold text-white">Add New Company</h2>
                <p className="text-sm text-slate-400 mt-1">Data will be saved to backend/companies/ folder</p>
              </div>
              <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Success / Error Banner */}
            {saveStatus === "success" && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                className="mx-6 mt-4 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <p className="text-emerald-400 font-semibold">Saved successfully!</p>
                  <p className="text-emerald-300/70 text-sm">Saved to: backend/companies/{savedFolder}/</p>
                </div>
              </motion.div>
            )}

            {saveStatus === "error" && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                className="mx-6 mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                <p className="text-red-400 text-sm">Failed to save. File downloaded to your browser instead.</p>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="p-6 space-y-8">
              {/* Company Info */}
              <div>
                <h3 className="text-lg font-semibold text-emerald-400 mb-4 pb-2 border-b border-emerald-500/20">🏢 Company Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { label: "Company Name", name: "companyName", required: true },
                    { label: "Registration Number", name: "registrationNumber", required: true },
                    { label: "License Number", name: "licenseNumber" },
                    { label: "Established Year", name: "establishedYear", type: "number" },
                    { label: "Owner / Director Name", name: "ownerName", required: true },
                    { label: "GST Number", name: "gstNumber" },
                    { label: "Website", name: "website" },
                  ].map((field) => (
                    <div key={field.name}>
                      <label className="block text-sm font-medium text-slate-300 mb-1">
                        {field.label} {field.required && <span className="text-red-400">*</span>}
                      </label>
                      <input
                        type={field.type || "text"}
                        name={field.name}
                        value={formData[field.name as keyof typeof formData]}
                        onChange={handleChange}
                        required={field.required}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors text-sm"
                        placeholder={`Enter ${field.label.toLowerCase()}`}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Contact Details */}
              <div>
                <h3 className="text-lg font-semibold text-emerald-400 mb-4 pb-2 border-b border-emerald-500/20">📞 Contact Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { label: "Contact Email", name: "contactEmail", type: "email", required: true },
                    { label: "Contact Phone", name: "contactPhone", required: true },
                    { label: "City", name: "city" },
                    { label: "State", name: "state" },
                    { label: "Pincode", name: "pincode" },
                  ].map((field) => (
                    <div key={field.name}>
                      <label className="block text-sm font-medium text-slate-300 mb-1">
                        {field.label} {field.required && <span className="text-red-400">*</span>}
                      </label>
                      <input
                        type={field.type || "text"}
                        name={field.name}
                        value={formData[field.name as keyof typeof formData]}
                        onChange={handleChange}
                        required={field.required}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors text-sm"
                        placeholder={`Enter ${field.label.toLowerCase()}`}
                      />
                    </div>
                  ))}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-300 mb-1">Full Address</label>
                    <input type="text" name="address" value={formData.address} onChange={handleChange}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors text-sm"
                      placeholder="Enter full address" />
                  </div>
                </div>
              </div>

              {/* Products */}
              <div>
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-emerald-500/20">
                  <h3 className="text-lg font-semibold text-emerald-400">🌿 Products</h3>
                  <motion.button type="button" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={addProduct}
                    className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-sm hover:bg-emerald-500/30 transition-colors">
                    <Plus className="w-4 h-4" /> Add Product
                  </motion.button>
                </div>

                <div className="space-y-6">
                  {products.map((product, index) => (
                    <div key={index} className="p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-semibold text-white">Product #{index + 1}</span>
                        {products.length > 1 && (
                          <button type="button" onClick={() => removeProduct(index)}
                            className="p-1 text-red-400 hover:bg-red-500/10 rounded transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                          { label: "Product Name", name: "productName", required: true },
                          { label: "Product Type (e.g. NPK, Organic)", name: "productType" },
                          { label: "Composition (e.g. NPK 10:10:10)", name: "composition" },
                          { label: "Registration ID", name: "registrationId", required: true },
                          { label: "Batch Number", name: "batchNumber" },
                          { label: "Price Per KG (₹)", name: "pricePerKg", type: "number" },
                          { label: "Packaging Sizes (e.g. 1kg, 5kg, 50kg)", name: "packagingSizes" },
                        ].map((field) => (
                          <div key={field.name}>
                            <label className="block text-xs font-medium text-slate-400 mb-1">
                              {field.label} {field.required && <span className="text-red-400">*</span>}
                            </label>
                            <input
                              type={field.type || "text"}
                              name={field.name}
                              value={product[field.name as keyof typeof product]}
                              onChange={(e) => handleProductChange(index, e)}
                              required={field.required}
                              className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors text-sm"
                              placeholder={`Enter ${field.label.toLowerCase()}`}
                            />
                          </div>
                        ))}
                        <div>
                          <label className="block text-xs font-medium text-slate-400 mb-1">Manufacturing Date</label>
                          <input type="date" name="manufacturingDate" value={product.manufacturingDate}
                            onChange={(e) => handleProductChange(index, e)}
                            className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-500 transition-colors text-sm" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-400 mb-1">Expiry Date</label>
                          <input type="date" name="expiryDate" value={product.expiryDate}
                            onChange={(e) => handleProductChange(index, e)}
                            className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-500 transition-colors text-sm" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-400 mb-1">Status</label>
                          <select name="status" value={product.status} onChange={(e) => handleProductChange(index, e)}
                            className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-500 transition-colors text-sm">
                            <option value="verified">Verified</option>
                            <option value="pending">Pending</option>
                            <option value="rejected">Rejected</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit */}
              <div className="flex gap-4 pt-4 border-t border-slate-700">
                <motion.button
                  type="submit"
                  disabled={saving}
                  whileHover={{ scale: saving ? 1 : 1.02 }}
                  whileTap={{ scale: saving ? 1 : 0.98 }}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-emerald-500 to-lime-500 text-white font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-70"
                >
                  {saving ? (
                    <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</>
                  ) : (
                    <><Download className="w-5 h-5" /> Save to Backend & Download</>
                  )}
                </motion.button>
                <motion.button type="button" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={onClose}
                  className="px-6 py-3 border border-slate-600 text-slate-300 font-semibold rounded-lg hover:bg-slate-800 transition-all">
                  Cancel
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
