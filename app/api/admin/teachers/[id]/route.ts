import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Teacher from "@/lib/modals/teacher";
import bcrypt from "bcryptjs";
import { auth } from "@/auth";

// PUT - Update teacher
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const data = await request.json();
    await connectToDatabase();

    // Check if mobile number already exists (excluding current teacher)
    if (data.mobileNo) {
      const existingTeacher = await Teacher.findOne({ 
        mobileNo: data.mobileNo, 
        _id: { $ne: id } 
      });
      if (existingTeacher) {
        return NextResponse.json({ error: "Mobile number already exists" }, { status: 400 });
      }
    }

    // Hash password if provided
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 12);
    }

    const teacher = await Teacher.findByIdAndUpdate(
      id,
      data,
      { new: true, runValidators: true }
    );

    if (!teacher) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
    }

    // Return teacher without password
    const { password, ...teacherWithoutPassword } = teacher.toObject();
    return NextResponse.json(teacherWithoutPassword);
  } catch (error) {
    console.error("Error updating teacher:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE - Delete teacher
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await connectToDatabase();
    const teacher = await Teacher.findByIdAndDelete(id);

    if (!teacher) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Teacher deleted successfully" });
  } catch (error) {
    console.error("Error deleting teacher:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// GET - Get single teacher with unhashed password
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await connectToDatabase();
    const teacher = await Teacher.findById(id).select('+password');

    if (!teacher) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
    }

    return NextResponse.json(teacher);
  } catch (error) {
    console.error("Error fetching teacher:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
