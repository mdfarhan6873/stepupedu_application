import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { connectToDatabase } from '@/lib/db';
import Attendance from '@/lib/modals/attendance';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const subject = searchParams.get('subject');
    const month = searchParams.get('month');
    const year = searchParams.get('year');

    if (!studentId || !subject || !month || !year) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // Build date filter
    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    const endDate = new Date(parseInt(year), parseInt(month), 0);

    // Fetch attendance records for the specific student, subject, and date range
    const attendanceRecords = await Attendance.find({
      subject,
      date: {
        $gte: startDate,
        $lte: endDate
      },
      'students.studentId': studentId
    })
    .sort({ date: 1 });

    // Process attendance data
    const processedAttendance = attendanceRecords.map(record => {
      const studentAttendance = record.students.find(
        (s: any) => s.studentId.toString() === studentId
      );

      return {
        _id: record._id,
        date: record.date,
        subject: record.subject,
        status: studentAttendance?.status || 'Absent',
        remarks: studentAttendance?.remarks || ''
      };
    });

    return NextResponse.json({
      success: true,
      data: processedAttendance
    });

  } catch (error) {
    console.error('Error fetching student attendance:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
