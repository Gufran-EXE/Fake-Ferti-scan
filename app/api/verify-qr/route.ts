import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { Product } from "@/lib/models/Product"
import { Serial } from "@/lib/models/Serial"

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-api-key",
}

// Allow Flutter & mobile apps to call this API
export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: CORS_HEADERS })
}

// ── Haversine distance (km) between two GPS points ─────────────────────────
function getDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number) {
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
    // ── API key check ────────────────────────────────────────────────────────
    const apiKey = req.headers.get("x-api-key")
    const validKey = process.env.FLUTTER_APP_API_KEY
    if (apiKey && validKey && apiKey !== validKey) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401, headers: CORS_HEADERS }
      )
    }

    const body = await req.json()
    const { qrData, lat, lng } = body

    if (!qrData) {
      return NextResponse.json(
        { success: false, message: "qrData is required" },
        { status: 400, headers: CORS_HEADERS }
      )
    }

    // ── Parse QR payload ─────────────────────────────────────────────────────
    let parsed: any
    try {
      parsed = typeof qrData === "string" ? JSON.parse(qrData) : qrData
    } catch {
      return NextResponse.json(
        { success: false, genuine: false, message: "Invalid QR code format" },
        { status: 400, headers: CORS_HEADERS }
      )
    }

    const { productId, companyId, batchNumber, hash, serial } = parsed

    if (!productId || !companyId || !hash) {
      return NextResponse.json(
        { success: false, genuine: false, message: "Invalid QR — missing fields" },
        { status: 400, headers: CORS_HEADERS }
      )
    }

    await connectDB()

    // ── Find parent product ───────────────────────────────────────────────────
    const product = await Product.findOne({ productId })
    if (!product) {
      return NextResponse.json(
        { success: false, genuine: false, message: "Product not found — possibly fake" },
        { headers: CORS_HEADERS }
      )
    }

    // ── Company mismatch check ────────────────────────────────────────────────
    if (product.companyId !== companyId) {
      return NextResponse.json(
        { success: false, genuine: false, message: "Company mismatch — invalid QR" },
        { headers: CORS_HEADERS }
      )
    }

    // ── Expiry check ──────────────────────────────────────────────────────────
    // Parse expiryDate — stored as "MM/YYYY" or "YYYY-MM-DD" or "DD/MM/YYYY"
    let isExpired = false
    let expiryWarning = ""
    try {
      const raw = product.expiryDate ?? ""
      let expDate: Date | null = null

      if (/^\d{2}\/\d{4}$/.test(raw)) {
        // MM/YYYY — treat as last day of that month
        const [mm, yyyy] = raw.split("/")
        expDate = new Date(Number(yyyy), Number(mm), 0)          // day 0 = last day of prev month
      } else if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
        expDate = new Date(raw)
      } else if (/^\d{2}\/\d{2}\/\d{4}$/.test(raw)) {
        const [dd, mm, yyyy] = raw.split("/")
        expDate = new Date(Number(yyyy), Number(mm) - 1, Number(dd))
      }

      if (expDate && !isNaN(expDate.getTime()) && expDate < new Date()) {
        isExpired = true
        expiryWarning = `⚠️ EXPIRED: This product expired on ${product.expiryDate}. Do not use expired fertilizer.`
      }
    } catch {
      // Unparseable date — skip expiry check silently
    }

    // ══════════════════════════════════════════════════════════════════════════
    // PATH A — SERIALIZED QR (new system, has 'serial' field)
    // ══════════════════════════════════════════════════════════════════════════
    if (serial) {
      const serialDoc = await Serial.findOne({ serial })

      if (!serialDoc) {
        return NextResponse.json(
          { success: false, genuine: false, message: "Serial not found — QR is not registered" },
          { headers: CORS_HEADERS }
        )
      }

      // Hash check
      if (serialDoc.hash !== hash) {
        return NextResponse.json(
          {
            success: false,
            genuine: false,
            fraudAlert: true,
            message: "Hash mismatch — QR has been tampered with",
          },
          { headers: CORS_HEADERS }
        )
      }

      // ── Fraud detection ────────────────────────────────────────────────────
      let fraudAlert = false
      let fraudMessage = ""

      if (serialDoc.scanCount > 0) {
        // Already scanned before — check location if available
        const prevScan = serialDoc.scanHistory[0]

        if (
          lat != null && lng != null &&
          prevScan?.lat != null && prevScan?.lng != null
        ) {
          const distKm = getDistanceKm(prevScan.lat, prevScan.lng, lat, lng)
          const hoursSince =
            (Date.now() - new Date(prevScan.scannedAt).getTime()) / 3_600_000

          // Physically impossible: >50 km apart in <1 hour
          if (distKm > 50 && hoursSince < 1) {
            fraudAlert = true
            fraudMessage =
              `🚨 FRAUD ALERT: This exact bag was already scanned ${Math.round(distKm)} km away ` +
              `only ${Math.round(hoursSince * 60)} minutes ago. ` +
              `One physical bag cannot be in two places — this is likely a COUNTERFEIT copy.`
          } else if (distKm > 300) {
            // Same QR seen >300 km away regardless of time — very suspicious
            fraudAlert = true
            fraudMessage =
              `⚠️ SUSPICIOUS: This bag serial was previously scanned ${Math.round(distKm)} km from ` +
              `your current location. If you bought this locally, it may be counterfeit.`
          }
        }

        // Without location — warn after 2nd scan (scanCount already ≥ 1 means scanned before)
        if (!fraudAlert) {
          if (serialDoc.scanCount >= 2) {
            fraudAlert = true
            fraudMessage =
              `⚠️ WARNING: This bag's QR code has been scanned ${serialDoc.scanCount + 1} times total. ` +
              `Each physical bag should only need to be scanned once or twice. ` +
              `If you did not scan this before, the QR may have been copied onto a fake product.`
          }
        }
      }

      // ── Record this scan ───────────────────────────────────────────────────
      await Serial.findOneAndUpdate(
        { serial },
        {
          $inc: { scanCount: 1 },
          $push: {
            scanHistory: {
              $each: [{ scannedAt: new Date(), lat: lat ?? null, lng: lng ?? null }],
              $position: 0,   // newest first
              $slice: 10,     // keep only last 10 scan events
            },
          },
        }
      )

      const productDetails = {
        productId:         product.productId,
        productName:       product.productName,
        companyId:         product.companyId,
        companyName:       product.companyName,
        composition:       product.composition,
        batchNumber:       product.batchNumber,
        manufacturingDate: product.manufacturingDate,
        expiryDate:        product.expiryDate,
        status:            product.status,
        approvedAt:        product.approvedAt,
        serial,
        scanCount:         serialDoc.scanCount + 1,
        // Current scan location — sent back so Flutter can display it
        scanLat:           lat ?? null,
        scanLng:           lng ?? null,
      }

      if (fraudAlert) {
        return NextResponse.json(
          {
            success: true,
            genuine: true,
            fraudAlert: true,
            isExpired,
            message: fraudMessage,
            product: productDetails,
          },
          { headers: CORS_HEADERS }
        )
      }

      return NextResponse.json(
        {
          success: true,
          genuine: true,
          fraudAlert: false,
          isExpired,
          message: isExpired ? expiryWarning : "✅ Genuine Product Verified",
          product: productDetails,
        },
        { headers: CORS_HEADERS }
      )
    }

    // ══════════════════════════════════════════════════════════════════════════
    // PATH B — LEGACY SINGLE QR (old system, no 'serial' field)
    // Keeps full backward compatibility with QRs already printed
    // ══════════════════════════════════════════════════════════════════════════
    if (product.hash !== hash) {
      return NextResponse.json(
        {
          success: false,
          genuine: false,
          message: "Hash mismatch — QR has been tampered with",
        },
        { headers: CORS_HEADERS }
      )
    }

    return NextResponse.json(
      {
        success: true,
        genuine: true,
        fraudAlert: false,
        isExpired,
        message: isExpired ? expiryWarning : "✅ Genuine Product Verified",
        product: {
          productId:         product.productId,
          productName:       product.productName,
          companyId:         product.companyId,
          companyName:       product.companyName,
          composition:       product.composition,
          batchNumber:       product.batchNumber,
          manufacturingDate: product.manufacturingDate,
          expiryDate:        product.expiryDate,
          status:            product.status,
          approvedAt:        product.approvedAt,
        },
      },
      { headers: CORS_HEADERS }
    )
  } catch (error: any) {
    console.error("QR verification error:", error)
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500, headers: CORS_HEADERS }
    )
  }
}
