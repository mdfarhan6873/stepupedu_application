import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { connectToDatabase } from '@/lib/db';
import Attendance from '@/lib/modals/attendance';
import Student from '@/lib/modals/student';
import Teacher from '@/lib/modals/teacher';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || session.user.role !== 'student') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    // Ensure models are registered
    const TeacherModel = Teacher;

    // Get student details
    const student = await Student.findById(session.user.id);
    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');
    const year = searchParams.get('year');

    // Build date filter
    let dateFilter: any = {};
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

    // Fetch attendance records for the student
    const attendanceRecords = await Attendance.find({
      class: student.class,
      section: student.section,
      ...dateFilter,
      'students.studentId': student._id
    })
    .sort({ date: -1 });

    // Manually populate markedBy field
    const populatedRecords = [];
    for (const record of attendanceRecords) {
      let markedByInfo = { name: 'Unknown' };
      if (record.markedBy) {
        try {
          const teacher = await Teacher.findById(record.markedBy);
          if (teacher) {
            markedByInfo = { name: teacher.name };
          }
        } catch (error) {
          console.log('Error fetching teacher:', error);
        }
      }
      populatedRecords.push({
        ...record.toObject(),
        markedBy: markedByInfo
      });
    }

    // Process attendance data
    const processedAttendance = populatedRecords.map(record => {
      const studentAttendance = record.students.find(
        (s: any) => s.studentId.toString() === student._id.toString()
      );

      return {
        _id: record._id,
        date: record.date,
        subject: record.subject,
        class: record.class,
        section: record.section,
        status: studentAttendance?.status || 'Absent',
        remarks: studentAttendance?.remarks || '',
        markedBy: record.markedBy
      };
    });

    // Group by date for calendar view
    const attendanceByDate: { [key: string]: any[] } = {};
    processedAttendance.forEach(record => {
      const dateKey = new Date(record.date).toISOString().split('T')[0];
      if (!attendanceByDate[dateKey]) {
        attendanceByDate[dateKey] = [];
      }
      attendanceByDate[dateKey].push(record);
    });

    // Calculate daily status (Present if present in at least one subject)
    const dailyStatus: { [key: string]: string } = {};
    Object.keys(attendanceByDate).forEach(date => {
      const dayRecords = attendanceByDate[date];
      const hasPresent = dayRecords.some(record => record.status === 'Present');
      dailyStatus[date] = hasPresent ? 'Present' : 'Absent';
    });

    return NextResponse.json({
      success: true,
      data: {
        attendanceRecords: processedAttendance,
        attendanceByDate,
        dailyStatus,
        student: {
          name: student.name,
          class: student.class,
          section: student.section,
          rollNo: student.rollNo
        }
      }
    });

  } catch (error) {
    console.error('Error fetching student attendance:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}