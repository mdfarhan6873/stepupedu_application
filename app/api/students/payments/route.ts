import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import StudentPayment from "@/lib/modals/studentPayment";
import { auth } from "@/auth";

export async function GET() {
  try {
    const session = await auth();

    if (!session || session.user.role !== "student") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const studentId = session.user.id; // assuming your user ID matches studentId in payments

    await connectToDatabase();

    const payments = await StudentPayment.find({ studentId })
      .sort({ paymentDate: -1 })
      .lean();

    return NextResponse.json(payments);
  } catch (error) {
    console.error("Error fetching student payments:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
