import mongoose, { Document, Schema } from "mongoose";
import { IUser } from "./User";
import { ILesson } from "./Lesson";

export interface IPurchase extends Document {
  releaseStatus: "pending" | "released" | "cancelled";
  date: Date;
  issuedBy: IUser["_id"];
  lessonId: ILesson["_id"];
}

const purchaseSchema = new Schema<IPurchase>(
  {
    releaseStatus: {
      type: String,
      enum: ["pending", "released", "cancelled"],
      default: "pending",
      required: true,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    issuedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    lessonId: {
      type: Schema.Types.ObjectId,
      ref: "Lesson",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Purchase =
  mongoose.models.Purchase ||
  mongoose.model<IPurchase>("Purchase", purchaseSchema);
