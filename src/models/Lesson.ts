import mongoose, { Document, Schema } from "mongoose";

export interface ILesson extends Document {
  name: string;
  dateOfRegister: Date;
  age: number;
  price: number;
  quantity: number;
  organization: string;
}

const lessonSchema = new Schema<ILesson>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    dateOfRegister: {
      type: Date,
      required: true,
      default: Date.now,
    },
    age: {
      type: Number,
      required: true,
      min: 0,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
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

export const Lesson =
  mongoose.models.Lesson || mongoose.model<ILesson>("Lesson", lessonSchema);
