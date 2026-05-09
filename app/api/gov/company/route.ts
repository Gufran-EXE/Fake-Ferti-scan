import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { Company } from "@/lib/models/Company"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const companyId = searchParams.get("companyId")

    if (!companyId) {
      return NextResponse.json({ success: false, message: "companyId is required" }, { status: 400 })
    }

    await connectDB()
    const company = await Company.findOne({ companyId })

    if (!company) {
      return NextResponse.json({ success: false, message: "Company not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, company })
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}
