import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import PaymentPerson from '@/lib/modals/paymentPerson';
import OtherPayment from '@/lib/modals/otherpayments';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    
    let query = {};
    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { mobile: { $regex: search, $options: 'i' } },
          { whoHeIs: { $regex: search, $options: 'i' } }
        ]
      };
    }
    
    const persons = await PaymentPerson.find(query).sort({ createdAt: -1 });
    
    // Get payment count for each person
    const personsWithPaymentCount = await Promise.all(
      persons.map(async (person) => {
        const paymentCount = await OtherPayment.countDocuments({ personId: person._id });
        const totalAmount = await OtherPayment.aggregate([
          { $match: { personId: person._id } },
          { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        
        return {
          ...person.toObject(),
          paymentCount,
          totalAmount: totalAmount[0]?.total || 0
        };
      })
    );
    
    return NextResponse.json({
      success: true,
      data: personsWithPaymentCount
    });
    
  } catch (error) {
    console.error('Error fetching payment persons:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch payment persons' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    const { name, mobile, whoHeIs } = body;
    
    // Validate required fields
    if (!name || !mobile || !whoHeIs) {
      return NextResponse.json(
        { success: false, error: 'Name, mobile, and role are required' },
        { status: 400 }
      );
    }
    
    // Check if mobile number already exists
    const existingPerson = await PaymentPerson.findOne({ mobile });
    if (existingPerson) {
      return NextResponse.json(
        { success: false, error: 'Person with this mobile number already exists' },
        { status: 400 }
      );
    }
    
    const newPerson = new PaymentPerson({
      name: name.trim(),
      mobile: mobile.trim(),
      whoHeIs: whoHeIs.trim()
    });
    
    await newPerson.save();
    
    return NextResponse.json({
      success: true,
      data: newPerson
    });
    
  } catch (error) {
    console.error('Error creating payment person:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create payment person' },
      { status: 500 }
    );
  }
}