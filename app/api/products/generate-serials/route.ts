import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { Product } from "@/lib/models/Product"
import { Serial } from "@/lib/models/Serial"
import crypto from "crypto"
import QRCode from "qrcode"
import JSZip from "jszip"

// ── Haversine distance between two GPS coords (km) ─────────────────────────
function getDistanceKm(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export async function POST(req: NextRequest) {
  try {
    const { productId, quantityOverride, forceRegenerate } = await req.json()

    if (!productId) {
      return NextResponse.json(
        { success: false, message: "productId is required" },
        { status: 400 }
      )
    }

    await connectDB()

    // ── Fetch approved product ──────────────────────────────────────────────
    const product = await Product.findById(productId)
    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      )
    }
    if (product.status !== "APPROVED") {
      return NextResponse.json(
        { success: false, message: "Product must be APPROVED before generating QR codes" },
        { status: 400 }
      )
    }

    // ── If serials already generated, re-build ZIP from existing serials ────
    if (product.serialsGenerated && !forceRegenerate) {
      const existingSerials = await Serial.find({ productId: product.productId }).lean()
      if (existingSerials.length > 0) {
        const zip = new JSZip()
        for (const s of existingSerials) {
          const qrPayload = JSON.stringify({
            productId: s.productId,
            companyId: s.companyId,
            batchNumber: s.batchNumber,
            serial: s.serial,
            hash: s.hash,
          })
          const qrBuffer: Buffer = await QRCode.toBuffer(qrPayload, {
            errorCorrectionLevel: "H",
            type: "png",
            width: 400,
            margin: 2,
          })
          zip.file(`${s.serial}.png`, qrBuffer)
        }
        const zipBuffer = await zip.generateAsync({ type: "nodebuffer" })
        return new NextResponse(zipBuffer as unknown as BodyInit, {
          status: 200,
          headers: {
            "Content-Type": "application/zip",
            "Content-Disposition": `attachment; filename="${product.productId}_${product.batchNumber}_QRCodes.zip"`,
            "Access-Control-Allow-Origin": "*",
          },
        })
      }
    }

    // ── If forceRegenerate, delete existing serials first ──────────────────
    if (forceRegenerate && product.productId) {
      await Serial.deleteMany({ productId: product.productId })
      await Product.findByIdAndUpdate(productId, { serialsGenerated: false })
      product.serialsGenerated = false
    }

    // ── Assign productId if not yet set ─────────────────────────────────────
    let generatedProductId = product.productId
    if (!generatedProductId) {
      generatedProductId = "PROD" + Math.floor(1000 + Math.random() * 9000)
      product.productId = generatedProductId
    }

    // quantityOverride wins, then product.quantity, then default 1
    const qty: number = quantityOverride ?? product.quantity ?? 1
    const timestamp = Date.now().toString()
    const zip = new JSZip()
    const serialDocs: any[] = []

    // ── Generate one QR per bag ──────────────────────────────────────────────
    for (let i = 1; i <= qty; i++) {
      const bagNumber = String(i).padStart(5, "0")
      const serial = `BAG-${generatedProductId}-${product.batchNumber}-${bagNumber}`

      // Unique hash per bag
      const dataToHash = `${product.companyId}|${generatedProductId}|${product.batchNumber}|${serial}|${timestamp}`
      const hash = crypto.createHash("sha256").update(dataToHash).digest("hex")

      // Minimal QR payload — 5 fields
      const qrPayload = JSON.stringify({
        productId: generatedProductId,
        companyId: product.companyId,
        batchNumber: product.batchNumber,
        serial,
        hash,
      })

      // Generate QR PNG as Buffer
      const qrBuffer: Buffer = await QRCode.toBuffer(qrPayload, {
        errorCorrectionLevel: "H",
        type: "png",
        width: 400,
        margin: 2,
      })

      // Add to ZIP
      zip.file(`${serial}.png`, qrBuffer)

      // Collect serial doc for bulk insert
      serialDocs.push({
        serial,
        productId: generatedProductId,
        companyId: product.companyId,
        batchNumber: product.batchNumber,
        hash,
        scanCount: 0,
        scanHistory: [],
      })
    }

    // ── Bulk insert all serials into MongoDB ─────────────────────────────────
    await Serial.insertMany(serialDocs, { ordered: false })

    // ── Mark product as serials-generated ───────────────────────────────────
    await Product.findByIdAndUpdate(productId, {
      productId: generatedProductId,
      serialsGenerated: true,
      qrRequested: true,
    })

    // ── Build ZIP and return as binary stream ────────────────────────────────
    const zipBuffer = await zip.generateAsync({ type: "nodebuffer" })

    return new NextResponse(zipBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${generatedProductId}_${product.batchNumber}_QRCodes.zip"`,
        "Access-Control-Allow-Origin": "*",
      },
    })
  } catch (error: any) {
    console.error("generate-serials error:", error)
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    )
  }
}
