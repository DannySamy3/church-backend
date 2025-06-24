import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { User } from "../models/User";
import { Organization } from "../models/Organization";
import { CommunionAttendance } from "../models/CommunionAttendance";
import { UserRole } from "../types/roles";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const seed = async () => {
  const dbUri = process.env.MONGODB_URI;

  if (!dbUri) {
    console.error("MONGODB_URI is not defined in .env file");
    process.exit(1);
  }

  try {
    await mongoose.connect(dbUri);
    console.log("MongoDB connected for seeding");

    // Clear only existing communion attendance data
    await CommunionAttendance.deleteMany({});
    console.log("Cleared existing communion attendance");

    const organizations = await Organization.find({});
    if (organizations.length === 0) {
      console.log(
        "No organizations found in the database. Please create an organization first."
      );
      return;
    }
    console.log(
      `Found ${organizations.length} organizations. Seeding attendance for each.`
    );

    const allAttendances = [];

    for (const organization of organizations) {
      console.log(`--- Processing organization: ${organization.name} ---`);

      const regularUsers = await User.find({
        organization: organization._id,
        role: UserRole.REGULAR,
      });

      if (regularUsers.length === 0) {
        console.log(
          `No regular users found for ${organization.name}. Skipping.`
        );
        continue;
      }

      let scanner = await User.findOne({
        organization: organization._id,
        role: UserRole.CLERK,
      });

      if (!scanner) {
        scanner = await User.findOne({
          organization: organization._id,
          role: UserRole.ADMIN,
        });
      }

      if (!scanner) {
        console.log(
          `No Clerk or Admin found for ${organization.name} to act as scanner. Skipping.`
        );
        continue;
      }

      console.log(
        `Found ${regularUsers.length} regular users and a scanner (${scanner.role}).`
      );

      const today = new Date();

      // Generate attendance for the last 4 Sundays
      for (let i = 0; i < 4; i++) {
        const sunday = new Date(today);
        sunday.setDate(today.getDate() - today.getDay() - i * 7);
        sunday.setHours(10, 0, 0, 0); // Set time to 10 AM

        // Let's have about 70% of regular users attend each sunday
        const attendees = regularUsers.filter(() => Math.random() < 0.7);

        for (const user of attendees) {
          allAttendances.push({
            user: user._id,
            organization: organization._id,
            scannedBy: scanner._id,
            scannedAt: new Date(
              sunday.getTime() + Math.random() * 60 * 60 * 1000
            ), // scan somewhere between 10 and 11 AM
          });
        }
      }
      console.log(`Generated attendance records for ${organization.name}.`);
    }

    if (allAttendances.length > 0) {
      await CommunionAttendance.insertMany(allAttendances);
      console.log(
        `\nTotal of ${allAttendances.length} communion attendance records created across all organizations.`
      );
    } else {
      console.log("\nNo new attendance records to create.");
    }
  } catch (error) {
    console.error("Error seeding data:", error);
  } finally {
    await mongoose.disconnect();
    console.log("MongoDB disconnected.");
  }
};

seed();
