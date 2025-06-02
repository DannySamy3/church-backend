import mongoose, { Document, Schema } from "mongoose";

export interface IAttendance extends Document {
  adultCount: number;
  minorCount: number;
  date: Date;
}

const attendanceSchema = new Schema<IAttendance>(
  {
    adultCount: {
      type: Number,
      required: true,
      min: 0,
    },
    minorCount: {
      type: Number,
      required: true,
      min: 0,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export const Attendance =
  mongoose.models.Attendance ||
  mongoose.model<IAttendance>("Attendance", attendanceSchema);
