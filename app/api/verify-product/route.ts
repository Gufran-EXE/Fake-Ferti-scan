import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { Product } from "@/lib/models/Product"

export async function POST(req: NextRequest) {
  try {
    const { productId } = await req.json()

    if (!productId) {
      return NextResponse.json({ success: false, genuine: false, message: "Product ID is required" }, { status: 400 })
    }

    await connectDB()

    // Search by productId field OR registrationNumber
    const product = await Product.findOne({
      $or: [
        { productId: productId.toUpperCase() },
        { batchNumber: productId.toUpperCase() },
      ]
    })

    if (!product) {
      return NextResponse.json({
        success: false,
        genuine: false,
        message: "Product not found in database. This may be a fake or unregistered product.",
      })
    }

    if (product.status !== "APPROVED") {
      return NextResponse.json({
        success: false,
        genuine: false,
        message: `Product found but status is ${product.status}. Not yet approved by government.`,
      })
    }

    return NextResponse.json({
      success: true,
      genuine: true,
      message: "Genuine product verified",
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
    return NextResponse.json({ success: false, genuine: false, message: error.message }, { status: 500 })
  }
}
