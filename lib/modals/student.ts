import mongoose from 'mongoose';

const StudentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  class: { type: String, required: true },
  section: { type: String, required: true },
  rollNo: { type: String, required: true },
  mobileNo: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'student' },
  parentName: { type: String, required: true },
  parentMobileNo: { type: String, required: true },
  address: { type: String, required: true }
}, {
  timestamps: true
});

export default mongoose.models.Student || mongoose.model('Student', StudentSchema);
