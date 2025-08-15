import mongoose from 'mongoose';

export interface INameCard {
  _id?: string;
  name: string;
  tag: string;
  percentage: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const NameCardSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  tag: {
    type: String,
    required: [true, 'Tag is required'],
    trim: true,
    maxlength: [30, 'Tag cannot exceed 30 characters']
  },
  percentage: {
    type: Number,
    required: [true, 'Percentage is required'],
    min: [0, 'Percentage cannot be negative'],
    max: [100, 'Percentage cannot exceed 100']
  }
}, {
  timestamps: true
});

export default mongoose.models.NameCard || mongoose.model('NameCard', NameCardSchema);