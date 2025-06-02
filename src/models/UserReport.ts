import mongoose from "mongoose";
import { IUserReport } from "../types/userReport";

const userReportSchema = new mongoose.Schema(
  {
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reportedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reason: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "reviewed", "resolved"],
      default: "pending",
    },
  },
  { timestamps: true }
);

// Create indexes
userReportSchema.index({ reportedBy: 1 });
userReportSchema.index({ reportedUser: 1 });
userReportSchema.index({ status: 1 });
userReportSchema.index({ createdAt: 1 });

export const UserReport = mongoose.model<IUserReport>(
  "UserReport",
  userReportSchema
);
