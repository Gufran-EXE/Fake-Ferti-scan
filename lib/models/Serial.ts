import mongoose, { Schema, model, models } from "mongoose"

// One document per individual bag/unit
// Created in bulk when admin generates serialized QR codes

const ScanEventSchema = new Schema(
  {
    scannedAt: { type: Date, default: Date.now },
    lat: { type: Number, default: null },   // GPS latitude  (null if denied)
    lng: { type: Number, default: null },   // GPS longitude (null if denied)
  },
  { _id: false }
)

const SerialSchema = new Schema({
  // e.g. "BAG-PROD4821-2026-001-00047"
  serial: { type: String, required: true, unique: true, index: true },

  // Parent product reference
  productId:   { type: String, required: true, index: true },
  companyId:   { type: String, required: true },
  batchNumber: { type: String, required: true },

  // SHA-256 of (companyId|productId|batchNumber|serial|timestamp)
  hash: { type: String, required: true },

  // Scan tracking
  scanCount: { type: Number, default: 0 },
  scanHistory: { type: [ScanEventSchema], default: [] },

  createdAt: { type: Date, default: Date.now },
})

export const Serial = models.Serial || model("Serial", SerialSchema)
