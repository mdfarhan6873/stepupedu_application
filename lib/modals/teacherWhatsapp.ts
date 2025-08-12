import mongoose from 'mongoose';

const TeacherWhatsappSchema = new mongoose.Schema({
  groupName: { type: String, required: true },
  groupLink: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  description: { type: String },
}, {
  timestamps: true
});

export default mongoose.models.TeacherWhatsapp || mongoose.model('TeacherWhatsapp', TeacherWhatsappSchema);
