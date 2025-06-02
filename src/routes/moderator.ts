import express from "express";
import {
  getAllUsers,
  getUserDetails,
  reportUser,
} from "../controllers/moderatorController";

const router = express.Router();

// Get all users (moderators can view but not modify)
router.get("/users", getAllUsers);

// Get user details
router.get("/users/:userId", getUserDetails);

// Report user (moderators can report users for review)
router.post("/users/:userId/report", reportUser);

export default router;
