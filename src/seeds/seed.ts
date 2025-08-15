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
    console.log("Cleared all classes and class members data");

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

    // Create regular users (students) first
    const regularUsers = [];
    const totalStudentsNeeded = classNames.length * 15; // Max students per class
    
    for (let i = 0; i < totalStudentsNeeded; i++) {
      const gender = faker.person.sexType();
      const firstName = faker.helpers.arrayElement(swahiliFirstNames[gender]);
      const lastName = faker.helpers.arrayElement(swahiliLastNames);
      const middleName = faker.helpers.arrayElement(swahiliFirstNames[gender]);
      
      const user = {
        firstName,
        middleName,
        lastName,
        email: faker.helpers.maybe(() => faker.internet.email({ firstName, lastName }), { probability: 0.8 }),
        phoneNumber: `+255${faker.string.numeric(9)}`,
        password: faker.internet.password(),
        role: 'regular',
        organization: organization._id,
        member: faker.datatype.boolean(),
        gender,
      };
      regularUsers.push(user);
    }
    
    const createdRegularUsers = await User.insertMany(regularUsers);
    console.log(`Created ${createdRegularUsers.length} regular users (students)`);

    // Create class members (students) for each class
    const classMembers = [];
    for (const classItem of createdClasses) {
      // Create 5-15 students for each class
      const numStudents = faker.number.int({ min: 5, max: 15 });
      
      // Get random users from the created regular users
      const shuffledUsers = faker.helpers.shuffle([...createdRegularUsers]);
      const selectedUsers = shuffledUsers.slice(0, numStudents);
      
      for (const user of selectedUsers) {
        const classMember = {
          userId: user._id,
          classId: classItem._id,
        };
        classMembers.push(classMember);
      }
    }

    await ClassMember.insertMany(classMembers);
    console.log(`Created ${classMembers.length} class members`);

    // Verify the seeding by checking student counts
    console.log("\n=== Class Summary ===");
    for (const classItem of createdClasses) {
      const studentCount = await ClassMember.countDocuments({ classId: classItem._id });
      console.log(`${classItem.name}: ${studentCount} students`);
    }

    console.log("\nSeeding completed successfully!");

    // Demonstrate API functionality by creating a test class with students
    console.log("\n=== Testing API Functionality ===");
    const testClass = new Class({
      name: "Test Class - API Demo",
      instructor: createdInstructors[0]._id,
      organization: organization._id,
    });
    await testClass.save();

    // Get some users to be test students for the demo class
    const testStudentUsers = await User.find({ 
      organization: organization._id,
              role: { $ne: 'instructor' } // Exclude instructors
    }).limit(3);

    const testClassMembers = testStudentUsers.map(user => ({
      userId: user._id,
      classId: testClass._id,
    }));

    await ClassMember.insertMany(testClassMembers);
    
    // Verify the test class
    const finalStudentCount = await ClassMember.countDocuments({ classId: testClass._id });
    console.log(`Test Class "${testClass.name}": ${finalStudentCount} students`);
    console.log("API functionality test completed!");

  } catch (error) {
    console.error("Error seeding data:", error);
  } finally {
    await mongoose.disconnect();
    console.log("MongoDB disconnected.");
  }
};

seed();
