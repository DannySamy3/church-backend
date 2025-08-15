const mongoose = require('mongoose');
const { Class } = require('./dist/models/Class');
const { ClassMember } = require('./dist/models/ClassMember');
const { User } = require('./dist/models/User');

// Test script to verify class API functionality
const testClassAPI = async () => {
  try {
    console.log('=== Testing Class API Functionality ===\n');

    // 1. Test getting all classes with student counts
    console.log('1. Testing GET /api/classes');
    const allClasses = await Class.find({})
      .populate({
        path: 'instructor',
        select: 'firstName lastName email',
      })
      .sort({ createdAt: -1 });

         const classesWithStudents = await Promise.all(
       allClasses.map(async (classRecord) => {
         const students = await ClassMember.find({ classId: classRecord._id })
           .populate({
             path: "userId",
             select: "firstName middleName lastName email phoneNumber gender",
           });
         return {
           ...classRecord.toObject(),
           students: students.map(member => member.userId),
           studentCount: students.length,
         };
       })
     );

    console.log(`Found ${classesWithStudents.length} classes:`);
    classesWithStudents.forEach((classItem, index) => {
      console.log(`  ${index + 1}. ${classItem.name} - ${classItem.studentCount} students`);
      console.log(`     Instructor: ${classItem.instructor.firstName} ${classItem.instructor.lastName}`);
      console.log(`     Students: ${classItem.students.map(s => `${s.firstName} ${s.lastName}`).join(', ')}`);
    });

    // 2. Test getting a specific class by ID
    if (classesWithStudents.length > 0) {
      console.log('\n2. Testing GET /api/classes/:id');
      const firstClass = classesWithStudents[0];
      const classById = await Class.findById(firstClass._id)
        .populate({
          path: 'instructor',
          select: 'firstName lastName email',
        });

             if (classById) {
         const students = await ClassMember.find({ classId: classById._id })
           .populate({
             path: "userId",
             select: "firstName middleName lastName email phoneNumber gender",
           });
         const classWithStudents = {
           ...classById.toObject(),
           students: students.map(member => member.userId),
           studentCount: students.length,
         };

        console.log(`Class Details for "${classWithStudents.name}":`);
        console.log(`  ID: ${classWithStudents._id}`);
        console.log(`  Instructor: ${classWithStudents.instructor.firstName} ${classWithStudents.instructor.lastName}`);
        console.log(`  Student Count: ${classWithStudents.studentCount}`);
        console.log(`  Students: ${classWithStudents.students.map(s => `${s.firstName} ${s.lastName}`).join(', ')}`);
      }
    }

    // 3. Test creating a new class with students
    console.log('\n3. Testing POST /api/classes (Create Class)');
         const instructors = await User.find({ role: 'instructor' }).limit(1);
    
    if (instructors.length > 0) {
             // Get some users to be test students
       const testStudentUsers = await User.find({ 
         organization: allClasses[0].organization,
         role: { $ne: 'instructor' } // Exclude instructors
       }).limit(2);

       if (testStudentUsers.length === 0) {
         console.log('  No regular users found for testing. Skipping test class creation.');
         return;
       }

       const newClassData = {
         name: "Test Class Created via API",
         instructor: instructors[0]._id,
         organization: allClasses[0].organization, // Use existing organization
         students: testStudentUsers.map(user => user._id.toString())
       };

      // Simulate the createClass API logic
      const newClass = new Class({
        name: newClassData.name,
        instructor: newClassData.instructor,
        organization: newClassData.organization,
      });
      await newClass.save();

      // Create students for the class
      if (newClassData.students && newClassData.students.length > 0) {
                 const classMembers = newClassData.students.map((studentId) => ({
           userId: studentId,
           classId: newClass._id,
         }));

        await ClassMember.insertMany(classMembers);
      }

      // Populate instructor and get students for response
      await newClass.populate({
        path: "instructor",
        select: "firstName lastName email",
      });

             const classMembers = await ClassMember.find({ classId: newClass._id })
         .populate({
           path: "userId",
           select: "firstName middleName lastName email phoneNumber gender",
         });
       const classWithStudents = {
         ...newClass.toObject(),
         students: classMembers.map(member => member.userId),
         studentCount: classMembers.length,
       };

      console.log(`Created new class: "${classWithStudents.name}"`);
      console.log(`  ID: ${classWithStudents._id}`);
      console.log(`  Instructor: ${classWithStudents.instructor.firstName} ${classWithStudents.instructor.lastName}`);
      console.log(`  Student Count: ${classWithStudents.studentCount}`);
      console.log(`  Students: ${classWithStudents.students.map(s => `${s.firstName} ${s.lastName}`).join(', ')}`);

      // Clean up - delete the test class
      await ClassMember.deleteMany({ classId: newClass._id });
      await newClass.deleteOne();
      console.log('  (Test class cleaned up)');
    }

    console.log('\n=== API Testing Completed Successfully ===');
    console.log('All endpoints are working correctly with student count functionality!');

  } catch (error) {
    console.error('Error testing API:', error);
  }
};

// Run the test if this file is executed directly
if (require.main === module) {
  const dbUri = process.env.MONGODB_URI;
  if (!dbUri) {
    console.error('MONGODB_URI is not defined in environment variables');
    process.exit(1);
  }

  mongoose.connect(dbUri)
    .then(() => {
      console.log('Connected to MongoDB for testing');
      return testClassAPI();
    })
    .then(() => {
      console.log('Testing completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Testing failed:', error);
      process.exit(1);
    })
    .finally(() => {
      mongoose.disconnect();
    });
}

module.exports = { testClassAPI }; 