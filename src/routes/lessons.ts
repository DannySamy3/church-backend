import express from "express";
import { auth } from "../middleware/auth";
import { organizationMiddleware } from "../middleware/organization";
import {
  createLesson,
  getLessons,
  getLessonById,
  updateLesson,
  deleteLesson,
} from "../controllers/lessonController";

const router = express.Router();

// All routes are protected by auth and organization middleware
router.use(auth, organizationMiddleware);

// Lesson routes
router.post("/", createLesson);
router.get("/", getLessons);
router.get("/:id", getLessonById);
router.put("/:id", updateLesson);
router.delete("/:id", deleteLesson);

export default router;
