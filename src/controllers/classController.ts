import { Request, Response } from "express";
import { Class } from "../models/Class";
import { ClassAttendance } from "../models/ClassAttendance";
import { User } from "../models/User";

// Class Management Functions
export const createClass = async (req: Request, res: Response) => {
  try {
    if (!req.organization) {
      return res.status(401).json({
        error: "Authentication Error",
        details: "Please log in with an organization account to create classes.",
      });
    }

    const { name, instructor } = req.body;

    if (!name || !instructor) {
      return res.status(400).json({
        error: "Missing required fields",
        details: "Name and instructor are required",
      });
    }

    // Validate that instructor exists and belongs to the organization
    const instructorUser = await User.findOne({
      _id: instructor,
      organization: req.organization,
    });

    if (!instructorUser) {
      return res.status(404).json({
        error: "Instructor not found",
        details: "The specified instructor does not exist or does not belong to this organization",
      });
    }

    const classRecord = new Class({
      name,
      instructor,
      organization: req.organization,
    });

    await classRecord.save();

    await classRecord.populate({
      path: "instructor",
      select: "firstName lastName email",
    });

    res.status(201).json({
      message: "Class created successfully",
      class: classRecord,
    });
  } catch (error) {
    console.error("Error creating class:", error);
    res.status(500).json({
      error: "Server Error",
      details: "Unable to create class. Please try again later.",
    });
  }
};

export const getClasses = async (req: Request, res: Response) => {
  try {
    if (!req.organization) {
      return res.status(401).json({
        error: "Authentication Error",
        details: "Please log in with an organization account to view classes.",
      });
    }

    const classes = await Class.find({ organization: req.organization })
      .populate({
        path: "instructor",
        select: "firstName lastName email",
      })
      .sort({ createdAt: -1 });

    res.json(classes);
  } catch (error) {
    console.error("Error fetching classes:", error);
    res.status(500).json({
      error: "Server Error",
      details: "Unable to fetch classes. Please try again later.",
    });
  }
};

export const getClassById = async (req: Request, res: Response) => {
  try {
    if (!req.organization) {
      return res.status(401).json({
        error: "Authentication Error",
        details: "Please log in with an organization account to view class details.",
      });
    }

    const classRecord = await Class.findOne({
      _id: req.params.id,
      organization: req.organization,
    }).populate({
      path: "instructor",
      select: "firstName lastName email",
    });

    if (!classRecord) {
      return res.status(404).json({
        error: "Not Found",
        details: "Class not found in your organization.",
      });
    }

    res.json(classRecord);
  } catch (error) {
    console.error("Error fetching class:", error);
    res.status(500).json({
      error: "Server Error",
      details: "Unable to fetch class details. Please try again later.",
    });
  }
};

export const updateClass = async (req: Request, res: Response) => {
  try {
    if (!req.organization) {
      return res.status(401).json({
        error: "Authentication Error",
        details: "Please log in with an organization account to update classes.",
      });
    }

    const classRecord = await Class.findOne({
      _id: req.params.id,
      organization: req.organization,
    });

    if (!classRecord) {
      return res.status(404).json({
        error: "Not Found",
        details: "Class not found in your organization.",
      });
    }

    const { name, instructor } = req.body;

    if (instructor) {
      // Validate that instructor exists and belongs to the organization
      const instructorUser = await User.findOne({
        _id: instructor,
        organization: req.organization,
      });

      if (!instructorUser) {
        return res.status(404).json({
          error: "Instructor not found",
          details: "The specified instructor does not exist or does not belong to this organization",
        });
      }
    }

    Object.assign(classRecord, req.body);
    await classRecord.save();

    await classRecord.populate({
      path: "instructor",
      select: "firstName lastName email",
    });

    res.json({
      message: "Class updated successfully",
      class: classRecord,
    });
  } catch (error) {
    console.error("Error updating class:", error);
    res.status(500).json({
      error: "Server Error",
      details: "Unable to update class. Please try again later.",
    });
  }
};

export const deleteClass = async (req: Request, res: Response) => {
  try {
    if (!req.organization) {
      return res.status(401).json({
        error: "Authentication Error",
        details: "Please log in with an organization account to delete classes.",
      });
    }

    const classRecord = await Class.findOne({
      _id: req.params.id,
      organization: req.organization,
    });

    if (!classRecord) {
      return res.status(404).json({
        error: "Not Found",
        details: "Class not found in your organization.",
      });
    }

    await classRecord.deleteOne();

    res.json({ message: "Class deleted successfully" });
  } catch (error) {
    console.error("Error deleting class:", error);
    res.status(500).json({
      error: "Server Error",
      details: "Unable to delete class. Please try again later.",
    });
  }
};

