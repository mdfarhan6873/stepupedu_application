import mongoose, { Schema, Document } from 'mongoose';

export interface IOtherPayment extends Document {
  personId: mongoose.Types.ObjectId;
  amount: number;
  date: Date;
  message: string;
  receiptNo: string;
  modeOfPayment: 'Cash' | 'Online' | 'Cheque' | 'Bank Transfer' | 'UPI' | 'Card';
  createdAt: Date;
  updatedAt: Date;
}

const OtherPaymentSchema: Schema = new Schema({
  personId: {
    type: Schema.Types.ObjectId,
    ref: 'PaymentPerson',
    required: [true, 'Person ID is required']
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  date: {
    type: Date,
    required: [true, 'Payment date is required'],
    default: Date.now
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true,
    maxlength: [500, 'Message cannot exceed 500 characters']
  },
  receiptNo: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  modeOfPayment: {
    type: String,
    required: [true, 'Mode of payment is required'],
    enum: ['Cash', 'Online', 'Cheque', 'Bank Transfer', 'UPI', 'Card']
  }
}, {
  timestamps: true
});

// Create indexes for better performance
OtherPaymentSchema.index({ personId: 1 });
OtherPaymentSchema.index({ date: -1 });
// receiptNo index is automatically created by unique: true constraint

// Generate receipt number before saving
OtherPaymentSchema.pre('save', async function(next) {
  if (!this.receiptNo) {
    try {
      // Use the model from this context to avoid circular reference
      const OtherPaymentModel = this.constructor as mongoose.Model<IOtherPayment>;
      const count = await OtherPaymentModel.countDocuments();
      this.receiptNo = `OP${String(count + 1).padStart(6, '0')}`;
      next();
    } catch (error) {
      next(error as Error);
    }
  } else {
    next();
  }
});

export default mongoose.models.OtherPayment || mongoose.model<IOtherPayment>('OtherPayment', OtherPaymentSchema);