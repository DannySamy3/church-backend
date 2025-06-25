import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { User } from "../models/User";
import { Organization } from "../models/Organization";
import { CommunionAttendance } from "../models/CommunionAttendance";
// import { UserRole } from "../types/roles";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const seed = async () => {
  const dbUri = process.env.MONGODB_URI;

  if (!dbUri) {
    console.error("MONGODB_URI is not defined in .env file");
    process.exit(1);
  }

  try {
    await mongoose.connect(dbUri);
    console.log("MongoDB connected for clearing data");

    // Delete all data from all collections
    await User.deleteMany({});
    await Organization.deleteMany({});
    await CommunionAttendance.deleteMany({});
    console.log(
      "Cleared all data from User, Organization, and CommunionAttendance collections"
    );

    // --- All other seeding logic is commented out ---
    // const organizations = await Organization.find({});
    // ...
  } catch (error) {
    console.error("Error clearing data:", error);
  } finally {
    await mongoose.disconnect();
    console.log("MongoDB disconnected.");
  }
};

seed();
