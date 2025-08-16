import mongoose from "mongoose";

const AttendanceSchema = new mongoose.Schema(
  {
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher", required: true },

    // For day-wise attendance
    isFullDay: { type: Boolean, default: true }, // true = day-wise, false = subject-wise
    date: { type: Date, required: true },

    // Subject-wise details (optional for day-wise teachers)
    subjects: [
      {
        class: { type: String, required: false },
        section: { type: String, required: false },
        subjectName: { type: String, required: false },
        status: { type: String, enum: ["Present", "Absent", "Leave"], default: "Present" },
      },
    ],

    // Metadata for fraud prevention
    location: {
      latitude: { type: Number },
      longitude: { type: Number },
    },
    ipAddress: { type: String },
    deviceInfo: { type: String },

    // Extra optional fields
    remarks: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.TeacherAttendance ||
  mongoose.model("TeacherAttendance", AttendanceSchema);
