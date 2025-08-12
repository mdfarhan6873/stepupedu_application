import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import TeacherPayment from "@/lib/modals/teacherPayment";
import { auth } from "@/auth";

// GET - Get single teacher payment
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await connectToDatabase();
    
    const payment = await TeacherPayment.findById(id)
      .populate('teacherId', 'name mobileNo subjects');

    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    return NextResponse.json(payment);
  } catch (error) {
    console.error("Error fetching teacher payment:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT - Update teacher payment
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const data = await request.json();
    await connectToDatabase();

    // Update month and year if payment date changes
    if (data.paymentDate) {
      data.paymentMonth = new Date(data.paymentDate).getMonth() + 1;
      data.paymentYear = new Date(data.paymentDate).getFullYear();
    }

    const payment = await TeacherPayment.findByIdAndUpdate(
      id,
      data,
      { new: true, runValidators: true }
    ).populate('teacherId', 'name mobileNo subjects');

    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    return NextResponse.json(payment);
  } catch (error) {
    console.error("Error updating teacher payment:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE - Delete teacher payment
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await connectToDatabase();
    
    const payment = await TeacherPayment.findByIdAndDelete(id);

    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Payment deleted successfully" });
  } catch (error) {
    console.error("Error deleting teacher payment:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
