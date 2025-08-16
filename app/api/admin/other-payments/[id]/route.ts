import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import OtherPayment from '@/lib/modals/otherpayments';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    
    const payment = await OtherPayment.findById(params.id)
      .populate('personId', 'name mobile whoHeIs');
    
    if (!payment) {
      return NextResponse.json(
        { success: false, error: 'Payment not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: payment
    });
    
  } catch (error) {
    console.error('Error fetching payment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch payment' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    const { amount, date, message, modeOfPayment } = body;
    
    const updatedPayment = await OtherPayment.findByIdAndUpdate(
      params.id,
      { amount, date, message, modeOfPayment },
      { new: true, runValidators: true }
    ).populate('personId', 'name mobile whoHeIs');
    
    if (!updatedPayment) {
      return NextResponse.json(
        { success: false, error: 'Payment not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: updatedPayment
    });
    
  } catch (error) {
    console.error('Error updating payment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update payment' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    
    const deletedPayment = await OtherPayment.findByIdAndDelete(params.id);
    if (!deletedPayment) {
      return NextResponse.json(
        { success: false, error: 'Payment not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Payment deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting payment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete payment' },
      { status: 500 }
    );
  }
}