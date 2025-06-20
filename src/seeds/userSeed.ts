import mongoose from "mongoose";
import { User } from "../models/User";
import { UserRole } from "../types/roles";
import dotenv from "dotenv";
import { faker } from "@faker-js/faker";
import { Organization } from "../models/Organization";
import { CommunionAttendance } from "../models/CommunionAttendance";

dotenv.config();

// Define the distribution of roles
const roleDistribution = {
  [UserRole.ADMIN]: 0.1, // 10% admins
  [UserRole.CLERK]: 0.3, // 30% clerks
  [UserRole.REGULAR]: 0.6, // 60% regular users
};

interface IUserSeed {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  role: UserRole;
  organization: string;
}

const generateUsersForOrganizations = async (totalCountPerOrg: number) => {
  const users: IUserSeed[] = [];
  const orgs = await Organization.find();
  for (const org of orgs) {
    // Calculate number of users for each role based on distribution
    const roleCounts = Object.entries(roleDistribution).reduce(
      (acc, [role, percentage]) => {
        acc[role as UserRole] = Math.round(totalCountPerOrg * percentage);
        return acc;
      },
      {} as Record<UserRole, number>
    );
    // Adjust total to ensure we get exactly totalCountPerOrg users
    const totalAllocated = Object.values(roleCounts).reduce(
      (sum, count) => sum + count,
      0
    );
    if (totalAllocated !== totalCountPerOrg) {
      roleCounts[UserRole.REGULAR] += totalCountPerOrg - totalAllocated;
    }
    let orgUserCount = 0;
    // Generate users for each role
    Object.entries(roleCounts).forEach(([role, count]) => {
      for (let i = 0; i < count; i++) {
        const firstName = faker.person.firstName();
        const lastName = faker.person.lastName();
        // Ensure unique email by appending a random string
        const email = `${faker.internet
          .email({ firstName, lastName })
          .toLowerCase()
          .replace(/@/, `.${faker.string.alphanumeric(6).toLowerCase()}@`)}`;
        const phoneNumber = faker.phone.number();
        // Generate appropriate password based on role
        const password = `${role}@${faker.internet.password({ length: 8 })}`;
        users.push({
          firstName,
          lastName,
          email,
          phoneNumber,
          password,
          role: role as UserRole,
          organization: org.name,
        });
        orgUserCount++;
      }
    });
    console.log(
      `Prepared to add ${orgUserCount} users to organization '${org.name}'`
    );
  }
  // Shuffle the array to mix roles
  return faker.helpers.shuffle(users);
};

// Generate users for each real organization
const USERS_PER_ORG = 20;

export const seedUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log("Connected to MongoDB");

    // Clear existing users, organizations, and communion attendance
    await User.deleteMany({});
    await Organization.deleteMany({});
    await CommunionAttendance.deleteMany({});

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
