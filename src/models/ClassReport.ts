import mongoose, { Document, Schema } from "mongoose";
import { IClass } from "./Class";

export interface IClassReport extends Document {
  in1: string;
  in2: string;
  in3: string;
  in4: string;
  in5: string;
  in6: string;
  in7: string;
  in8: string;
  in9: string;
  in10: string;
  in11: string;
  in12: string;
  in13: string;
  in14: string;
  in15: string;
  date: Date;
  classId: IClass["_id"];
}

const classReportSchema = new Schema<IClassReport>(
  {
    in1: { type: String, required: true },
    in2: { type: String, required: true },
    in3: { type: String, required: true },
    in4: { type: String, required: true },
    in5: { type: String, required: true },
    in6: { type: String, required: true },
    in7: { type: String, required: true },
    in8: { type: String, required: true },
    in9: { type: String, required: true },
    in10: { type: String, required: true },
    in11: { type: String, required: true },
    in12: { type: String, required: true },
    in13: { type: String, required: true },
    in14: { type: String, required: true },
    in15: { type: String, required: true },
    date: {
      type: Date,
      required: true,
      default: Date.now,
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

export const ClassReport =
  mongoose.models.ClassReport ||
  mongoose.model<IClassReport>("ClassReport", classReportSchema);
