import mongoose from 'mongoose';

const StudentWhatsappSchema = new mongoose.Schema({
  groupName: { type: String, required: true },
  class: { type: String, required: true },
  section: { type: String, required: true },
  groupLink: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  description: { type: String },
}, {
  timestamps: true
});

export default mongoose.models.StudentWhatsapp || mongoose.model('StudentWhatsapp', StudentWhatsappSchema);
