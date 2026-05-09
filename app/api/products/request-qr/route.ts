import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { Product } from "@/lib/models/Product"

export async function POST(req: NextRequest) {
  try {
    const { productId } = await req.json()

    await connectDB()

    await Product.findByIdAndUpdate(productId, { qrRequested: true })

    return NextResponse.json({ success: true, message: "QR generation requested" })
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}
