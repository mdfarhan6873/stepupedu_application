import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Student from '@/lib/modals/student';
import { auth } from '@/auth';

export async function GET(_req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !['admin', 'teacher'].includes(session.user.role as string)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const classes = await Student.distinct('class');
    
    // Custom sorting function to handle class names properly
    const sortedClasses = classes.sort((a, b) => {
      // Extract numeric part and suffix (if any)
      const getClassOrder = (className: string) => {
        // Handle formats like "1st", "2nd", "3rd", "4th", etc.
        const match = className.match(/^(\d+)(st|nd|rd|th)?$/i);
        if (match) {
          return parseInt(match[1]);
        }
        
        // Handle formats like "Class 1", "Grade 1", etc.
        const numMatch = className.match(/(\d+)/);
        if (numMatch) {
          return parseInt(numMatch[1]);
        }
        
        // For non-numeric classes, sort alphabetically
        return 999; // Put non-numeric at the end
      };
      
      const orderA = getClassOrder(a);
      const orderB = getClassOrder(b);
      
      if (orderA !== orderB) {
        return orderA - orderB;
      }
      
      // If same numeric value, sort alphabetically
      return a.localeCompare(b);
    });
    
    return NextResponse.json({ classes: sortedClasses });
  } catch (e) {
    console.error('GET /api/classes error:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}