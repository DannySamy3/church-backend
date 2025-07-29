import { Request, Response } from "express";
import { ClassAttendance } from "../models/ClassAttendance";
import { ClassMember } from "../models/ClassMember";

export const createClassAttendance = async (req: Request, res: Response) => {
  try {
    const {
      classMemberId,
      date,
      // A: Huduma yangu kwa Yesu (My Service to Jesus)
      evangelismVisits,
      materialsDistributed,
      teachingsSermons,
      soulsConverted,
      // B: Huduma yangu kwa jamii (My Service to Community)
      peopleHelped,
      clothesDonated,
      moneyFoodValue,
      // C: Usomaji wa lesoni na biblia (Lesson and Bible Reading)
      plannedLessonReaders,
      unplannedLessonReaders,
      onlineLessonReaders,
      plannedBibleReaders,
      keshaReaders,
      memoryVerseReciters,
      childrenLessonReaders,
      bibleStudyGuides,
    } = req.body;

    // Validate required fields
    if (!classMemberId) {
      return res.status(400).json({
        error: "Missing required field",
        details: "classMemberId is required",
      });
    }

    // Validate that classMember exists and belongs to the organization
    const classMember = await ClassMember.findOne({
      _id: classMemberId,
      organization: req.organization,
    });

    if (!classMember) {
      return res.status(404).json({
        error: "Class member not found",
        details: "The specified class member does not exist or does not belong to this organization",
      });
    }

    // Check if attendance record already exists for this class member on the given date
    const existingAttendance = await ClassAttendance.findOne({
      classMember: classMemberId,
      date: date ? new Date(date) : new Date(),
    });

    if (existingAttendance) {
      return res.status(400).json({
        error: "Attendance record already exists",
        details: "An attendance record for this class member on this date already exists",
      });
    }

    // Validate numeric fields are non-negative
    const numericFields = {
      evangelismVisits,
      materialsDistributed,
      teachingsSermons,
      soulsConverted,
      peopleHelped,
      clothesDonated,
      moneyFoodValue,
      plannedLessonReaders,
      unplannedLessonReaders,
      onlineLessonReaders,
      plannedBibleReaders,
      keshaReaders,
      memoryVerseReciters,
      childrenLessonReaders,
      bibleStudyGuides,
    };

    for (const [fieldName, value] of Object.entries(numericFields)) {
      if (value !== undefined && (typeof value !== "number" || value < 0)) {
        return res.status(400).json({
          error: `Invalid ${fieldName}`,
          details: `${fieldName} must be a non-negative number`,
        });
      }
    }

    // Create new class attendance record
    const classAttendance = new ClassAttendance({
      classMember: classMemberId,
      date: date ? new Date(date) : new Date(),
      // A: Huduma yangu kwa Yesu
      evangelismVisits: evangelismVisits || 0,
      materialsDistributed: materialsDistributed || 0,
      teachingsSermons: teachingsSermons || 0,
      soulsConverted: soulsConverted || 0,
      // B: Huduma yangu kwa jamii
      peopleHelped: peopleHelped || 0,
      clothesDonated: clothesDonated || 0,
      moneyFoodValue: moneyFoodValue || 0,
      // C: Usomaji wa lesoni na biblia
      plannedLessonReaders: plannedLessonReaders || 0,
      unplannedLessonReaders: unplannedLessonReaders || 0,
      onlineLessonReaders: onlineLessonReaders || 0,
      plannedBibleReaders: plannedBibleReaders || 0,
      keshaReaders: keshaReaders || 0,
      memoryVerseReciters: memoryVerseReciters || 0,
      childrenLessonReaders: childrenLessonReaders || 0,
      bibleStudyGuides: bibleStudyGuides || 0,
    });

    await classAttendance.save();

    // Populate class member details for response
    await classAttendance.populate({
      path: "classMember",
      select: "firstName lastName email phoneNumber",
    });

    res.status(201).json({
      message: "Class attendance record created successfully",
      classAttendance: {
        id: classAttendance._id,
        classMember: classAttendance.classMember,
        date: classAttendance.date,
        // A: Huduma yangu kwa Yesu
        evangelismVisits: classAttendance.evangelismVisits,
        materialsDistributed: classAttendance.materialsDistributed,
        teachingsSermons: classAttendance.teachingsSermons,
        soulsConverted: classAttendance.soulsConverted,
        // B: Huduma yangu kwa jamii
        peopleHelped: classAttendance.peopleHelped,
        clothesDonated: classAttendance.clothesDonated,
        moneyFoodValue: classAttendance.moneyFoodValue,
        // C: Usomaji wa lesoni na biblia
        plannedLessonReaders: classAttendance.plannedLessonReaders,
        unplannedLessonReaders: classAttendance.unplannedLessonReaders,
        onlineLessonReaders: classAttendance.onlineLessonReaders,
        plannedBibleReaders: classAttendance.plannedBibleReaders,
        keshaReaders: classAttendance.keshaReaders,
        memoryVerseReciters: classAttendance.memoryVerseReciters,
        childrenLessonReaders: classAttendance.childrenLessonReaders,
        bibleStudyGuides: classAttendance.bibleStudyGuides,
        createdAt: classAttendance.createdAt,
        updatedAt: classAttendance.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error creating class attendance:", error);
    res.status(500).json({
      error: "Internal server error",
      details: error instanceof Error ? error.message : String(error),
    });
  }
};

export const getClassAttendanceById = async (req: Request, res: Response) => {
  try {
    const { attendanceId } = req.params;

    const classAttendance = await ClassAttendance.findById(attendanceId).populate({
      path: "classMember",
      select: "firstName lastName email phoneNumber",
    });

    if (!classAttendance) {
      return res.status(404).json({ error: "Class attendance record not found" });
    }

    res.json({
      id: classAttendance._id,
      classMember: classAttendance.classMember,
      date: classAttendance.date,
      // A: Huduma yangu kwa Yesu
      evangelismVisits: classAttendance.evangelismVisits,
      materialsDistributed: classAttendance.materialsDistributed,
      teachingsSermons: classAttendance.teachingsSermons,
      soulsConverted: classAttendance.soulsConverted,
      // B: Huduma yangu kwa jamii
      peopleHelped: classAttendance.peopleHelped,
      clothesDonated: classAttendance.clothesDonated,
      moneyFoodValue: classAttendance.moneyFoodValue,
      // C: Usomaji wa lesoni na biblia
      plannedLessonReaders: classAttendance.plannedLessonReaders,
      unplannedLessonReaders: classAttendance.unplannedLessonReaders,
      onlineLessonReaders: classAttendance.onlineLessonReaders,
      plannedBibleReaders: classAttendance.plannedBibleReaders,
      keshaReaders: classAttendance.keshaReaders,
      memoryVerseReciters: classAttendance.memoryVerseReciters,
      childrenLessonReaders: classAttendance.childrenLessonReaders,
      bibleStudyGuides: classAttendance.bibleStudyGuides,
      createdAt: classAttendance.createdAt,
      updatedAt: classAttendance.updatedAt,
    });
  } catch (error) {
    console.error("Error fetching class attendance:", error);
    res.status(500).json({
      error: "Internal server error",
      details: error instanceof Error ? error.message : String(error),
    });
  }
};

export const getAllClassAttendance = async (req: Request, res: Response) => {
  try {
    const { classMemberId, date } = req.query;

    let query: any = {};

    // Filter by class member if provided
    if (classMemberId) {
      query.classMember = classMemberId;
    }

    // Filter by date if provided
    if (date) {
      const targetDate = new Date(date as string);
      const startOfDay = new Date(targetDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(targetDate);
      endOfDay.setHours(23, 59, 59, 999);
      query.date = { $gte: startOfDay, $lte: endOfDay };
    }

    const classAttendance = await ClassAttendance.find(query)
      .populate({
        path: "classMember",
        select: "firstName lastName email phoneNumber",
      })
      .sort({ date: -1, createdAt: -1 });

    res.json(classAttendance);
  } catch (error) {
    console.error("Error fetching all class attendance:", error);
    res.status(500).json({
      error: "Internal server error",
      details: error instanceof Error ? error.message : String(error),
    });
  }
};

export const updateClassAttendance = async (req: Request, res: Response) => {
  try {
    const { attendanceId } = req.params;
    const updateData = req.body;

    const classAttendance = await ClassAttendance.findById(attendanceId);

    if (!classAttendance) {
      return res.status(404).json({ error: "Class attendance record not found" });
    }

    // Validate numeric fields are non-negative if provided
    const numericFields = [
      "evangelismVisits",
      "materialsDistributed",
      "teachingsSermons",
      "soulsConverted",
      "peopleHelped",
      "clothesDonated",
      "moneyFoodValue",
      "plannedLessonReaders",
      "unplannedLessonReaders",
      "onlineLessonReaders",
      "plannedBibleReaders",
      "keshaReaders",
      "memoryVerseReciters",
      "childrenLessonReaders",
      "bibleStudyGuides",
    ];

    for (const field of numericFields) {
      if (updateData[field] !== undefined) {
        if (typeof updateData[field] !== "number" || updateData[field] < 0) {
          return res.status(400).json({
            error: `Invalid ${field}`,
            details: `${field} must be a non-negative number`,
          });
        }
      }
    }

    // Update the record
    Object.assign(classAttendance, updateData);
    await classAttendance.save();

    // Populate class member details for response
    await classAttendance.populate({
      path: "classMember",
      select: "firstName lastName email phoneNumber",
    });

    res.json({
      message: "Class attendance record updated successfully",
      classAttendance: {
        id: classAttendance._id,
        classMember: classAttendance.classMember,
        date: classAttendance.date,
        // A: Huduma yangu kwa Yesu
        evangelismVisits: classAttendance.evangelismVisits,
        materialsDistributed: classAttendance.materialsDistributed,
        teachingsSermons: classAttendance.teachingsSermons,
        soulsConverted: classAttendance.soulsConverted,
        // B: Huduma yangu kwa jamii
        peopleHelped: classAttendance.peopleHelped,
        clothesDonated: classAttendance.clothesDonated,
        moneyFoodValue: classAttendance.moneyFoodValue,
        // C: Usomaji wa lesoni na biblia
        plannedLessonReaders: classAttendance.plannedLessonReaders,
        unplannedLessonReaders: classAttendance.unplannedLessonReaders,
        onlineLessonReaders: classAttendance.onlineLessonReaders,
        plannedBibleReaders: classAttendance.plannedBibleReaders,
        keshaReaders: classAttendance.keshaReaders,
        memoryVerseReciters: classAttendance.memoryVerseReciters,
        childrenLessonReaders: classAttendance.childrenLessonReaders,
        bibleStudyGuides: classAttendance.bibleStudyGuides,
        createdAt: classAttendance.createdAt,
        updatedAt: classAttendance.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error updating class attendance:", error);
    res.status(500).json({
      error: "Internal server error",
      details: error instanceof Error ? error.message : String(error),
    });
  }
};

export const deleteClassAttendance = async (req: Request, res: Response) => {
  try {
    const { attendanceId } = req.params;

    const classAttendance = await ClassAttendance.findById(attendanceId);

    if (!classAttendance) {
      return res.status(404).json({ error: "Class attendance record not found" });
    }

    await classAttendance.deleteOne();

    res.json({ message: "Class attendance record deleted successfully" });
  } catch (error) {
    console.error("Error deleting class attendance:", error);
    res.status(500).json({
      error: "Internal server error",
      details: error instanceof Error ? error.message : String(error),
    });
  }
}; 