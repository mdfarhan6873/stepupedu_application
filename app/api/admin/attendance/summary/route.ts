import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Attendance from '@/lib/modals/attendance';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');
    const year = searchParams.get('year');
    const classParam = searchParams.get('class');
    const section = searchParams.get('section');

    let query: any = {};

    if (month && year) {
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59, 999);
      
      query.date = {
        $gte: startDate,
        $lte: endDate
      };
    } else {
      // Default to current date only
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
      const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
      
      query.date = {
        $gte: startOfDay,
        $lte: endOfDay
      };
    }

    if (classParam) query.class = classParam;
    if (section) query.section = section;

    // Get unique combinations of subject, class, and section
    const attendanceRecords = await Attendance.find(query)
      .select('date subject class section')
      .sort({ date: 1 });

    // Group by subject, class, and section combination
    const groupedData = attendanceRecords.reduce((acc, record) => {
      const key = `${record.subject}-${record.class}-${record.section}`;
      
      if (!acc[key]) {
        acc[key] = {
          subject: record.subject,
          class: record.class,
          section: record.section,
          totalDays: 0,
          attendanceDates: []
        };
      }
      
      acc[key].totalDays++;
      acc[key].attendanceDates.push({
        date: record.date,
        subject: record.subject,
        class: record.class,
        section: record.section
      });
      
      return acc;
    }, {} as any);

    const summaryData = Object.values(groupedData);

    return NextResponse.json({
      success: true,
      data: summaryData
    });

  } catch (error) {
    console.error('Error fetching attendance summary:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch attendance summary' },
      { status: 500 }
    );
  }
}