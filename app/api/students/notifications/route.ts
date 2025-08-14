import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Notification from "@/lib/modals/notification";
import { auth } from "@/auth";

// GET - Fetch notifications for logged-in teacher
export async function GET() {
  try {
    const session = await auth();

    // Allow only logged-in teachers
    if (!session || session.user.role !== "student") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    // Fetch only teacher-specific or all notifications
    const notifications = await Notification.find({
      targetAudience: { $in: ["students", "all"] },
      isActive: true
    })
      .sort({ createdAt: -1 }); // Latest first

    return NextResponse.json(notifications);
  } catch (error) {
    console.error("Error fetching teacher notifications:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Force Node.js runtime to support Mongoose
export const runtime = "nodejs";
