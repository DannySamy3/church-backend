import mongoose, { Document, Schema } from "mongoose";
import { IClass } from "./Class";

export interface IClassAttendance extends Document {
  class: IClass["_id"];
  date: Date;
  
  // A: Huduma yangu kwa Yesu (My Service to Jesus)
  evangelismVisits: number; // Mara ngapi umetembelea kwa kusudi la injili
  materialsDistributed: number; // Idadi ya magazeti, vijizuu na vitabu vilivyotolewa
  teachingsSermons: number; // Idadi ya mafundisho/mahubiri yaliyotolewa
  soulsConverted: number; // Roho zilizoongolewa
  
  // B: Huduma yangu kwa jamii (My Service to Community)
  peopleHelped: number; // Idadi ya watu waliosaidiwa
  clothesDonated: number; // Idadi ya nguo zilizotolewa
  moneyFoodValue: number; // Thamani ya fedha na chakula kilichotolewa
  
  // C: Usomaji wa lesoni na biblia (Lesson and Bible Reading)
  plannedLessonReaders: number; // Waliosoma lesoni kwa mpango
  unplannedLessonReaders: number; // Waliosoma lesoni japo si kwa mpango
  onlineLessonReaders: number; // Waliosoma lesoni kwa njia ya mtandao
  plannedBibleReaders: number; // Waliosoma biblia kwa mpango
  keshaReaders: number; // Waliosoma Kesha/Roho ya unabii
  memoryVerseReciters: number; // Waliokariri fungu la kukariri
  childrenLessonReaders: number; // Waliosoma lesoni za watoto na watoto wao
  bibleStudyGuides: number; // Walio na mwongozo wa kujifunza biblia
}

const classAttendanceSchema = new Schema<IClassAttendance>(
  {
    class: {
      type: Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    
    // A: Huduma yangu kwa Yesu (My Service to Jesus)
    evangelismVisits: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    materialsDistributed: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    teachingsSermons: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    soulsConverted: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    
    // B: Huduma yangu kwa jamii (My Service to Community)
    peopleHelped: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    clothesDonated: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    moneyFoodValue: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    
    // C: Usomaji wa lesoni na biblia (Lesson and Bible Reading)
    plannedLessonReaders: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    unplannedLessonReaders: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    onlineLessonReaders: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    plannedBibleReaders: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    keshaReaders: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    memoryVerseReciters: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    childrenLessonReaders: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    bibleStudyGuides: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

export const ClassAttendance =
  mongoose.models.ClassAttendance ||
  mongoose.model<IClassAttendance>("ClassAttendance", classAttendanceSchema);
