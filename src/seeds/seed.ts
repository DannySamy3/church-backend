import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { faker } from "@faker-js/faker";
import { User } from "../models/User";
import { Organization } from "../models/Organization";
import { CommunionAttendance } from "../models/CommunionAttendance";
import { Class } from "../models/Class";
import { ClassMember } from "../models/ClassMember";
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

 
    await Class.deleteMany({});
    await ClassMember.deleteMany({});
    console.log("Cleared all regular users, communion attendance, classes, and class members data");

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

    // Create regular users first with Swahili names
    const swahiliFirstNames = {
      male: [
        "Juma", "Mwanza", "Kiprop", "Kipchoge", "Kiprotich", "Kipngetich", "Kiprono", "Kipruto", "Kipkoech", "Kiprotich",
        "Kipchumba", "Kipkemboi", "Kipketer", "Kipkirui", "Kiplagat", "Kipngeno", "Kiprotich", "Kipsang", "Kipsiele", "Kiptanui",
        "Kiptoo", "Kiptum", "Kipwawok", "Kipwawok", "Kipwawok", "Kipwawok", "Kipwawok", "Kipwawok", "Kipwawok", "Kipwawok"
      ],
      female: [
        "Amina", "Fatima", "Hawa", "Halima", "Jamila", "Khadija", "Mariam", "Naima", "Rahma", "Safiya",
        "Zainab", "Zara", "Zahra", "Yasmin", "Wanjiku", "Wanjiru", "Wanjiku", "Wanjiru", "Wanjiku", "Wanjiru",
        "Wanjiku", "Wanjiru", "Wanjiku", "Wanjiru", "Wanjiku", "Wanjiru", "Wanjiku", "Wanjiru", "Wanjiku", "Wanjiru"
      ]
    };

    const swahiliLastNames = [
      "Muthoni", "Njeri", "Nyambura", "Wambui", "Wanjiku", "Wanjiru", "Wanjiku", "Wanjiru", "Wanjiku", "Wanjiru",
      "Kiprop", "Kipchoge", "Kiprotich", "Kipngetich", "Kiprono", "Kipruto", "Kipkoech", "Kiprotich", "Kipchumba", "Kipkemboi",
      "Kipketer", "Kipkirui", "Kiplagat", "Kipngeno", "Kiprotich", "Kipsang", "Kipsiele", "Kiptanui", "Kiptoo", "Kiptum"
    ];

    const users = [];
    for (let i = 0; i < 50; i++) {
      const gender = faker.person.sexType();
      const firstName = faker.helpers.arrayElement(swahiliFirstNames[gender]);
      const lastName = faker.helpers.arrayElement(swahiliLastNames);
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

    // Create some instructor users for classes with Swahili names
    const instructorNames = [
      { firstName: "Mwalimu", lastName: "Bethlehem" },
      { firstName: "Mwalimu", lastName: "Nazareth" },
      { firstName: "Mwalimu", lastName: "Jerusalem" },
      { firstName: "Mwalimu", lastName: "Galilee" },
      { firstName: "Mwalimu", lastName: "Capernaum" }
    ];

    const instructors = [];
    for (let i = 0; i < 5; i++) {
      const gender = faker.person.sexType();
      const instructorName = instructorNames[i];
      const instructor = {
        firstName: instructorName.firstName,
        lastName: instructorName.lastName,
        email: faker.internet.email({
          firstName: instructorName.firstName,
          lastName: instructorName.lastName,
          provider: `instructor${i}.com`,
        }),
        phoneNumber: faker.string.numeric(10),
        password: "password123", // Default password for instructors
        profileImageUrl: `https://i.imgur.com/${faker.string.alphanumeric(7)}.jpg`,
        role: UserRole.INSTRUCTOR,
        organization: organization._id,
        member: true,
        gender: gender,
      };
      instructors.push(instructor);
    }

    const createdInstructors = await User.insertMany(instructors);
    console.log(`Created ${createdInstructors.length} instructor users`);

    // Create classes with instructors
    const classNames = [
      "Shule ya Jumapili - Wazee",
      "Shule ya Jumapili - Vijana",
      "Shule ya Jumapili - Watoto",
      "Utafiti wa Biblia - Wanaoanza",
      "Utafiti wa Biblia - Waliokomaa",
      "Kikundi cha Sala",
      "Kwaya",
      "Ushirika wa Vijana",
      "Ushirika wa Wanawake",
      "Ushirika wa Wanaume"
    ];

    const classes = [];
    for (let i = 0; i < classNames.length; i++) {
      const classData = {
        name: classNames[i],
        instructor: createdInstructors[i % createdInstructors.length]._id,
        organization: organization._id,
      };
      classes.push(classData);
    }

    const createdClasses = await Class.insertMany(classes);
    console.log(`Created ${createdClasses.length} classes`);

    // Create class members using the regular users
    const classMembers = [];
    for (const user of createdUsers) {
      // Randomly assign users to 1-3 classes
      const numClasses = faker.number.int({ min: 1, max: 3 });
      const selectedClasses = faker.helpers.arrayElements(createdClasses, numClasses);
      
      for (const classItem of selectedClasses) {
        const classMember = {
          firstName: user.firstName,
          secondName: user.middleName || "N/A", // Use middleName as secondName if available, otherwise "N/A"
          lastName: user.lastName,
          classId: classItem._id,
        };
        classMembers.push(classMember);
      }
    }

    await ClassMember.insertMany(classMembers);
    console.log(`Created ${classMembers.length} class members`);

    console.log("Seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding data:", error);
  } finally {
    await mongoose.disconnect();
    console.log("MongoDB disconnected.");
  }
};

seed();
