import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Teacher from "@/lib/modals/teacher";
import bcrypt from "bcryptjs";
import { auth } from "@/auth";

// GET - Fetch all teachers
export async function GET() {
  try {
    const session = await auth();
    
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const teachers = await Teacher.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: teachers });
  } catch (error) {
    console.error("Error fetching teachers:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

// POST - Create new teacher
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    await connectToDatabase();

    // Check if mobile number already exists
    const existingTeacher = await Teacher.findOne({ mobileNo: data.mobileNo });
    if (existingTeacher) {
      return NextResponse.json({ error: "Mobile number already exists" }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 12);

    const teacher = new Teacher({
      ...data,
      password: hashedPassword,
      role: "teacher"
    });

    await teacher.save();

    // Return teacher without password
    const { password, ...teacherWithoutPassword } = teacher.toObject();
    return NextResponse.json(teacherWithoutPassword, { status: 201 });
  } catch (error) {
    console.error("Error creating teacher:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Force Node.js runtime to support Mongoose
export const runtime = 'nodejs';
