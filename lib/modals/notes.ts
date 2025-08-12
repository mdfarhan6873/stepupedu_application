import mongoose from 'mongoose';

const NotesSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  class: { type: String, required: true },
  section: { type: String },
  subject: { type: String, required: true },
  url: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  createdBy: { type: String, default: 'admin' },
}, {
  timestamps: true
});

export default mongoose.models.Notes || mongoose.model('Notes', NotesSchema);
