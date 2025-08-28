import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Student from '@/lib/modals/student';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const class_name = searchParams.get('class');
    const section = searchParams.get('section');
    
    let searchQuery: any = {};
    
    // Build search query
    if (query) {
      searchQuery.$or = [
        { name: { $regex: query, $options: 'i' } },
        { mobileNo: { $regex: query, $options: 'i' } },
        { rollNo: { $regex: query, $options: 'i' } }
      ];
    }
    
    if (class_name) {
      searchQuery.class = class_name;
    }
    
    if (section) {
      searchQuery.section = section;
    }
    
    const students = await Student.find(searchQuery)
      .select('name class section rollNo mobileNo parentName parentMobileNo')
      .sort({ name: 1 })
      .limit(50); // Limit results for performance
    
    return NextResponse.json({
      success: true,
      data: students,
      count: students.length
    });
    
  } catch (error: any) {
    console.error('Error searching students:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to search students',
        details: error.message 
      },
      { status: 500 }
    );
  }
}