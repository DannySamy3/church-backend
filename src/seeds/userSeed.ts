import mongoose from "mongoose";
import { User } from "../models/User";
import { UserRole } from "../types/roles";
import dotenv from "dotenv";
import { faker } from "@faker-js/faker";

dotenv.config();

const organizations = ["church1", "church2", "church3"];

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

const generateUsers = (totalCount: number): IUserSeed[] => {
  const users: IUserSeed[] = [];

  // Calculate number of users for each role based on distribution
  const roleCounts = Object.entries(roleDistribution).reduce(
    (acc, [role, percentage]) => {
      acc[role as UserRole] = Math.round(totalCount * percentage);
      return acc;
    },
    {} as Record<UserRole, number>
  );

  // Adjust total to ensure we get exactly totalCount users
  const totalAllocated = Object.values(roleCounts).reduce(
    (sum, count) => sum + count,
    0
  );
  if (totalAllocated !== totalCount) {
    roleCounts[UserRole.REGULAR] += totalCount - totalAllocated;
  }

  // Generate users for each role
  Object.entries(roleCounts).forEach(([role, count]) => {
    for (let i = 0; i < count; i++) {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      const email = faker.internet.email({ firstName, lastName }).toLowerCase();
      const phoneNumber = faker.phone.number();
      const organization = faker.helpers.arrayElement(organizations);

      // Generate appropriate password based on role
      const password = `${role}@${faker.internet.password({ length: 8 })}`;

      users.push({
        firstName,
        lastName,
        email,
        phoneNumber,
        password,
        role: role as UserRole,
        organization,
      });
    }
  });

  // Shuffle the array to mix roles
  return faker.helpers.shuffle(users);
};

// Generate 40 users with mixed roles
const users = generateUsers(40);

export const seedUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log("Connected to MongoDB");

    // Clear existing users
    await User.deleteMany({});
    console.log("Cleared existing users");

    // Insert new users
    await User.insertMany(users);
    console.log(`Successfully added ${users.length} new users`);

    // Log role distribution
    const roleCounts = users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log("Role distribution:", roleCounts);

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
