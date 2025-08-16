import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import TeacherAttendance from "@/lib/modals/teacherattendance";
import { auth } from "@/auth";

// GET: Check if attendance is already marked for today
export async function GET() {
  try {
    const session = await auth();
    if (!session || session.user.role !== "teacher") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectToDatabase();

    // Check if attendance already marked for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const existingAttendance = await TeacherAttendance.findOne({
      teacherId: session.user.id,
      date: {
        $gte: today,
        $lt: tomorrow
      }
    });

    let canAddSubject = false;
    let remainingMinutes = 0;

    if (existingAttendance && !existingAttendance.isFullDay) {
      // Check if we can add more subjects (25-minute rule)
      const lastSubjectTime = existingAttendance.updatedAt || existingAttendance.createdAt;
      const timeDiff = new Date().getTime() - new Date(lastSubjectTime).getTime();
      const minutesDiff = timeDiff / (1000 * 60);
      
      canAddSubject = minutesDiff >= 25;
      remainingMinutes = canAddSubject ? 0 : Math.ceil(25 - minutesDiff);
    }

    return NextResponse.json({
      success: true,
      alreadyMarked: !!existingAttendance,
      attendance: existingAttendance,
      canAddSubject,
      remainingMinutes
    });

  } catch (error) {
    console.error("Error checking attendance:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export const runtime = "nodejs";