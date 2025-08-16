import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Attendance from '@/lib/modals/attendance';
import Student from '@/lib/modals/student';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');
    const year = searchParams.get('year');
    const classParam = searchParams.get('class');
    const section = searchParams.get('section');
    const date = searchParams.get('date');
    const subject = searchParams.get('subject');

    let query: any = {};

    // If specific date is requested
    if (date) {
      const targetDate = new Date(date);
      targetDate.setHours(0, 0, 0, 0);
      const nextDay = new Date(targetDate);
      nextDay.setDate(nextDay.getDate() + 1);
      
      query.date = {
        $gte: targetDate,
        $lt: nextDay
      };
    } else if (month && year) {
      // Filter by month and year
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59, 999);
      
      query.date = {
        $gte: startDate,
        $lte: endDate
      };
    } else {
      // Default to current month
      const now = new Date();
      const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      
      query.date = {
        $gte: startDate,
        $lte: endDate
      };
    }

    if (classParam) query.class = classParam;
    if (section) query.section = section;
    if (subject) query.subject = subject;

    const attendanceRecords = await Attendance.find(query)
      .populate('students.studentId', 'name rollNo')
      .populate('markedBy', 'name')
      .sort({ date: -1, subject: 1 });

    return NextResponse.json({
      success: true,
      data: attendanceRecords
    });

  } catch (error) {
    console.error('Error fetching attendance:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch attendance records' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    const { class: classParam, section, subject, date, markedBy, students } = body;

    // Check if attendance already exists for this combination
    const existingAttendance = await Attendance.findOne({
      class: classParam,
      section,
      subject,
      date: new Date(date)
    });

    if (existingAttendance) {
      return NextResponse.json(
        { success: false, error: 'Attendance already marked for this date and subject' },
        { status: 400 }
      );
    }

    const newAttendance = new Attendance({
      class: classParam,
      section,
      subject,
      date: new Date(date),
      markedBy,
      students
    });

    await newAttendance.save();

    const populatedAttendance = await Attendance.findById(newAttendance._id)
      .populate('students.studentId', 'name rollNo')
      .populate('markedBy', 'name');

    return NextResponse.json({
      success: true,
      data: populatedAttendance
    });

  } catch (error) {
    console.error('Error creating attendance:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create attendance record' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    const { id, students } = body;

    const updatedAttendance = await Attendance.findByIdAndUpdate(
      id,
      { students },
      { new: true }
    )
      .populate('students.studentId', 'name rollNo')
      .populate('markedBy', 'name');

    if (!updatedAttendance) {
      return NextResponse.json(
        { success: false, error: 'Attendance record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedAttendance
    });

  } catch (error) {
    console.error('Error updating attendance:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update attendance record' },
      { status: 500 }
    );
  }
}
