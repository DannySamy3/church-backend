import mongoose, { Document, Schema } from "mongoose";

export interface ICommunionAttendance extends Document {
  user: mongoose.Schema.Types.ObjectId;
  organization: mongoose.Schema.Types.ObjectId;
  scannedBy: mongoose.Schema.Types.ObjectId;
  scannedAt: Date;
}

const communionAttendanceSchema = new Schema<ICommunionAttendance>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    scannedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    scannedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export const CommunionAttendance =
  mongoose.models.CommunionAttendance ||
  mongoose.model<ICommunionAttendance>(
    "CommunionAttendance",
    communionAttendanceSchema
  );
