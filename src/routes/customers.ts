import express from "express";
import { auth } from "../middleware/auth";
import { organizationMiddleware } from "../middleware/organization";
import {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
} from "../controllers/customerController";

const router = express.Router();

// All routes are protected by auth and organization middleware
router.use(auth, organizationMiddleware);

// Customer routes
router.post("/", createCustomer);
router.get("/", getCustomers);
router.get("/:id", getCustomerById);
router.put("/:id", updateCustomer);
router.delete("/:id", deleteCustomer);

export default router;
