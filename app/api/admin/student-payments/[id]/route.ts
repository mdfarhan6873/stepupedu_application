import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import StudentPayment from "@/lib/modals/studentPayment";
import { auth } from "@/auth";

// GET - Get single student payment
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
    
    const payment = await StudentPayment.findById(id)
      .populate('studentId', 'name class section rollNo mobileNo');

    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    return NextResponse.json(payment);
  } catch (error) {
    console.error("Error fetching student payment:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT - Update student payment
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

    const payment = await StudentPayment.findByIdAndUpdate(
      id,
      data,
      { new: true, runValidators: true }
    ).populate('studentId', 'name class section rollNo mobileNo');

    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    return NextResponse.json(payment);
  } catch (error) {
    console.error("Error updating student payment:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE - Delete student payment
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
    
    const payment = await StudentPayment.findByIdAndDelete(id);

    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Payment deleted successfully" });
  } catch (error) {
    console.error("Error deleting student payment:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
