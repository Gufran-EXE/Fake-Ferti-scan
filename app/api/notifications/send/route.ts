import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { Notification } from "@/lib/models/Notification"

export async function POST(req: NextRequest) {
  try {
    const { companyId, productId, productName, message, sentBy } = await req.json()

    if (!companyId || !message) {
      return NextResponse.json({ success: false, message: "companyId and message are required" }, { status: 400 })
    }

    await connectDB()

    const notification = await Notification.create({
      companyId,
      productId,
      productName,
      message,
      sentBy: sentBy || "Government Portal",
      read: false,
    })

    return NextResponse.json({ success: true, notification })
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}
