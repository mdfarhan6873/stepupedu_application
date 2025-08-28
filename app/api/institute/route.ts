import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Institute details - in a real app, this would come from database
    const instituteDetails = {
      name: "StepUp Education Institute",
      upiId: "..........",
      qrCode: "upi://pay?pa=................&pn=StepUp%20Education%20Institute&mc=&tr........",
      address: "123 Education Street, Learning City, State - 123456",
      phone: "+91 9234666761",
      email: "info@stepupedu.com"
    };

    return NextResponse.json({ institute: instituteDetails });
  } catch (error) {
    console.error('GET /api/institute error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}