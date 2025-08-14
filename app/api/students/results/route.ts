import { NextResponse } from "next/server";
import mongoose from "mongoose";
import results from "@/lib/modals/results"; // adjust path to your model file

async function connectDB() {
    if (mongoose.connection.readyState >= 1) return;
    await mongoose.connect(process.env.MONGODB_URI as string);
}

export async function GET() {
    try {
        await connectDB();
        const allResults = await results.find({}).sort({ createdAt: -1 });
        return NextResponse.json(allResults);

    } catch (error) {
        console.error("Error fetching results:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
