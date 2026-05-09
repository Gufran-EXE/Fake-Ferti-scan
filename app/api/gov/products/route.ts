import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { Product } from "@/lib/models/Product"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get("status") // PENDING, APPROVED, REJECTED, or null for all

    await connectDB()

    const query = status ? { status } : {}
    const products = await Product.find(query).sort({ submittedAt: -1 })

    return NextResponse.json({ success: true, products })
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}
