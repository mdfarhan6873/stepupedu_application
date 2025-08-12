import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import StudentPayment from "@/lib/modals/studentPayment";
import Student from "@/lib/modals/student";
import { auth } from "@/auth";

// GET - Fetch student payments with filters
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');
    const year = searchParams.get('year');
    const studentClass = searchParams.get('class');
    const section = searchParams.get('section');
    const studentId = searchParams.get('studentId');

    // Build filter query
    const filter: any = {};
    
    if (month && month !== 'all') {
      filter.paymentMonth = parseInt(month);
    }
    
    if (year && year !== 'all') {
      filter.paymentYear = parseInt(year);
    }
    
    if (studentClass && studentClass !== 'all') {
      filter.studentClass = studentClass;
    }
    
    if (section && section !== 'all') {
      filter.studentSection = section;
    }

    if (studentId) {
      filter.studentId = studentId;
    }

    const payments = await StudentPayment.find(filter)
      .populate('studentId', 'name class section rollNo mobileNo')
      .sort({ paymentDate: -1 });

    return NextResponse.json(payments);
  } catch (error) {
    console.error("Error fetching student payments:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST - Create new student payment
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    await connectToDatabase();

    // Verify student exists
    const student = await Student.findById(data.studentId);
    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // Generate unique receipt number (format: SP-YYYYMMDD-HHMMSS-RND)
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, '');
    const randomStr = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const receiptNumber = `SP-${dateStr}-${timeStr}-${randomStr}`;

    // Create payment with student details
    const paymentData = {
      ...data,
      studentName: student.name,
      studentClass: student.class,
      studentSection: student.section,
      rollNo: student.rollNo,
      mobileNo: student.mobileNo,
      receiptNumber,
      paymentMonth: new Date(data.paymentDate).getMonth() + 1,
      paymentYear: new Date(data.paymentDate).getFullYear(),
      createdBy: session.user.name
    };

    const payment = new StudentPayment(paymentData);
    await payment.save();

    const populatedPayment = await StudentPayment.findById(payment._id)
      .populate('studentId', 'name class section rollNo mobileNo');

    return NextResponse.json(populatedPayment, { status: 201 });
  } catch (error) {
    console.error("Error creating student payment:", error);
    if (error instanceof Error && error.message.includes('duplicate key')) {
      return NextResponse.json({ error: "Receipt number already exists" }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Force Node.js runtime to support Mongoose
export const runtime = 'nodejs';