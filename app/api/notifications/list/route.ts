import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { Notification } from "@/lib/models/Notification"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const companyId = searchParams.get("companyId")

    if (!companyId) {
      return NextResponse.json({ success: false, message: "companyId is required" }, { status: 400 })
    }

    await connectDB()

    const notifications = await Notification.find({ companyId }).sort({ createdAt: -1 })
    const unreadCount = await Notification.countDocuments({ companyId, read: false })

    return NextResponse.json({ success: true, notifications, unreadCount })
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}
