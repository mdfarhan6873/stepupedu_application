import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import TeacherPayment from "@/lib/modals/teacherPayment";
import { auth } from "@/auth";

// GET - Fetch logged-in teacher's payments
export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    // Check if the user is logged in and is a teacher
    if (!session || session.user.role !== "teacher") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    // Fetch teacher payments
    const payments = await TeacherPayment.find({ teacherId: session.user.id })
      .populate("teacherId", "name mobileNo subjects")
      .sort({ paymentDate: -1 }); // latest first

    return NextResponse.json(payments);
  } catch (error) {
    console.error("Error fetching teacher payments:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
