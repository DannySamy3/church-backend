import express from "express";
import { register, login } from "../controllers/authController";
import { auth, adminCreationAuth } from "../middleware/auth";
import { checkRole } from "../middleware/roleAuth";
import { UserRole } from "../types/roles";
import { User } from "../models/User";

const router = express.Router();

// First-time setup route - only works when no users exist
router.post("/setup", adminCreationAuth, register);

// Login
router.post("/login", login);

// Get current user
router.get("/me", auth);

export default router;
