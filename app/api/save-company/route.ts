import { NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { formData, products } = body

    // Create a unique folder name using registration number or company name
    const folderName = formData.registrationNumber
      ? formData.registrationNumber.replace(/[^a-zA-Z0-9-_]/g, "_")
      : formData.companyName.replace(/[^a-zA-Z0-9-_]/g, "_")

    // Path: backend/companies/<folderName>/
    const companyDir = path.join(process.cwd(), "backend", "companies", folderName)

    // Create the folder if it doesn't exist
    fs.mkdirSync(companyDir, { recursive: true })

    const now = new Date().toLocaleString()

    // Build the .txt file content
    let content = `
================================================================================
         FAKE FERTILIZER DETECTION SYSTEM - COMPANY REGISTRATION
================================================================================
Generated On: ${now}

--------------------------------------------------------------------------------
COMPANY INFORMATION
--------------------------------------------------------------------------------
Company Name        : ${formData.companyName}
Registration Number : ${formData.registrationNumber}
License Number      : ${formData.licenseNumber}
Established Year    : ${formData.establishedYear}
Owner / Director    : ${formData.ownerName}
GST Number          : ${formData.gstNumber}
Website             : ${formData.website}

--------------------------------------------------------------------------------
CONTACT DETAILS
--------------------------------------------------------------------------------
Email               : ${formData.contactEmail}
Phone               : ${formData.contactPhone}
Address             : ${formData.address}
City                : ${formData.city}
State               : ${formData.state}
Pincode             : ${formData.pincode}

--------------------------------------------------------------------------------
PRODUCTS (${products.length} Total)
--------------------------------------------------------------------------------
`

    products.forEach((p: any, i: number) => {
      content += `
Product #${i + 1}
  Product Name        : ${p.productName}
  Product Type        : ${p.productType}
  Composition         : ${p.composition}
  Registration ID     : ${p.registrationId}
  Batch Number        : ${p.batchNumber}
  Manufacturing Date  : ${p.manufacturingDate}
  Expiry Date         : ${p.expiryDate}
  Price Per KG        : ₹${p.pricePerKg}
  Packaging Sizes     : ${p.packagingSizes}
  Status              : ${p.status.toUpperCase()}
`
    })

    content += `
================================================================================
                          END OF RECORD
================================================================================
`

    // Save the .txt file inside the company folder
    const fileName = `${folderName}_registration.txt`
    const filePath = path.join(companyDir, fileName)
    fs.writeFileSync(filePath, content, "utf-8")

    // Also save a JSON file for future database integration
    const jsonPath = path.join(companyDir, `${folderName}_data.json`)
    fs.writeFileSync(jsonPath, JSON.stringify({ formData, products, createdAt: now }, null, 2), "utf-8")

    return NextResponse.json({
      success: true,
      message: `Company saved successfully in backend/companies/${folderName}/`,
      folder: folderName,
      files: [fileName, `${folderName}_data.json`],
    })

  } catch (error: any) {
    console.error("Error saving company:", error)
    return NextResponse.json(
      { success: false, message: error.message || "Failed to save company" },
      { status: 500 }
    )
  }
}
