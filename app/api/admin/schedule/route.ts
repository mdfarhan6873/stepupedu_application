import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Schedule from "@/lib/modals/schedule";
import { auth } from "@/auth";

// GET - Fetch all schedules
export async function GET() {
  try {
    const session = await auth();

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const schedules = await Schedule.find({}).sort({ createdAt: -1 });
    return NextResponse.json(schedules);
  } catch (error) {
    console.error("Error fetching schedules:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST - Create new schedule
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    await connectToDatabase();

    // Check if schedule with same title already exists for the same class
    const existingSchedule = await Schedule.findOne({
      title: data.title,
      class: data.class,
      section: data.section || null
    });

    if (existingSchedule) {
      return NextResponse.json({ error: "Schedule with this title already exists for this class" }, { status: 400 });
    }

    const schedule = new Schedule(data);
    await schedule.save();

    return NextResponse.json(schedule, { status: 201 });
  } catch (error) {
    console.error("Error creating schedule:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Force Node.js runtime to support Mongoose
export const runtime = 'nodejs';