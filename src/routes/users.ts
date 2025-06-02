import express from "express";
import {
  getProfile,
  updateProfile,
  changePassword,
} from "../controllers/userController";

const router = express.Router();

// Get user profile
router.get("/profile", getProfile);

// Update user profile
router.put("/profile", updateProfile);

// Change password
router.put("/change-password", changePassword);

export default router;
