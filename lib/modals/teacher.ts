import mongoose from 'mongoose';

const TeacherSchema = new mongoose.Schema({
  name: { type: String, required: true },
  mobileNo: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'teacher' },
  subjects: [{
    subjectName: String,
    classes: [String]
  }],
  address: { type: String, required: true }
}, {
  timestamps: true
});

export default mongoose.models.Teacher || mongoose.model('Teacher', TeacherSchema);
