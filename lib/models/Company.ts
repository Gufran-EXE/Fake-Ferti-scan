import mongoose, { Schema, model, models } from "mongoose"

const CompanySchema = new Schema({
  companyId: { type: String, required: true, unique: true },
  companyName: { type: String, required: true },
  registrationNumber: { type: String, required: true, unique: true },
  licenseNumber: { type: String },
  establishedYear: { type: String },
  ownerName: { type: String, required: true },
  contactEmail: { type: String, required: true },
  contactPhone: { type: String },
  address: { type: String },
  city: { type: String },
  state: { type: String },
  pincode: { type: String },
  gstNumber: { type: String },
  website: { type: String },
  status: { type: String, enum: ["active", "suspended", "pending"], default: "active" },
  createdAt: { type: Date, default: Date.now },
})

export const Company = models.Company || model("Company", CompanySchema)
