import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import PaymentPerson from '@/lib/modals/paymentPerson';
import OtherPayment from '@/lib/modals/otherpayments';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    
    const person = await PaymentPerson.findById(params.id);
    if (!person) {
      return NextResponse.json(
        { success: false, error: 'Person not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: person
    });
    
  } catch (error) {
    console.error('Error fetching person:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch person' },
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
    const { name, mobile, whoHeIs } = body;
    
    const updatedPerson = await PaymentPerson.findByIdAndUpdate(
      params.id,
      { name, mobile, whoHeIs },
      { new: true, runValidators: true }
    );
    
    if (!updatedPerson) {
      return NextResponse.json(
        { success: false, error: 'Person not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: updatedPerson
    });
    
  } catch (error) {
    console.error('Error updating person:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update person' },
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
    
    // Check if person has any payments
    const paymentCount = await OtherPayment.countDocuments({ personId: params.id });
    if (paymentCount > 0) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete person with existing payments' },
        { status: 400 }
      );
    }
    
    const deletedPerson = await PaymentPerson.findByIdAndDelete(params.id);
    if (!deletedPerson) {
      return NextResponse.json(
        { success: false, error: 'Person not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Person deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting person:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete person' },
      { status: 500 }
    );
  }
}