import mongoose, { Document, Schema } from "mongoose";
import { IClassMember } from "./ClassMember";

export interface IClassAttendance extends Document {
  classMember: IClassMember["_id"];
  status: boolean;
  date: Date;
}

const classAttendanceSchema = new Schema<IClassAttendance>(
  {
    classMember: {
      type: Schema.Types.ObjectId,
      ref: "ClassMember",
      required: true,
    },
    status: {
      type: Boolean,
      required: true,
      default: false,
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

export const ClassAttendance =
  mongoose.models.ClassAttendance ||
  mongoose.model<IClassAttendance>("ClassAttendance", classAttendanceSchema);
