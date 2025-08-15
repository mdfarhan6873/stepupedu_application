import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Enquiry from '@/lib/modals/Enquiry';

// GET - Fetch all enquiries
export async function GET() {
  try {
    await connectToDatabase();
    const enquiries = await Enquiry.find({}).sort({ createdAt: -1 });
    
    return NextResponse.json({
      success: true,
      data: enquiries
    });
  } catch (error) {
    console.error('Error fetching enquiries:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch enquiries' },
      { status: 500 }
    );
  }
}

// POST - Create a new enquiry
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const body = await request.json();
    
    const { name, email, mobile, message } = body;
    
    // Validation
    if (!name || !email || !mobile || !message) {
      return NextResponse.json(
        { success: false, error: 'All fields are required' },
        { status: 400 }
      );
    }
    
    // Validate email format
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid email address' },
        { status: 400 }
      );
    }
    
    // Validate mobile format (10 digits)
    const mobileRegex = /^[0-9]{10}$/;
    if (!mobileRegex.test(mobile)) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid 10-digit mobile number' },
        { status: 400 }
      );
    }
    
    const enquiry = new Enquiry({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      mobile: mobile.trim(),
      message: message.trim()
    });
    
    await enquiry.save();
    
    return NextResponse.json({
      success: true,
      data: enquiry,
      message: 'Enquiry submitted successfully! We will contact you soon.'
    }, { status: 201 });
    
  } catch (error: any) {
    console.error('Error creating enquiry:', error);
    
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to submit enquiry' },
      { status: 500 }
    );
  }
}

// PUT - Update enquiry status
export async function PUT(request: NextRequest) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { id, status } = body;
    
    if (!id || !status) {
      return NextResponse.json(
        { success: false, error: 'ID and status are required' },
        { status: 400 }
      );
    }
    
    if (!['new', 'contacted', 'resolved'].includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status' },
        { status: 400 }
      );
    }
    
    const updatedEnquiry = await Enquiry.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
    
    if (!updatedEnquiry) {
      return NextResponse.json(
        { success: false, error: 'Enquiry not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: updatedEnquiry,
      message: 'Enquiry status updated successfully'
    });
    
  } catch (error) {
    console.error('Error updating enquiry:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update enquiry' },
      { status: 500 }
    );
  }
}

// DELETE - Delete an enquiry
export async function DELETE(request: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID is required' },
        { status: 400 }
      );
    }
    
    const deletedEnquiry = await Enquiry.findByIdAndDelete(id);
    
    if (!deletedEnquiry) {
      return NextResponse.json(
        { success: false, error: 'Enquiry not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Enquiry deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting enquiry:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete enquiry' },
      { status: 500 }
    );
  }
}