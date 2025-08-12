import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import TeacherWhatsapp from "@/lib/modals/teacherWhatsapp";
import { auth } from "@/auth";

// GET - Fetch all teacher WhatsApp groups
export async function GET() {
  try {
    const session = await auth();
    
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const groups = await TeacherWhatsapp.find({}).sort({ createdAt: -1 });
    return NextResponse.json(groups);
  } catch (error) {
    console.error("Error fetching teacher WhatsApp groups:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST - Create new teacher WhatsApp group
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    await connectToDatabase();

    // Check if group name already exists
    const existingGroup = await TeacherWhatsapp.findOne({ 
      groupName: data.groupName
    });
    
    if (existingGroup) {
      return NextResponse.json({ error: "Group name already exists" }, { status: 400 });
    }

    const group = new TeacherWhatsapp(data);
    await group.save();

    return NextResponse.json(group, { status: 201 });
  } catch (error) {
    console.error("Error creating teacher WhatsApp group:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Force Node.js runtime to support Mongoose
export const runtime = 'nodejs';