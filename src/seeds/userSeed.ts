import mongoose from "mongoose";
import { User } from "../models/User";
import { UserRole } from "../types/roles";
import dotenv from "dotenv";
import { faker } from "@faker-js/faker";
import { Organization } from "../models/Organization";
import { CommunionAttendance } from "../models/CommunionAttendance";

dotenv.config();

interface IUserSeed {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  role: UserRole;
  organization: string;
}

export const seedUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log("Connected to MongoDB");

    // await Organization.deleteMany({});
    await CommunionAttendance.deleteMany({});

    // TODO: Add your organization and user seeding logic here
    // (Assume organizations and users are seeded at this point)

    // Fetch all organizations
    const organizations = await Organization.find();
    for (const org of organizations) {
      // Find the admin user for this organization
      const adminUser = await User.findOne({
        organization: org.name,
        role: UserRole.ADMIN,
      });
      if (!adminUser) {
        console.warn(
          `No admin found for organization ${org.name}, skipping communion attendance for this org.`
        );
        continue;
      }
      // Find all users in this organization
      const users = await User.find({ organization: org.name });
      for (const user of users) {
        await CommunionAttendance.create({
          user: user._id,
          organization: org._id,
          scannedBy: adminUser._id,
          scannedAt: new Date(), // or random date if desired
        });
      }
      console.log(
        `Seeded communion attendance for all users in organization '${org.name}'`
      );
    }

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  } catch (error) {
    console.error("Error seeding users:", error);
    process.exit(1);
  }
};

// Run the seed function if this file is executed directly
if (require.main === module) {
  seedUsers();
}
