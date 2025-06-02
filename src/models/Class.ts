import mongoose, { Document, Schema } from "mongoose";
import { IUser } from "./User";

export interface IClass extends Document {
  name: string;
  instructor: IUser["_id"];
  organization: string;
}

const classSchema = new Schema<IClass>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    instructor: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    organization: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Class =
  mongoose.models.Class || mongoose.model<IClass>("Class", classSchema);
