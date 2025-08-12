import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/db";
import Admin from "@/lib/modals/admin";
import Student from "@/lib/modals/student";
import Teacher from "@/lib/modals/teacher";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { role, password, ...userData } = body;

    // Validate required fields
    if (!role || !password) {
      return NextResponse.json(
        { error: "Role and password are required" },
        { status: 400 }
      );
    }

    // Connect to database
    await connectToDatabase();

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    let newUser;
    const userDataWithPassword = {
      ...userData,
      password: hashedPassword,
      role,
    };

    // Create user based on role
    switch (role) {
      case "admin":
        // Check if admin already exists
        const existingAdmin = await Admin.findOne({ mobileNo: userData.mobileNo });
        if (existingAdmin) {
          return NextResponse.json(
            { error: "Admin with this mobile number already exists" },
            { status: 400 }
          );
        }
        newUser = await Admin.create(userDataWithPassword);
        break;

      case "student":
        // Check if student already exists
        const existingStudent = await Student.findOne({ mobileNo: userData.mobileNo });
        if (existingStudent) {
          return NextResponse.json(
            { error: "Student with this mobile number already exists" },
            { status: 400 }
          );
        }
        newUser = await Student.create(userDataWithPassword);
        break;

      case "teacher":
        // Check if teacher already exists
        const existingTeacher = await Teacher.findOne({ mobileNo: userData.mobileNo });
        if (existingTeacher) {
          return NextResponse.json(
            { error: "Teacher with this mobile number already exists" },
            { status: 400 }
          );
        }
        newUser = await Teacher.create(userDataWithPassword);
        break;

      default:
        return NextResponse.json(
          { error: "Invalid role" },
          { status: 400 }
        );
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = newUser.toObject();

    return NextResponse.json(
      {
        message: "User created successfully",
        user: userWithoutPassword,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create user" },
      { status: 500 }
    );
  }
}

// Force Node.js runtime to support Mongoose
export const runtime = 'nodejs';
