import mongoose, { Document, Schema } from "mongoose";
import { IUser } from "./User";

export interface IVisitor extends Document {
  firstName: string;
  secondName: string;
  lastName: string;
  location: string;
  date: Date;
  registeredBy: IUser["_id"];
}

const visitorSchema = new Schema<IVisitor>(
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
    location: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    registeredBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Visitor =
  mongoose.models.Visitor || mongoose.model<IVisitor>("Visitor", visitorSchema);
