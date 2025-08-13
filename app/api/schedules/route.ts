import connectToDatabase from "@/lib/db";
import scheduleModel from "@/lib/modals/schedule";
import { NextResponse } from "next/server";

const DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

export async function GET() {
  try {
    await connectToDatabase();
    const schedules = await scheduleModel.find({}).sort({ createdAt: -1 }).lean();

    const transformed = schedules.map((s: any) => {
      const subjects = DAYS.flatMap((day) =>
        (s.schedule?.[day] || []).map((item: any) => {
          const [startTime, endTime] = item.time?.split("-") || ["", ""];
          return {
            day: day.charAt(0).toUpperCase() + day.slice(1),
            subject: item.subject || "",
            startTime,
            endTime,
            teacher: item.teacherName || "",
          };
        })
      );

      return {
        _id: s._id,
        title: s.title,
        class: s.class,
        section: s.section || "",
        startDate: s.startDate || null,
        endDate: s.endDate || null,
        subjects,
        isActive: s.isActive || false,
        academicYear: s.academicYear || "",
      };
    });

    return NextResponse.json(transformed);
  } catch (error) {
    console.error("Error fetching schedules:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
