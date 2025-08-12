import mongoose from 'mongoose';

const TeacherPaymentSchema = new mongoose.Schema({
  teacherId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Teacher', 
    required: true 
  },
  teacherName: { type: String, required: true },
  mobileNo: { type: String, required: true },
  
  // Payment Details
  amount: { type: Number, required: true },
  paymentType: { 
    type: String, 
    required: true,
    enum: ['Monthly Salary', 'Bonus', 'Incentive', 'Transportation', 'Other']
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['Cash', 'Bank Transfer', 'Cheque', 'UPI']
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
TeacherPaymentSchema.index({ teacherId: 1, paymentMonth: 1, paymentYear: 1 });
TeacherPaymentSchema.index({ paymentDate: -1 });

export default mongoose.models.TeacherPayment || mongoose.model('TeacherPayment', TeacherPaymentSchema);
