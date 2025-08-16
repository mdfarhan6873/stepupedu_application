import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import TeacherAttendance from "@/lib/modals/teacherattendance";
import Institute from "@/lib/modals/Institute";
import { auth } from "@/auth";

// Helper function to calculate distance between two coordinates
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // Distance in meters
}

// GET: Fetch teacher's attendance records
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "teacher") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const month = searchParams.get('month');
    const year = searchParams.get('year');

    let dateFilter = {};
    if (month && year) {
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      const endDate = new Date(parseInt(year), parseInt(month), 0);
      dateFilter = {
        date: {
          $gte: startDate,
          $lte: endDate
        }
      };
    }

    const attendanceRecords = await TeacherAttendance.find({
      teacherId: session.user.id,
      ...dateFilter
    }).sort({ date: -1 });

    return NextResponse.json({
      success: true,
      data: attendanceRecords
    });

  } catch (error) {
    console.error("Error fetching attendance:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST: Mark attendance
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "teacher") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const body = await req.json();
    const { 
      isFullDay, 
      subjects, 
      location, 
      remarks 
    } = body;

    // Validate required fields
    if (!location || !location.latitude || !location.longitude) {
      return NextResponse.json(
        { success: false, message: "Location is required" },
        { status: 400 }
      );
    }

    // Get all institute locations
    const instituteLocations = await Institute.find({});
    
    if (instituteLocations.length === 0) {
      return NextResponse.json(
        { success: false, message: "No institute locations configured" },
        { status: 400 }
      );
    }

    // Check if teacher is within any allowed location
    let isWithinRadius = false;
    let matchedLocation = null;

    for (const instituteLocation of instituteLocations) {
      const distance = calculateDistance(
        location.latitude,
        location.longitude,
        instituteLocation.latitude,
        instituteLocation.longitude
      );

      if (distance <= instituteLocation.radius) {
        isWithinRadius = true;
        matchedLocation = instituteLocation;
        break;
      }
    }

    if (!isWithinRadius) {
      return NextResponse.json(
        { success: false, message: "You are not within the allowed institute radius" },
        { status: 400 }
      );
    }

    // Check if attendance already marked for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const existingAttendance = await TeacherAttendance.findOne({
      teacherId: session.user.id,
      date: {
        $gte: today,
        $lt: tomorrow
      }
    });

    // For day-wise attendance, don't allow if already marked
    if (existingAttendance && isFullDay) {
      return NextResponse.json(
        { success: false, message: "Day-wise attendance already marked for today" },
        { status: 400 }
      );
    }

    // For subject-wise attendance, check if we can add more subjects
    if (existingAttendance && !isFullDay) {
      // Check if it's subject-wise attendance
      if (existingAttendance.isFullDay) {
        return NextResponse.json(
          { success: false, message: "Day-wise attendance already marked. Cannot add subject-wise attendance." },
          { status: 400 }
        );
      }

      // Check 25-minute rule for adding new subjects
      const lastSubjectTime = existingAttendance.updatedAt || existingAttendance.createdAt;
      const timeDiff = new Date().getTime() - new Date(lastSubjectTime).getTime();
      const minutesDiff = timeDiff / (1000 * 60);

      if (minutesDiff < 25) {
        const remainingMinutes = Math.ceil(25 - minutesDiff);
        return NextResponse.json(
          { success: false, message: `Please wait ${remainingMinutes} minutes before adding another subject` },
          { status: 400 }
        );
      }
    }

    // Validate subject-wise attendance
    if (!isFullDay) {
      if (!subjects || !Array.isArray(subjects) || subjects.length === 0) {
        return NextResponse.json(
          { success: false, message: "Subject is required for subject-wise attendance" },
          { status: 400 }
        );
      }

      // Only allow one subject at a time
      if (subjects.length > 1) {
        return NextResponse.json(
          { success: false, message: "Only one subject can be marked at a time" },
          { status: 400 }
        );
      }

      // Validate the subject
      const subject = subjects[0];
      if (!subject.class || !subject.section || !subject.subjectName || !subject.status) {
        return NextResponse.json(
          { success: false, message: "All subject fields are required" },
          { status: 400 }
        );
      }
    }

    // Get client info
    const userAgent = req.headers.get('user-agent') || '';
    const clientIP = req.headers.get('x-forwarded-for') || 
                    req.headers.get('x-real-ip') || 
                    'unknown';

    let attendance;

    if (existingAttendance && !isFullDay) {
      // Update existing subject-wise attendance
      existingAttendance.subjects.push(subjects[0]);
      existingAttendance.location = {
        latitude: location.latitude,
        longitude: location.longitude
      };
      if (remarks) {
        existingAttendance.remarks = existingAttendance.remarks 
          ? `${existingAttendance.remarks}\n${remarks}` 
          : remarks;
      }
      attendance = await existingAttendance.save();
    } else {
      // Create new attendance record
      const attendanceData = {
        teacherId: session.user.id,
        isFullDay,
        date: new Date(),
        location: {
          latitude: location.latitude,
          longitude: location.longitude
        },
        ipAddress: clientIP,
        deviceInfo: userAgent,
        remarks: remarks || '',
        ...((!isFullDay && subjects) && { subjects })
      };

      attendance = await TeacherAttendance.create(attendanceData);
    }

    return NextResponse.json({
      success: true,
      message: existingAttendance && !isFullDay ? "Subject added to today's attendance" : "Attendance marked successfully",
      data: attendance
    });

  } catch (error) {
    console.error("Error marking attendance:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export const runtime = "nodejs";