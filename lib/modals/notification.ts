import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  targetAudience: { 
    type: String, 
    required: true, 
    enum: ['teachers', 'students', 'all'] 
  },
  isActive: { type: Boolean, default: true },
  priority: { 
    type: String, 
    default: 'normal', 
    enum: ['low', 'normal', 'high', 'urgent'] 
  },
  expiryDate: { type: Date },
  readBy: [{
    userId: { type: String, required: true },
    userType: { type: String, required: true, enum: ['student', 'teacher'] },
    readAt: { type: Date, default: Date.now }
  }],
}, {
  timestamps: true
});

export default mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);
