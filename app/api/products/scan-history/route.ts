import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { Serial } from "@/lib/models/Serial"

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: CORS_HEADERS })
}

// ── Reverse geocode a single lat/lng via OpenStreetMap Nominatim ────────────
// Returns "City, State" or null if unavailable. Silently swallows errors.
async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`
    const res = await fetch(url, {
      headers: { "User-Agent": "KrushiScan/1.0 (fertilizer verification admin)" },
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) return null
    const data = await res.json()
    const addr = data?.address ?? {}
    const city  = addr.city ?? addr.town ?? addr.village ?? addr.county ?? ""
    const state = addr.state ?? ""
    if (city && state) return `${city}, ${state}`
    if (city)  return city
    if (state) return state
    return null
  } catch {
    return null
  }
}

// GET /api/products/scan-history?productId=PROD4821
export async function GET(req: NextRequest) {
  try {
    const productId = req.nextUrl.searchParams.get("productId")
    if (!productId) {
      return NextResponse.json(
        { success: false, message: "productId is required" },
        { status: 400, headers: CORS_HEADERS }
      )
    }

    await connectDB()

    // Fetch all serials for this product, sorted by most scanned first
    const serials = await Serial.find({ productId })
      .sort({ scanCount: -1, serial: 1 })
      .lean()

    // Summary stats
    const totalScans       = serials.reduce((sum, s) => sum + (s.scanCount ?? 0), 0)
    const scannedSerials   = serials.filter(s => (s.scanCount ?? 0) > 0).length
    const suspiciousSerials = serials.filter(s => (s.scanCount ?? 0) >= 2).length

    // Collect all unique lat/lng pairs that need geocoding
    // Deduplicate to avoid hammering Nominatim with identical coords
    const coordMap = new Map<string, string | null>()
    for (const s of serials) {
      for (const e of (s.scanHistory ?? []) as any[]) {
        if (e.lat != null && e.lng != null) {
          const key = `${e.lat.toFixed(3)},${e.lng.toFixed(3)}`  // ~100m precision
          if (!coordMap.has(key)) coordMap.set(key, null)         // placeholder
        }
      }
    }

    // Resolve all unique coords in parallel (capped at 10 to avoid rate-limiting)
    const keysToResolve = [...coordMap.keys()].slice(0, 10)
    await Promise.all(
      keysToResolve.map(async (key) => {
        const [lat, lng] = key.split(",").map(Number)
        const city = await reverseGeocode(lat, lng)
        coordMap.set(key, city)
      })
    )

    // Build response with resolved city names
    const serialList = serials.map((s) => ({
      serial:    s.serial,
      scanCount: s.scanCount ?? 0,
      suspicious: (s.scanCount ?? 0) >= 2,
      createdAt: s.createdAt,
      scanHistory: ((s.scanHistory ?? []) as any[]).map((e) => {
        const hasCoords = e.lat != null && e.lng != null
        const coordKey  = hasCoords
          ? `${(e.lat as number).toFixed(3)},${(e.lng as number).toFixed(3)}`
          : null
        const cityName  = coordKey ? (coordMap.get(coordKey) ?? null) : null

        return {
          scannedAt: e.scannedAt,
          lat:       e.lat ?? null,
          lng:       e.lng ?? null,
          cityName,                   // "Mumbai, Maharashtra" or null
          mapUrl: hasCoords
            ? `https://www.google.com/maps?q=${e.lat},${e.lng}`
            : null,
        }
      }),
    }))

    return NextResponse.json(
      {
        success: true,
        productId,
        summary: { totalSerials: serials.length, scannedSerials, suspiciousSerials, totalScans },
        serials: serialList,
      },
      { headers: CORS_HEADERS }
    )
  } catch (error: any) {
    console.error("scan-history error:", error)
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500, headers: CORS_HEADERS }
    )
  }
}
