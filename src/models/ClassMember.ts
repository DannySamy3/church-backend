import mongoose, { Document, Schema } from "mongoose";
import { IClass } from "./Class";

export interface IClassMember extends Document {
  firstName: string;
  secondName: string;
  lastName: string;
  classId: IClass["_id"];
}

const classMemberSchema = new Schema<IClassMember>(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    secondName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    classId: {
      type: Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const ClassMember =
  mongoose.models.ClassMember ||
  mongoose.model<IClassMember>("ClassMember", classMemberSchema);
