import express from "express";
import { auth, checkRole } from "../middleware/auth";
import { UserRole } from "../types";

const router = express.Router();

// Auth routes
router.use("/auth", require("./auth"));

// Admin routes
router.use("/admin", auth, checkRole([UserRole.ADMIN]), require("./admin"));

// Clerk routes (previously member routes)
router.use(
  "/clerk",
  auth,
  checkRole([UserRole.ADMIN, UserRole.CLERK]),
  require("./member")
);

// Regular user routes
router.use(
  "/regular",
  auth,
  checkRole([UserRole.ADMIN, UserRole.CLERK, UserRole.REGULAR]),
  require("./member")
);

// Communion Attendance routes
router.use("/communion-attendance", require("./communionAttendance"));

export default router;
