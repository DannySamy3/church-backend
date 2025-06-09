import express from "express";
import { register, login } from "../controllers/authController";
import { auth, adminCreationAuth } from "../middleware/auth";
import { checkRole } from "../middleware/roleAuth";
import { UserRole } from "../types/roles";
import { User } from "../models/User";

const router = express.Router();

// CORS middleware for auth routes
router.use((req, res, next) => {
  // Clear any existing CORS headers
  res.removeHeader("Access-Control-Allow-Origin");
  res.removeHeader("Access-Control-Allow-Credentials");
  res.removeHeader("Access-Control-Allow-Methods");
  res.removeHeader("Access-Control-Allow-Headers");

  const origin = req.headers.origin;
  console.log("Auth route - Request origin:", origin);
  console.log("Auth route - Request method:", req.method);
  console.log("Auth route - Current headers:", res.getHeaders());

  // Always set the origin to match the request origin for localhost
  if (origin === "http://localhost:3000") {
    console.log("Setting CORS headers for localhost");
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS, PATCH"
    );
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, X-Requested-With, Accept, Origin"
    );
  } else if (origin === "https://church-app-dev.netlify.app") {
    console.log("Setting CORS headers for Netlify");
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS, PATCH"
    );
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, X-Requested-With, Accept, Origin"
    );
  } else {
    console.log("No matching origin found");
  }

  if (req.method === "OPTIONS") {
    console.log("Handling OPTIONS request");
    res.status(204).end();
    return;
  }

  console.log("Final CORS headers:", res.getHeaders());
  next();
});

// First-time setup route - only works when no users exist
router.post("/setup", adminCreationAuth, register);

// Login
router.post("/login", (req, res) => {
  console.log("Login route - Request origin:", req.headers.origin);
  console.log("Login route - Current headers:", res.getHeaders());
  login(req, res);
});

export default router;
