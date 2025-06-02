import express from "express";
import {
  getAllUsers,
  updateUserRole,
  deleteUser,
  createUser,
  getUserById,
} from "../controllers/adminController";

const router = express.Router();

// Get all users
router.get("/users", getAllUsers);

// Get user by ID
router.get("/users/:userId", getUserById);

// Create new user
router.post("/users", createUser);

// Update user role
router.put("/users/:userId/role", updateUserRole);

// Delete user
router.delete("/users/:userId", deleteUser);

export default router;
