import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import mongoose from "mongoose";
import { auth } from "./middleware/auth";
import { organizationMiddleware } from "./middleware/organization";
import authRoutes from "./routes/auth";
import userRoutes from "./routes/users";
import adminRoutes from "./routes/admin";
import moderatorRoutes from "./routes/moderator";
import lessonRoutes from "./routes/lessons";
import customerRoutes from "./routes/customers";
import organizationRoutes from "./routes/organizations";

// Load environment variables with explicit path
const envPath = path.resolve(process.cwd(), ".env");
console.log("Loading environment variables from:", envPath);
dotenv.config({ path: envPath });

// Debug logging for environment variables
console.log("Environment variables loaded:", {
  NODE_ENV: process.env.NODE_ENV,
  SMTP_USER: process.env.SMTP_USER ? "set" : "missing",
  SMTP_PASS: process.env.SMTP_PASS ? "set" : "missing",
  SMTP_FROM: process.env.SMTP_FROM ? "set" : "missing",
  MONGODB_URI: process.env.MONGODB_URI ? "set" : "missing",
});

const app = express();

// Basic middleware
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

// CORS configuration
const corsOptions = {
  origin: function (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void
  ) {
    console.log("CORS request from origin:", origin);
    const allowedOrigins = [
      "http://localhost:3000",
      "https://church-app-dev.netlify.app",
    ];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log("CORS blocked request from:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "Origin",
  ],
  exposedHeaders: ["Content-Range", "X-Content-Range"],
  maxAge: 86400, // 24 hours
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Handle preflight requests explicitly
app.options("*", cors(corsOptions));

// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log("Incoming request:", {
    method: req.method,
    path: req.path,
    origin: req.headers.origin,
    headers: req.headers,
  });
  next();
});

// Security headers
const securityHeaders = {
  "X-Content-Type-Options": process.env.X_CONTENT_TYPE_OPTIONS || "nosniff",
  "X-Frame-Options": process.env.X_FRAME_OPTIONS || "DENY",
  "X-XSS-Protection": process.env.X_XSS_PROTECTION || "1; mode=block",
  "Strict-Transport-Security":
    process.env.STRICT_TRANSPORT_SECURITY ||
    "max-age=31536000; includeSubDomains",
};

Object.entries(securityHeaders).forEach(([key, value]) => {
  app.use((req: Request, res: Response, next: NextFunction) => {
    res.setHeader(key, value);
    next();
  });
});

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// API Routes
app.use("/church/auth", authRoutes);
app.use("/church/organizations", organizationRoutes);
app.use("/church/users", auth, organizationMiddleware, userRoutes);
app.use("/church/admin", auth, organizationMiddleware, adminRoutes);
app.use("/church/moderator", auth, organizationMiddleware, moderatorRoutes);
app.use("/church/lessons", auth, organizationMiddleware, lessonRoutes);
app.use("/church/customers", auth, organizationMiddleware, customerRoutes);

// Health check endpoint
app.get("/health", (req: Request, res: Response) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// Initialize server
const startServer = async () => {
  try {
    console.log("Environment:", process.env.NODE_ENV || "development");
    console.log("Connecting to MongoDB URI:", process.env.MONGODB_URI);

    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is not defined in environment variables");
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    const port = process.env.PORT || "8000";
    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

export default app;
