import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { faker } from "@faker-js/faker";
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
    console.log("MongoDB connected for seeding data");

    // Clear previous seed data
    await User.deleteMany({ role: UserRole.REGULAR });
    await CommunionAttendance.deleteMany({});
    console.log("Cleared all regular users and communion attendance data");

    const organization = await Organization.findOne();
    if (!organization) {
      console.error(
        "No organization found in the database. Please create one first."
      );
      process.exit(1);
    }
    console.log(`Using organization: ${organization.name}`);

    const adminUser = await User.findOne({ role: UserRole.ADMIN });
    if (!adminUser) {
      console.error(
        "No admin user found in the database. Please create one first."
      );
      process.exit(1);
    }
    console.log(`Using admin user: ${adminUser.email}`);

    const users = [];
    for (let i = 0; i < 50; i++) {
      const gender = faker.person.sexType();
      const firstName = faker.person.firstName(gender);
      const lastName = faker.person.lastName();
      const user = {
        firstName,
        lastName,
        email: faker.internet.email({
          firstName,
          lastName,
          provider: `example${i}.com`,
        }),
        phoneNumber: faker.string.numeric(10),
        profileImageUrl:
          i % 2 === 0
            ? `https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/${gender}/512/${faker.number.int(
                { min: 1, max: 100 }
              )}.jpg`
            : `https://i.imgur.com/${faker.string.alphanumeric(7)}.jpg`,
        role: UserRole.REGULAR,
        organization: organization._id,
        member: true,
        gender: gender,
      };
      users.push(user);
    }

    const createdUsers = await User.insertMany(users);
    console.log(`Created ${createdUsers.length} regular users`);

    const communionAttendances = [];
    for (const user of createdUsers) {
      const attendance = {
        user: user._id,
        organization: organization._id,
        scannedBy: adminUser._id,
        scannedAt: new Date(),
      };
      communionAttendances.push(attendance);
    }

    await CommunionAttendance.insertMany(communionAttendances);
    console.log(
      `Created ${communionAttendances.length} communion attendance records`
    );
  } catch (error) {
    console.error("Error seeding data:", error);
  } finally {
    await mongoose.disconnect();
    console.log("MongoDB disconnected.");
  }
};

seed();
