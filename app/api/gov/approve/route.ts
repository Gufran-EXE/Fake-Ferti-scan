import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { Product } from "@/lib/models/Product"

export async function POST(req: NextRequest) {
  try {
    const { productId } = await req.json()

    if (!productId) {
      return NextResponse.json({ success: false, message: "productId is required" }, { status: 400 })
    }

    await connectDB()

    const updated = await Product.findByIdAndUpdate(
      productId,
      {
        status: "APPROVED",
        approvedAt: new Date(),
        approvedBy: "GOV-ADMIN",
      },
      { new: true }
    )

    if (!updated) {
      return NextResponse.json({ success: false, message: "Product not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: "Product approved successfully", product: updated })
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}
