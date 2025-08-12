import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import StudentWhatsapp from "@/lib/modals/studentWhatsapp";
import { auth } from "@/auth";

// GET - Fetch all student WhatsApp groups
export async function GET() {
  try {
    const session = await auth();
    
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const groups = await StudentWhatsapp.find({}).sort({ createdAt: -1 });
    return NextResponse.json(groups);
  } catch (error) {
    console.error("Error fetching student WhatsApp groups:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST - Create new student WhatsApp group
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    await connectToDatabase();

    // Check if group name already exists for the same class and section
    const existingGroup = await StudentWhatsapp.findOne({ 
      groupName: data.groupName,
      class: data.class,
      section: data.section 
    });
    
    if (existingGroup) {
      return NextResponse.json({ error: "Group name already exists for this class and section" }, { status: 400 });
    }

    const group = new StudentWhatsapp(data);
    await group.save();

    return NextResponse.json(group, { status: 201 });
  } catch (error) {
    console.error("Error creating student WhatsApp group:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Force Node.js runtime to support Mongoose
export const runtime = 'nodejs';