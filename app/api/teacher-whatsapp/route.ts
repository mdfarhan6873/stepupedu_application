import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import TeacherWhatsapp from "@/lib/modals/teacherWhatsapp";
import { auth } from "@/auth";

export async function GET() {
  try {
    // Authenticate user
    const session = await auth();
    if (!session || session.user.role !== "teacher") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // DB connection
    await connectToDatabase();

    // Fetch groups, sorted by latest
    const groups = await TeacherWhatsapp.find({})
      .sort({ createdAt: -1 })
      .lean(); // lean() for performance (returns plain JS objects)

    if (!groups.length) {
      return NextResponse.json(
        { success: true, message: "No groups available", data: [] },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Groups fetched successfully", data: groups },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching teacher WhatsApp groups:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export const runtime = "nodejs";
