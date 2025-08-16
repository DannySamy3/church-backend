import express from "express";
import { upload } from "../middleware/upload";
import {
  getAllUsers,
  updateUserRole,
  deleteUser,
  createUser,
  getUserById,
  getProfile,
  changePassword,
  getRegularUsers,
  addScanUser,
} from "../controllers/userController";

const router = express.Router();

// Get all users
router.get("/", getAllUsers);

// Get profile (must be before :userId)
router.get("/profile", getProfile);

// Change password
router.post("/change-password", changePassword);

// Get regular users (must be before :userId)
router.get("/regular", getRegularUsers);

// Get user by ID
router.get("/:userId", getUserById);

// Create new user with image upload
router.post("/", upload.single("profileImage"), createUser);

// Add a new user via scan (optional image)
router.post("/scan", upload.single("profileImage"), addScanUser);

// Update user role
router.put("/:userId/role", updateUserRole);

// Delete user
router.delete("/:userId", deleteUser);

export default router;
