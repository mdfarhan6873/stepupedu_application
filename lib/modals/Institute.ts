import mongoose, { Schema, Document } from "mongoose";

export interface IInstituteLocation extends Document {
  name: string;
  latitude: number;
  longitude: number;
  radius: number; // in meters
}

const InstituteLocationSchema = new Schema<IInstituteLocation>(
  {
    name: { type: String, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    radius: { type: Number, required: true, default: 100 }, // default 100m
  },
  { timestamps: true }
);

export default mongoose.models.InstituteLocation ||
  mongoose.model<IInstituteLocation>("InstituteLocation", InstituteLocationSchema);
