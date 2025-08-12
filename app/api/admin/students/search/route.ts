import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Student from "@/lib/modals/student";
import { auth } from "@/auth";

// GET - Search students by mobile number, name, class, section, roll number
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.trim();
    
    if (!query) {
      return NextResponse.json([]);
    }

    // Create search filter - search in multiple fields
    const searchFilter = {
      $or: [
        { mobileNo: { $regex: query, $options: 'i' } },
        { name: { $regex: query, $options: 'i' } },
        { class: { $regex: query, $options: 'i' } },
        { section: { $regex: query, $options: 'i' } },
        { rollNo: { $regex: query, $options: 'i' } }
      ]
    };

    const students = await Student.find(searchFilter)
      .select('name class section rollNo mobileNo')
      .limit(10)
      .sort({ name: 1 });

    return NextResponse.json(students);
  } catch (error) {
    console.error("Error searching students:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Force Node.js runtime to support Mongoose
export const runtime = 'nodejs';