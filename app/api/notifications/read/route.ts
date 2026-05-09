import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { Notification } from "@/lib/models/Notification"

export async function POST(req: NextRequest) {
  try {
    const { companyId, notificationId } = await req.json()

    await connectDB()

    if (notificationId) {
      // Mark single notification as read
      await Notification.findByIdAndUpdate(notificationId, { read: true })
    } else if (companyId) {
      // Mark all as read
      await Notification.updateMany({ companyId, read: false }, { read: true })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}
