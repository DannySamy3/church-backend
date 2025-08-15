import mongoose, { Document, Schema } from "mongoose";
import { IClass } from "./Class";
import { IUser } from "./User";

export interface IClassMember extends Document {
  userId: IUser["_id"];
  classId: IClass["_id"];
}

const classMemberSchema = new Schema<IClassMember>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
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

// Create a compound index to ensure a user can only be in a class once
classMemberSchema.index({ userId: 1, classId: 1 }, { unique: true });

export const ClassMember =
  mongoose.models.ClassMember ||
  mongoose.model<IClassMember>("ClassMember", classMemberSchema);
