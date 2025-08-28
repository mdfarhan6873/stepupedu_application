import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Student from "@/lib/modals/student";
import bcrypt from "bcryptjs";
import { auth } from "@/auth";

// GET - Fetch all students
export async function GET() {
  try {
    const session = await auth();
    
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const students = await Student.find({}).sort({ createdAt: -1 });
    return NextResponse.json({
      success: true,
      data: students
    });
  } catch (error) {
    console.error("Error fetching students:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST - Create new student
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    await connectToDatabase();

    // Check if mobile number already exists
    const existingStudent = await Student.findOne({ mobileNo: data.mobileNo });
    if (existingStudent) {
      return NextResponse.json({ error: "Mobile number already exists" }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 12);

    const student = new Student({
      ...data,
      password: hashedPassword,
      role: "student"
    });

    await student.save();

    // Return student without password
    const { password, ...studentWithoutPassword } = student.toObject();
    return NextResponse.json(studentWithoutPassword, { status: 201 });
  } catch (error) {
    console.error("Error creating student:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Force Node.js runtime to support Mongoose
export const runtime = 'nodejs';
