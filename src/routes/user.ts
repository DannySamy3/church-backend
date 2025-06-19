import express from "express";
import { upload } from "../middleware/upload";
import {
  getAllUsers,
  // updateUserRole,
  deleteUser,
  createUser,
  getUserById,
  getProfile,
  changePassword,
  getRegularUsers,
} from "../controllers/userController";

const router = express.Router();

// Get all users
router.get("/", getAllUsers);

// Get profile (must be before :userId)
router.get("/profile", getProfile);

// Get regular users (must be before :userId)
router.get("/regular", getRegularUsers);

// Get user by ID
router.get("/:userId", getUserById);

// Create new user with image upload
router.post("/", upload.single("profileImage"), createUser);

// Delete user
router.delete("/:userId", deleteUser);

export default router;
