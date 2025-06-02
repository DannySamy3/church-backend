import express from "express";
import {
  createInstructor,
  getInstructor,
  editInstructor,
  deleteInstructor,
} from "../controllers/instructorController";
import { auth } from "../middleware/auth";
import { checkRole } from "../middleware/roleAuth";
import { UserRole } from "../types/roles";
import multer from "multer";

const router = express.Router();

// Set up multer for file uploads
const storage = multer.memoryStorage(); // Store files in memory as buffers
const upload = multer({ storage: storage });

// Protect all instructor routes with auth and checkRole('member') middleware
router.use(auth);
router.use(checkRole([UserRole.MEMBER]));

// Create a new instructor (POST /api/instructors)
// Use multer middleware to handle single file upload with field name 'profileImage'
router.post("/", upload.single("profileImage"), createInstructor);

// Get instructor details by ID (GET /api/instructors/:id)
router.get("/:id", getInstructor);

// Edit instructor details by ID (PUT /api/instructors/:id)
router.put("/:id", editInstructor);

// Delete an instructor by ID (DELETE /api/instructors/:id)
router.delete("/:id", deleteInstructor);

export default router;
