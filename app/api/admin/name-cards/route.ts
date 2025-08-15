import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import NameCard from '@/lib/modals/NameCard';

// GET - Fetch all name cards
export async function GET() {
  try {
    await connectToDatabase
    const nameCards = await NameCard.find({}).sort({ createdAt: -1 });
    
    return NextResponse.json({
      success: true,
      data: nameCards
    });
  } catch (error) {
    console.error('Error fetching name cards:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch name cards' },
      { status: 500 }
    );
  }
}

// POST - Create a new name card
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const body = await request.json();
    
    const { name, tag, percentage } = body;
    
    // Validation
    if (!name || !tag || percentage === undefined) {
      return NextResponse.json(
        { success: false, error: 'Name, tag, and percentage are required' },
        { status: 400 }
      );
    }
    
    if (percentage < 0 || percentage > 100) {
      return NextResponse.json(
        { success: false, error: 'Percentage must be between 0 and 100' },
        { status: 400 }
      );
    }
    
    const nameCard = new NameCard({
      name: name.trim(),
      tag: tag.trim(),
      percentage: Number(percentage)
    });
    
    await nameCard.save();
    
    return NextResponse.json({
      success: true,
      data: nameCard,
      message: 'Name card created successfully'
    }, { status: 201 });
    
  } catch (error: any) {
    console.error('Error creating name card:', error);
    
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to create name card' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a name card
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
    
    const deletedCard = await NameCard.findByIdAndDelete(id);
    
    if (!deletedCard) {
      return NextResponse.json(
        { success: false, error: 'Name card not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Name card deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting name card:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete name card' },
      { status: 500 }
    );
  }
}