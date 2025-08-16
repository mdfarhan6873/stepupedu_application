import mongoose, { Schema, Document } from 'mongoose';

export interface IPaymentPerson extends Document {
  name: string;
  mobile: string;
  whoHeIs: string;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentPersonSchema: Schema = new Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  mobile: {
    type: String,
    required: [true, 'Mobile number is required'],
    trim: true,
    match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit mobile number']
  },
  whoHeIs: {
    type: String,
    required: [true, 'Role/Description is required'],
    trim: true,
    maxlength: [200, 'Description cannot exceed 200 characters']
  }
}, {
  timestamps: true
});

// Create index for faster queries
PaymentPersonSchema.index({ name: 1 });
PaymentPersonSchema.index({ mobile: 1 });

export default mongoose.models.PaymentPerson || mongoose.model<IPaymentPerson>('PaymentPerson', PaymentPersonSchema);