import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { Product } from "@/lib/models/Product"
import crypto from "crypto"
import QRCode from "qrcode"

export async function POST(req: NextRequest) {
  try {
    const { productId } = await req.json()

    if (!productId) {
      return NextResponse.json({ success: false, message: "productId is required" }, { status: 400 })
    }

    await connectDB()

    // Fetch the product
    const product = await Product.findById(productId)
    if (!product) {
      return NextResponse.json({ success: false, message: "Product not found" }, { status: 404 })
    }

    if (product.status !== "APPROVED") {
      return NextResponse.json({ success: false, message: "Product must be approved before QR generation" }, { status: 400 })
    }

    // If QR already generated, return existing
    if (product.qrCode && product.productId) {
      return NextResponse.json({
        success: true,
        qrCode: product.qrCode,
        productId: product.productId,
        hash: product.hash,
        message: "QR already generated",
      })
    }

    // Generate unique ProductID
    const generatedProductId = "PROD" + Math.floor(1000 + Math.random() * 9000)

    // Generate timestamp
    const timestamp = Date.now().toString()

    // Create SHA256 hash from: CompanyID + ProductID + BatchNumber + Timestamp
    const dataToHash = `${product.companyId}|${generatedProductId}|${product.batchNumber}|${timestamp}`
    const hash = crypto.createHash("sha256").update(dataToHash).digest("hex")

    // Build QR payload
    const qrPayload = JSON.stringify({
      productId: generatedProductId,
      companyId: product.companyId,
      companyName: product.companyName,
      productName: product.productName,
      composition: product.composition,
      batchNumber: product.batchNumber,
      manufacturingDate: product.manufacturingDate,
      expiryDate: product.expiryDate,
      hash,
      approvedAt: product.approvedAt || new Date().toISOString(),
    })

    // Generate QR code as base64 PNG
    const qrCodeBase64 = await QRCode.toDataURL(qrPayload, {
      errorCorrectionLevel: "H",
      type: "image/png",
      width: 400,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    })

    // Save to MongoDB
    await Product.findByIdAndUpdate(productId, {
      productId: generatedProductId,
      hash,
      qrCode: qrCodeBase64,
      qrRequested: true,
    })

    return NextResponse.json({
      success: true,
      qrCode: qrCodeBase64,
      productId: generatedProductId,
      hash,
      message: "QR code generated successfully",
    })
  } catch (error: any) {
    console.error("QR generation error:", error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}
