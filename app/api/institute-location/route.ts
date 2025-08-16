import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Institute from "@/lib/modals/Institute";

// GET: Fetch all institute locations
export async function GET() {
  await connectToDatabase();

  try {
    const locations = await Institute.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: locations });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Error fetching locations" }, { status: 500 });
  }
}

// POST: Add new institute location
export async function POST(req: NextRequest) {
  await connectToDatabase();

  try {
    const body = await req.json();
    const { name, latitude, longitude, radius } = body;

    // Validate required fields
    if (!name || !latitude || !longitude || !radius) {
      return NextResponse.json({ success: false, message: "All fields are required" }, { status: 400 });
    }

    // Create new location
    const location = await Institute.create({ name, latitude, longitude, radius });

    return NextResponse.json({ success: true, data: location });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Error saving location" }, { status: 500 });
  }
}

// PUT: Update institute location
export async function PUT(req: NextRequest) {
  await connectToDatabase();

  try {
    const body = await req.json();
    const { id, name, latitude, longitude, radius } = body;

    // Validate required fields
    if (!id || !name || !latitude || !longitude || !radius) {
      return NextResponse.json({ success: false, message: "All fields are required" }, { status: 400 });
    }

    // Update location
    const location = await Institute.findByIdAndUpdate(
      id,
      { name, latitude, longitude, radius },
      { new: true }
    );

    if (!location) {
      return NextResponse.json({ success: false, message: "Location not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: location });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Error updating location" }, { status: 500 });
  }
}

// DELETE: Delete institute location
export async function DELETE(req: NextRequest) {
  await connectToDatabase();

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, message: "Location ID is required" }, { status: 400 });
    }

    const location = await Institute.findByIdAndDelete(id);

    if (!location) {
      return NextResponse.json({ success: false, message: "Location not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Location deleted successfully" });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Error deleting location" }, { status: 500 });
  }
}
