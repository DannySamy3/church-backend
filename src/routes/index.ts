import express from "express";
import { auth, checkRole } from "../middleware/auth";
import { UserRole } from "../types";

const router = express.Router();

// Auth routes
router.use("/auth", require("./auth"));

// Admin routes
router.use("/admin", auth, checkRole([UserRole.ADMIN]), require("./admin"));

// Instructor routes
router.use(
  "/instructor",
  auth,
  checkRole([UserRole.ADMIN, UserRole.INSTRUCTOR]),
  require("./instructor")
);

// Member routes
router.use(
  "/member",
  auth,
  checkRole([UserRole.ADMIN, UserRole.INSTRUCTOR, UserRole.MEMBER]),
  require("./member")
);

export default router;