// Class Attendance Functions (as subset of class operations)
export const createClassAttendance = async (req: Request, res: Response) => {
  try {
    const { classId } = req.params;
    const {
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

    // Validate that class exists and belongs to the organization
    const classRecord = await Class.findOne({
      _id: classId,
      organization: req.organization,
    });

    if (!classRecord) {
      return res.status(404).json({
        error: "Class not found",
        details: "The specified class does not exist or does not belong to this organization",
      });
    }

    // Check if attendance record already exists for this class on the given date
    const existingAttendance = await ClassAttendance.findOne({
      class: classId,
      date: date ? new Date(date) : new Date(),
    });

    if (existingAttendance) {
      return res.status(400).json({
        error: "Attendance record already exists",
        details: "An attendance record for this class on this date already exists",
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
      class: classId,
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

    // Populate class details for response
    await classAttendance.populate({
      path: "class",
      select: "name instructor",
    });

    res.status(201).json({
      message: "Class attendance record created successfully",
      classAttendance: {
        id: classAttendance._id,
        class: classAttendance.class,
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

export const getClassAttendance = async (req: Request, res: Response) => {
  try {
    const { classId } = req.params;
    const { date } = req.query;

    // Validate that class exists and belongs to the organization
    const classRecord = await Class.findOne({
      _id: classId,
      organization: req.organization,
    });

    if (!classRecord) {
      return res.status(404).json({
        error: "Class not found",
        details: "The specified class does not exist or does not belong to this organization",
      });
    }

    let query: any = { class: classId };

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
        path: "class",
        select: "name instructor",
      })
      .sort({ date: -1, createdAt: -1 });

    res.json({
      class: classRecord,
      attendance: classAttendance,
      count: classAttendance.length,
    });
  } catch (error) {
    console.error("Error fetching class attendance:", error);
    res.status(500).json({
      error: "Internal server error",
      details: error instanceof Error ? error.message : String(error),
    });
  }
};

export const getClassAttendanceByDate = async (req: Request, res: Response) => {
  try {
    const { classId, date } = req.params;

    if (!date) {
      return res.status(400).json({
        error: "Missing required parameter",
        details: "date parameter is required",
      });
    }

    // Validate that class exists and belongs to the organization
    const classRecord = await Class.findOne({
      _id: classId,
      organization: req.organization,
    });

    if (!classRecord) {
      return res.status(404).json({
        error: "Class not found",
        details: "The specified class does not exist or does not belong to this organization",
      });
    }

    // Parse the date and create start/end of day range
    const targetDate = new Date(date);
    
    // Check if the date is valid
    if (isNaN(targetDate.getTime())) {
      return res.status(400).json({
        error: "Invalid date format",
        details: "Please provide a valid date in ISO format (YYYY-MM-DD)",
      });
    }

    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const classAttendance = await ClassAttendance.find({
      class: classId,
      date: { $gte: startOfDay, $lte: endOfDay }
    })
      .populate({
        path: "class",
        select: "name instructor",
      })
      .sort({ createdAt: -1 });

    res.json({
      class: classRecord,
      date: targetDate.toISOString().split('T')[0],
      count: classAttendance.length,
      attendance: classAttendance
    });
  } catch (error) {
    console.error("Error fetching class attendance by date:", error);
    res.status(500).json({
      error: "Internal server error",
      details: error instanceof Error ? error.message : String(error),
    });
  }
};

export const updateClassAttendance = async (req: Request, res: Response) => {
  try {
    const { classId, attendanceId } = req.params;
    const updateData = req.body;

    // Validate that class exists and belongs to the organization
    const classRecord = await Class.findOne({
      _id: classId,
      organization: req.organization,
    });

    if (!classRecord) {
      return res.status(404).json({
        error: "Class not found",
        details: "The specified class does not exist or does not belong to this organization",
      });
    }

    const classAttendance = await ClassAttendance.findOne({
      _id: attendanceId,
      class: classId,
    });

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

    // Populate class details for response
    await classAttendance.populate({
      path: "class",
      select: "name instructor",
    });

    res.json({
      message: "Class attendance record updated successfully",
      classAttendance: {
        id: classAttendance._id,
        class: classAttendance.class,
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
    const { classId, attendanceId } = req.params;

    // Validate that class exists and belongs to the organization
    const classRecord = await Class.findOne({
      _id: classId,
      organization: req.organization,
    });

    if (!classRecord) {
      return res.status(404).json({
        error: "Class not found",
        details: "The specified class does not exist or does not belong to this organization",
      });
    }

    const classAttendance = await ClassAttendance.findOne({
      _id: attendanceId,
      class: classId,
    });

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