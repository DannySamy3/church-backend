import { Request, Response } from "express";
import { Lesson } from "../models/Lesson";

export const createLesson = async (req: Request, res: Response) => {
  try {
    if (!req.organization) {
      return res.status(401).json({
        error: "Authentication Error",
        details:
          "Please log in with an organization account to create lessons.",
      });
    }

    const lesson = new Lesson({
      ...req.body,
      organization: req.organization,
    });

    await lesson.save();
    res.status(201).json({
      message: "Lesson created successfully",
      lesson,
    });
  } catch (error) {
    console.error("Error creating lesson:", error);
    res.status(500).json({
      error: "Server Error",
      details: "Unable to create lesson. Please try again later.",
    });
  }
};

export const getLessons = async (req: Request, res: Response) => {
  try {
    if (!req.organization) {
      return res.status(401).json({
        error: "Authentication Error",
        details: "Please log in with an organization account to view lessons.",
      });
    }

    const lessons = await Lesson.find({ organization: req.organization });
    res.json(lessons);
  } catch (error) {
    console.error("Error fetching lessons:", error);
    res.status(500).json({
      error: "Server Error",
      details: "Unable to fetch lessons. Please try again later.",
    });
  }
};

export const getLessonById = async (req: Request, res: Response) => {
  try {
    if (!req.organization) {
      return res.status(401).json({
        error: "Authentication Error",
        details:
          "Please log in with an organization account to view lesson details.",
      });
    }

    const lesson = await Lesson.findOne({
      _id: req.params.id,
      organization: req.organization,
    });

    if (!lesson) {
      return res.status(404).json({
        error: "Not Found",
        details: "Lesson not found in your organization.",
      });
    }

    res.json(lesson);
  } catch (error) {
    console.error("Error fetching lesson:", error);
    res.status(500).json({
      error: "Server Error",
      details: "Unable to fetch lesson details. Please try again later.",
    });
  }
};

export const updateLesson = async (req: Request, res: Response) => {
  try {
    if (!req.organization) {
      return res.status(401).json({
        error: "Authentication Error",
        details:
          "Please log in with an organization account to update lessons.",
      });
    }

    const lesson = await Lesson.findOne({
      _id: req.params.id,
      organization: req.organization,
    });

    if (!lesson) {
      return res.status(404).json({
        error: "Not Found",
        details: "Lesson not found in your organization.",
      });
    }

    Object.assign(lesson, req.body);
    await lesson.save();

    res.json({
      message: "Lesson updated successfully",
      lesson,
    });
  } catch (error) {
    console.error("Error updating lesson:", error);
    res.status(500).json({
      error: "Server Error",
      details: "Unable to update lesson. Please try again later.",
    });
  }
};

export const deleteLesson = async (req: Request, res: Response) => {
  try {
    if (!req.organization) {
      return res.status(401).json({
        error: "Authentication Error",
        details:
          "Please log in with an organization account to delete lessons.",
      });
    }

    const lesson = await Lesson.findOne({
      _id: req.params.id,
      organization: req.organization,
    });

    if (!lesson) {
      return res.status(404).json({
        error: "Not Found",
        details: "Lesson not found in your organization.",
      });
    }

    await lesson.deleteOne();

    res.json({ message: "Lesson deleted successfully" });
  } catch (error) {
    console.error("Error deleting lesson:", error);
    res.status(500).json({
      error: "Server Error",
      details: "Unable to delete lesson. Please try again later.",
    });
  }
};
