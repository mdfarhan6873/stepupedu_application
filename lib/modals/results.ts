import mongoose from 'mongoose';

const ResultsSchema = new mongoose.Schema({
  title: { type: String, required: true }, // Test name or title
  class: { type: String, required: true },
  section: { type: String, required: true },
  subject: { type: String, required: true },
  examDate: { type: Date, required: true }, // When the exam/test was conducted
  resultDate: { type: Date, required: true }, // When results were published
  url: { type: String, required: true }, // Link to results
  isActive: { type: Boolean, default: true },
  createdBy: { type: String, default: 'admin' },
  description: { type: String }, // Optional description about the exam
}, {
  timestamps: true
});

export default mongoose.models.Results || mongoose.model('Results', ResultsSchema);
