import { Schema, model, models } from "mongoose"

const NotificationSchema = new Schema({
  companyId: { type: String, required: true },
  productId: { type: String },
  productName: { type: String },
  message: { type: String, required: true },
  sentBy: { type: String, default: "Government Portal" },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
})

export const Notification = models.Notification || model("Notification", NotificationSchema)
