import mongoose from 'mongoose';

const PeriodSchema = new mongoose.Schema({
  time: { type: String, required: true }, // e.g., "09:00-10:00"
  subject: { type: String, required: true },
  teacherName: { type: String, required: true },
  class: { type: String, required: true },
  section: { type: String },
});

const ScheduleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  class: { type: String, required: true },
  section: { type: String },
  schedule: {
    monday: [PeriodSchema],
    tuesday: [PeriodSchema],
    wednesday: [PeriodSchema],
    thursday: [PeriodSchema],
    friday: [PeriodSchema],
    saturday: [PeriodSchema],
    sunday: [PeriodSchema],
  },
  isActive: { type: Boolean, default: true },
  academicYear: { type: String },
}, {
  timestamps: true
});

export default mongoose.models.Schedule || mongoose.model('Schedule', ScheduleSchema);
