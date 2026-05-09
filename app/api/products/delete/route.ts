import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { Product } from "@/lib/models/Product"

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const productId = searchParams.get("productId")

    if (!productId) {
      return NextResponse.json({ success: false, message: "productId is required" }, { status: 400 })
    }

    await connectDB()
    await Product.findByIdAndDelete(productId)

    return NextResponse.json({ success: true, message: "Product deleted" })
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}
