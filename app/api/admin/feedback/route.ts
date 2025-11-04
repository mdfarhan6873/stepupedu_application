import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Feedback from '@/lib/modals/feedback';
import Student from '@/lib/modals/student';
import { auth } from '@/auth';

// GET - Fetch all feedbacks or filter by query
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({
        success: false,
        error: "Unauthorized"
      }, { status: 401 });
    }

    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const class_name = searchParams.get('class');
    const section = searchParams.get('section');
    const feedbackId = searchParams.get('feedbackId');

    let query: any = {};

    if (studentId) {
      query.studentId = studentId;
    }

    if (class_name) {
      query.class = class_name;
    }

    if (section) {
      query.section = section;
    }

    if (feedbackId) {
      query.feedbackId = feedbackId;
    }

    const feedbacks = await Feedback.find(query)
      .populate('studentId', 'name rollNo class section mobileNo parentName parentMobileNo')
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: feedbacks
    });

  } catch (error: any) {
    console.error('Error fetching feedbacks:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch feedbacks',
        details: error.message
      },
      { status: 500 }
    );
  }
}

// POST - Create new feedback
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({
        success: false,
        error: "Unauthorized"
      }, { status: 401 });
    }

    await connectToDatabase();

    const data = await request.json();
    const {
      studentId,
      feedbackText,
      personalizedLearningPlan,
      sharedWithParent,
      generatedBy
    } = data;

    // Validate required fields
    if (!studentId || !feedbackText) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get student details
    const student = await Student.findById(studentId);
    if (!student) {
      return NextResponse.json(
        { success: false, error: 'Student not found' },
        { status: 404 }
      );
    }

    // Generate unique feedback ID
    const feedbackId = `FB-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Create new feedback
    const newFeedback = new Feedback({
      feedbackId,
      studentId,
      studentName: student.name,
      class: student.class,
      section: student.section,
      rollNumber: student.rollNo,
      feedbackText,
      personalizedLearningPlan: personalizedLearningPlan || [],
      sharedWithParent: sharedWithParent || false,
      sharedAt: sharedWithParent ? new Date() : null,
      generatedBy: generatedBy || session.user.id // Use session user ID if not provided
    });

    const savedFeedback = await newFeedback.save();

    return NextResponse.json({
      success: true,
      data: savedFeedback,
      message: 'Feedback created successfully'
    });

  } catch (error: any) {
    console.error('Error creating feedback:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create feedback',
        details: error.message
      },
      { status: 500 }
    );
  }
}

// PUT - Update existing feedback
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({
        success: false,
        error: "Unauthorized"
      }, { status: 401 });
    }

    await connectToDatabase();

    const data = await request.json();
    const { id, ...updateData } = data;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Feedback ID is required' },
        { status: 400 }
      );
    }

    // If sharedWithParent is being set to true, update sharedAt
    if (updateData.sharedWithParent && !updateData.sharedAt) {
      updateData.sharedAt = new Date();
    }

    const updatedFeedback = await Feedback.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedFeedback) {
      return NextResponse.json(
        { success: false, error: 'Feedback not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedFeedback,
      message: 'Feedback updated successfully'
    });

  } catch (error: any) {
    console.error('Error updating feedback:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update feedback',
        details: error.message
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete feedback
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({
        success: false,
        error: "Unauthorized"
      }, { status: 401 });
    }

    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Feedback ID is required' },
        { status: 400 }
      );
    }

    const deletedFeedback = await Feedback.findByIdAndDelete(id);

    if (!deletedFeedback) {
      return NextResponse.json(
        { success: false, error: 'Feedback not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Feedback deleted successfully'
    });

  } catch (error: any) {
    console.error('Error deleting feedback:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete feedback',
        details: error.message
      },
      { status: 500 }
    );
  }
}

// Force Node.js runtime to support Mongoose
export const runtime = 'nodejs';
