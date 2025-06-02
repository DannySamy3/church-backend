import { Document } from "mongoose";

export interface IUserReport extends Document {
  reportedBy: string;
  reportedUser: string;
  reason: string;
  status: "pending" | "reviewed" | "resolved";
  createdAt: Date;
  updatedAt: Date;
}
