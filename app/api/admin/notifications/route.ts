import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Notification from "@/lib/modals/notification";
import { auth } from "@/auth";

// GET - Fetch all notifications
export async function GET() {
  try {
    const session = await auth();
    
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const notifications = await Notification.find({}).sort({ createdAt: -1 });
    return NextResponse.json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST - Create new notification
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    await connectToDatabase();

    const notification = new Notification(data);
    await notification.save();

    return NextResponse.json(notification, { status: 201 });
  } catch (error) {
    console.error("Error creating notification:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Force Node.js runtime to support Mongoose
export const runtime = 'nodejs';