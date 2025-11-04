import mongoose from 'mongoose';

const LearningPlanSchema = new mongoose.Schema({
  component: { type: String, required: true },
  details: { type: String, required: true },
}, { _id: false });

const FeedbackSchema = new mongoose.Schema({
  feedbackId: {
    type: String,
    required: true,
    unique: true,
  },

  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
  },

  studentName: {
    type: String,
    required: true,
    trim: true,
  },

  class: {
    type: String,
    required: true,
    trim: true,
  },

  section: {
    type: String,
    required: true,
    trim: true,
  },

  rollNumber: {
    type: String,
    required: true,
    trim: true,
  },

  issueDate: {
    type: Date,
    default: Date.now,
  },

  feedbackText: {
    type: String,
    required: true,
    trim: true,
  },

  personalizedLearningPlan: [LearningPlanSchema],

  sharedWithParent: {
    type: Boolean,
    default: false,
  },

  sharedAt: Date,

  // Additional metadata
  generatedBy: {
    type: String,
    required: true,
  },

  // Institution details
  schoolName: {
    type: String,
    default: 'StepUp Education Institute',
  },

  schoolLogo: {
    type: String,
    default: '/logo.png',
  },

  schoolAddress: {
    type: String,
    default: 'Amber, Shekhana Kalan, Sekhana Kala, BiharSharif, Bihar 803101',
  },

  schoolPhone: {
    type: String,
    default: '9262801624',
  },
}, {
  timestamps: true,
});

export default mongoose.models.Feedback || mongoose.model('Feedback', FeedbackSchema);
