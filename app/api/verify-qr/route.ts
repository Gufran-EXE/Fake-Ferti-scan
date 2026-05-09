import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { Product } from "@/lib/models/Product"
import crypto from "crypto"

export async function POST(req: NextRequest) {
  try {
    const { qrData } = await req.json()

    if (!qrData) {
      return NextResponse.json({ success: false, message: "qrData is required" }, { status: 400 })
    }

    // Parse QR payload
    let parsed: any
    try {
      parsed = typeof qrData === "string" ? JSON.parse(qrData) : qrData
    } catch {
      return NextResponse.json({ success: false, genuine: false, message: "Invalid QR code format" }, { status: 400 })
    }

    const { productId, companyId, batchNumber, hash } = parsed

    if (!productId || !companyId || !hash) {
      return NextResponse.json({ success: false, genuine: false, message: "Invalid QR data - missing fields" }, { status: 400 })
    }

    await connectDB()

    // Find product by productId field (not MongoDB _id)
    const product = await Product.findOne({ productId })

    if (!product) {
      return NextResponse.json({
        success: false,
        genuine: false,
        message: "Product not found in database - possibly fake",
      })
    }

    // Verify the hash matches
    if (product.hash !== hash) {
      return NextResponse.json({
        success: false,
        genuine: false,
        message: "Hash mismatch - QR code has been tampered with",
        product: null,
      })
    }

    // Verify company matches
    if (product.companyId !== companyId) {
      return NextResponse.json({
        success: false,
        genuine: false,
        message: "Company mismatch - invalid QR code",
      })
    }

    // All checks passed - genuine product
    return NextResponse.json({
      success: true,
      genuine: true,
      message: "✅ Genuine Product Verified",
      product: {
        productId: product.productId,
        productName: product.productName,
        companyId: product.companyId,
        companyName: product.companyName,
        composition: product.composition,
        batchNumber: product.batchNumber,
        manufacturingDate: product.manufacturingDate,
        expiryDate: product.expiryDate,
        status: product.status,
        approvedAt: product.approvedAt,
      },
    })
  } catch (error: any) {
    console.error("QR verification error:", error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}
