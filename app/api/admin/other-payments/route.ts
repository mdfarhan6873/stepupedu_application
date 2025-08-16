import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import OtherPayment from '@/lib/modals/otherpayments';
import PaymentPerson from '@/lib/modals/paymentPerson';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const personId = searchParams.get('personId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;
    
    let query = {};
    if (personId) {
      query = { personId };
    }
    
    const payments = await OtherPayment.find(query)
      .populate('personId', 'name mobile whoHeIs')
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await OtherPayment.countDocuments(query);
    
    return NextResponse.json({
      success: true,
      data: payments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch payments' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    const { personId, amount, date, message, modeOfPayment } = body;
    
    // Validate required fields
    if (!personId || !amount || !date || !message || !modeOfPayment) {
      return NextResponse.json(
        { success: false, error: 'All fields are required' },
        { status: 400 }
      );
    }
    
    // Verify person exists
    const person = await PaymentPerson.findById(personId);
    if (!person) {
      return NextResponse.json(
        { success: false, error: 'Person not found' },
        { status: 404 }
      );
    }
    
    // Generate receipt number manually to avoid pre-save issues
    const count = await OtherPayment.countDocuments();
    const receiptNo = `OP${String(count + 1).padStart(6, '0')}`;
    
    const newPayment = new OtherPayment({
      personId,
      amount: parseFloat(amount),
      date: new Date(date),
      message: message.trim(),
      modeOfPayment,
      receiptNo // Explicitly set the receipt number
    });
    
    await newPayment.save();
    
    const populatedPayment = await OtherPayment.findById(newPayment._id)
      .populate('personId', 'name mobile whoHeIs');
    
    return NextResponse.json({
      success: true,
      data: populatedPayment
    });
    
  } catch (error) {
    console.error('Error creating payment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create payment' },
      { status: 500 }
    );
  }
}