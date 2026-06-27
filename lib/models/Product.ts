import mongoose, { Schema, model, models } from "mongoose"

const ProductSchema = new Schema({
  productId: { type: String, unique: true, sparse: true },
  companyId: { type: String, required: true },
  companyName: { type: String },
  productName: { type: String, required: true },
  productType: { type: String },
  composition: { type: String, required: true },
  batchNumber: { type: String, required: true },
  manufacturingDate: { type: String, required: true },
  expiryDate: { type: String, required: true },
  netWeight: { type: String },
  pricePerKg: { type: String },
  targetCrops: { type: String },
  storageConditions: { type: String },
  status: {
    type: String,
    enum: ["PENDING", "APPROVED", "REJECTED"],
    default: "PENDING",
  },
  rejectionReason: { type: String },
  hash: { type: String },
  qrCode: { type: String },
  // Number of bags/units in this batch — used for serialized QR generation
  quantity: { type: Number, default: 1, min: 1, max: 10000 },
  // true once serialized QRs have been generated (replaces single qrCode flow)
  serialsGenerated: { type: Boolean, default: false },

  qrRequested: { type: Boolean, default: false },
  submittedAt: { type: Date, default: Date.now },
  approvedAt: { type: Date },
  approvedBy: { type: String },
})

export const Product = models.Product || model("Product", ProductSchema)
