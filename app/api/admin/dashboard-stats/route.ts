import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Student from "@/lib/modals/student";
import Teacher from "@/lib/modals/teacher";
import StudentPayment from "@/lib/modals/studentPayment";
import TeacherPayment from "@/lib/modals/teacherPayment";
import { auth } from "@/auth";

// GET - Fetch dashboard statistics
export async function GET() {
  try {
    const session = await auth();
    
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    // Get total counts
    const totalStudents = await Student.countDocuments();
    const totalTeachers = await Teacher.countDocuments();

    // Calculate total revenue (student payments)
    const studentPayments = await StudentPayment.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$amount" }
        }
      }
    ]);

    // Calculate total expenses (teacher payments)
    const teacherPayments = await TeacherPayment.aggregate([
      {
        $group: {
          _id: null,
          totalExpenses: { $sum: "$amount" }
        }
      }
    ]);

    const totalRevenue = studentPayments.length > 0 ? studentPayments[0].totalRevenue : 0;
    const totalExpenses = teacherPayments.length > 0 ? teacherPayments[0].totalExpenses : 0;
    const totalProfit = totalRevenue - totalExpenses;

    return NextResponse.json({
      totalStudents,
      totalTeachers,
      totalRevenue,
      totalProfit
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Force Node.js runtime to support Mongoose
export const runtime = 'nodejs';