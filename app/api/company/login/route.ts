import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { Company } from "@/lib/models/Company"

export async function POST(req: NextRequest) {
  try {
    const { companyId, password } = await req.json()

    if (!companyId || !password) {
      return NextResponse.json({ success: false, message: "Company ID and password are required" }, { status: 400 })
    }

    if (password !== "password123") {
      return NextResponse.json({ success: false, message: "Invalid password" }, { status: 401 })
    }

    await connectDB()

    const company = await Company.findOne({ companyId: companyId.toUpperCase() })

    if (!company) {
      return NextResponse.json({ success: false, message: "Company ID not found. Please check your ID." }, { status: 404 })
    }

    if (company.status !== "active") {
      return NextResponse.json({ success: false, message: "Your company account is not active. Contact support." }, { status: 403 })
    }

    return NextResponse.json({
      success: true,
      message: "Login successful",
      company: {
        companyId: company.companyId,
        companyName: company.companyName,
        registrationNumber: company.registrationNumber,
        licenseNumber: company.licenseNumber,
        ownerName: company.ownerName,
        contactEmail: company.contactEmail,
        contactPhone: company.contactPhone,
        address: company.address,
        city: company.city,
        state: company.state,
        pincode: company.pincode,
        gstNumber: company.gstNumber,
        website: company.website,
        establishedYear: company.establishedYear,
        status: company.status,
      },
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}
