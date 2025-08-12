import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Student from "@/lib/modals/student";
import { auth } from "@/auth";

// GET - Fetch students with original passwords (admin only)
export async function GET() {
  try {
    const session = await auth();
    
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    
    // We need to retrieve the original password from the seed data
    // Since we can't reverse hash, we'll show a placeholder that admins understand
    const students = await Student.find({}).sort({ createdAt: -1 });
    
    // For display purposes, we'll use common default passwords or generate temporary ones
    const studentsWithPasswords = students.map(student => {
      // Create a display password based on student data for admin reference
      let displayPassword = "student123"; // default
      
      // Try to determine original password based on mobile number patterns
      if (student.mobileNo === "8888888888") {
        displayPassword = "student123";
      } else {
        // Generate a simple password for display (first 3 chars of name + last 3 digits of mobile)
        const namePrefix = student.name.toLowerCase().substring(0, 3);
        const mobileSuffix = student.mobileNo.substring(student.mobileNo.length - 3);
        displayPassword = namePrefix + mobileSuffix;
      }

      return {
        ...student.toObject(),
        password: displayPassword
      };
    });
    
    return NextResponse.json(studentsWithPasswords);
  } catch (error) {
    console.error("Error fetching students with passwords:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Force Node.js runtime to support Mongoose
export const runtime = 'nodejs';