import mongoose from 'mongoose';

const StudentPaymentSchema = new mongoose.Schema({
  studentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Student', 
    required: true 
  },
  studentName: { type: String, required: true },
  studentClass: { type: String, required: true },
  studentSection: { type: String, required: true },
  rollNo: { type: String, required: true },
  mobileNo: { type: String, required: true },
  
  // Payment Details
  amount: { type: Number, required: true },
  paymentType: { 
    type: String, 
    required: true,
    enum: ['Tuition Fee', 'Admission Fee', 'Exam Fee', 'Transport Fee', 'Other']
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['Cash', 'Card', 'UPI', 'Bank Transfer', 'Cheque']
  },
  transactionId: { type: String },
  receiptNumber: { type: String, required: true, unique: true },
  
  // Date Information
  paymentDate: { type: Date, required: true },
  paymentMonth: { type: Number, required: true }, // 1-12
  paymentYear: { type: Number, required: true },
  
  // Additional Info
  remarks: { type: String },
  status: { 
    type: String, 
    default: 'Completed',
    enum: ['Completed', 'Pending', 'Failed', 'Refunded']
  },
  
  // Created by admin
  createdBy: { type: String, required: true }
}, {
  timestamps: true
});

// Indexes for better query performance
StudentPaymentSchema.index({ studentId: 1, paymentMonth: 1, paymentYear: 1 });
StudentPaymentSchema.index({ studentClass: 1, studentSection: 1, paymentMonth: 1, paymentYear: 1 });
StudentPaymentSchema.index({ paymentDate: -1 });

export default mongoose.models.StudentPayment || mongoose.model('StudentPayment', StudentPaymentSchema);
