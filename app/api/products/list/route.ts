import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { Product } from "@/lib/models/Product"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const companyId = searchParams.get("companyId")

    if (!companyId) {
      return NextResponse.json({ success: false, message: "companyId is required" }, { status: 400 })
    }

    await connectDB()

    const products = await Product.find({ companyId }).sort({ submittedAt: -1 })

    return NextResponse.json({ success: true, products })
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}
