import mongoose from 'mongoose';

const StudentAttendanceSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    status: { type: String, enum: ['Present', 'Absent'], required: true },
    remarks: { type: String },
  },
  { _id: false }
);

const AttendanceSchema = new mongoose.Schema(
  {
    class: { type: String, required: true },
    section: { type: String, required: true },
    subject: { type: String, required: true },
    date: { type: Date, required: true },
    markedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
    students: [StudentAttendanceSchema],
  },
  { timestamps: true }
);

AttendanceSchema.index({ class: 1, section: 1, subject: 1, date: 1 }, { unique: true });

export default (mongoose.models.Attendance as mongoose.Model<any>) ||
  mongoose.model('Attendance', AttendanceSchema);
