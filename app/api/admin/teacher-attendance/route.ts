import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import TeacherAttendance from '@/lib/modals/teacherattendance';
import Teacher from '@/lib/modals/teacher';
import { auth } from '@/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const teacherId = searchParams.get('teacherId');
    const month = searchParams.get('month');
    const year = searchParams.get('year');
    const date = searchParams.get('date');

    let query: any = {};

    // Filter by teacher if specified
    if (teacherId) {
      query.teacherId = teacherId;
    }

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

    const attendanceRecords = await TeacherAttendance.find(query)
      .populate('teacherId', 'name mobileNo subjects')
      .sort({ date: -1 });

    // Group by teacher and calculate stats
    const teacherStats = {};
    attendanceRecords.forEach(record => {
      const teacherId = record.teacherId._id.toString();
      if (!teacherStats[teacherId]) {
        teacherStats[teacherId] = {
          teacher: record.teacherId,
          totalDays: 0,
          presentDays: 0,
          absentDays: 0,
          leaveDays: 0,
          totalSubjects: 0,
          presentSubjects: 0,
          records: []
        };
      }

      teacherStats[teacherId].records.push(record);
      teacherStats[teacherId].totalDays++;

      // If attendance record exists, teacher was present that day
      // Only exception is if ALL subjects are marked as 'Leave'
      const allSubjectsLeave = record.subjects.length > 0 && 
        record.subjects.every(s => s.status === 'Leave');
      
      if (allSubjectsLeave) {
        teacherStats[teacherId].leaveDays++;
      } else {
        // Teacher was present since they submitted attendance
        teacherStats[teacherId].presentDays++;
      }

      // Count subjects for subject-wise attendance tracking
      if (!record.isFullDay) {
        record.subjects.forEach(subject => {
          teacherStats[teacherId].totalSubjects++;
          if (subject.status === 'Present') {
            teacherStats[teacherId].presentSubjects++;
          }
        });
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        records: attendanceRecords,
        stats: Object.values(teacherStats)
      }
    });

  } catch (error) {
    console.error('Error fetching teacher attendance:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch teacher attendance records' },
      { status: 500 }
    );
  }
}

export const runtime = "nodejs";