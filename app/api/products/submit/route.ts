import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { Product } from "@/lib/models/Product"
import { Company } from "@/lib/models/Company"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      companyId, productName, productType, composition,
      batchNumber, manufacturingDate, expiryDate,
      netWeight, pricePerKg, targetCrops, storageConditions
    } = body

    if (!companyId || !productName || !composition || !batchNumber) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 })
    }

    await connectDB()

    // Get company name from DB
    const company = await Company.findOne({ companyId })
    if (!company) {
      return NextResponse.json({ success: false, message: "Company not found" }, { status: 404 })
    }

    const newProduct = await Product.create({
      companyId,
      companyName: company.companyName,
      productName,
      productType,
      composition,
      batchNumber,
      manufacturingDate,
      expiryDate,
      netWeight,
      pricePerKg,
      targetCrops,
      storageConditions,
      status: "PENDING",
      qrRequested: false,
      submittedAt: new Date(),
    })

    return NextResponse.json({
      success: true,
      message: "Product submitted successfully",
      product: newProduct,
      response: { status: "PENDING", companyId },
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}
