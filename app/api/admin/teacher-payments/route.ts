import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import TeacherPayment from "@/lib/modals/teacherPayment";
import Teacher from "@/lib/modals/teacher";
import { auth } from "@/auth";

// GET - Fetch teacher payments with filters
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
    const teacherId = searchParams.get('teacherId');

    // Build filter query
    const filter: any = {};
    
    if (month && month !== 'all') {
      filter.paymentMonth = parseInt(month);
    }
    
    if (year && year !== 'all') {
      filter.paymentYear = parseInt(year);
    }

    if (teacherId) {
      filter.teacherId = teacherId;
    }

    const payments = await TeacherPayment.find(filter)
      .populate('teacherId', 'name mobileNo subjects')
      .sort({ paymentDate: -1 });

    return NextResponse.json(payments);
  } catch (error) {
    console.error("Error fetching teacher payments:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST - Create new teacher payment
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    await connectToDatabase();

    // Verify teacher exists
    const teacher = await Teacher.findById(data.teacherId);
    if (!teacher) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
    }

    // Generate unique receipt number (format: TP-YYYYMMDD-HHMMSS-RND)
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, '');
    const randomStr = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const receiptNumber = `TP-${dateStr}-${timeStr}-${randomStr}`;

    // Create payment with teacher details
    const paymentData = {
      ...data,
      teacherName: teacher.name,
      mobileNo: teacher.mobileNo,
      receiptNumber,
      paymentMonth: new Date(data.paymentDate).getMonth() + 1,
      paymentYear: new Date(data.paymentDate).getFullYear(),
      createdBy: session.user.name
    };

    const payment = new TeacherPayment(paymentData);
    await payment.save();

    const populatedPayment = await TeacherPayment.findById(payment._id)
      .populate('teacherId', 'name mobileNo subjects');

    return NextResponse.json(populatedPayment, { status: 201 });
  } catch (error) {
    console.error("Error creating teacher payment:", error);
    if (error instanceof Error && error.message.includes('duplicate key')) {
      return NextResponse.json({ error: "Receipt number already exists" }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Force Node.js runtime to support Mongoose
export const runtime = 'nodejs';