import express from "express";
import { auth } from "../middleware/auth";
import {
  createOrganization,
  getOrganizations,
  getOrganizationById,
  updateOrganization,
  deleteOrganization,
} from "../controllers/organizationController";

const router = express.Router();

// Public routes
router.get("/", getOrganizations);
router.get("/:id", getOrganizationById);

// Protected routes (require authentication)
router.post("/", createOrganization);
router.put("/:id", auth, updateOrganization);
router.delete("/:id", auth, deleteOrganization);

export default router;
