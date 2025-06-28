const mongoose = require("mongoose");
require("../dist/models/User"); // Import the compiled User model

async function fixEmailIndex() {
  try {
    // Connect to your MongoDB database using the same connection string as your app
    const mongoUri =
      process.env.MONGODB_URI ||
      "mongodb://admin:secret@13.51.178.67:27018/ubh-db?authSource=admin";
    await mongoose.connect(mongoUri);

    console.log("Connected to MongoDB at:", mongoUri);

    // Get all indexes
    const indexes = await mongoose.connection.db.collection("users").indexes();
    console.log("\nAll indexes on users collection:");
    indexes.forEach((index, i) => {
      console.log(`${i + 1}. Name: ${index.name}`);
      console.log(`   Key:`, index.key);
      console.log(`   Unique: ${index.unique || false}`);
      console.log("---");
    });

    // Check if email_1 index exists
    const emailIndex = indexes.find((idx) => idx.name === "email_1");
    if (emailIndex) {
      console.log("\nFound email_1 index. Attempting to drop it...");
      try {
        await mongoose.connection.db.collection("users").dropIndex("email_1");
        console.log("✅ Email index dropped successfully");

        // Verify it's gone
        const updatedIndexes = await mongoose.connection.db
          .collection("users")
          .indexes();
        const stillExists = updatedIndexes.find(
          (idx) => idx.name === "email_1"
        );
        if (!stillExists) {
          console.log("✅ Verified: email_1 index no longer exists");
        } else {
          console.log(
            "❌ Warning: email_1 index still exists after drop attempt"
          );
        }
      } catch (dropError) {
        console.error("❌ Error dropping email index:", dropError.message);

        // Try alternative approach - drop by key
        if (dropError.code === 26) {
          console.log("Trying to drop by key instead...");
          try {
            await mongoose.connection.db
              .collection("users")
              .dropIndex({ email: 1 });
            console.log("✅ Email index dropped by key successfully");
          } catch (keyError) {
            console.error("❌ Error dropping by key:", keyError.message);
          }
        }
      }
    } else {
      console.log("\n✅ email_1 index does not exist");
    }

    // Test creating a user with null email to see if the error persists
    console.log("\nTesting user creation with null email...");
    try {
      const User = mongoose.models.User;
      const testUser = new User({
        firstName: "Test",
        lastName: "User",
        phoneNumber: "1234567890",
        role: "REGULAR",
        organization: "Test Org",
        member: true,
        gender: "male",
        email: null,
      });

      await testUser.save();
      console.log("✅ Successfully created test user with null email");

      // Clean up - delete the test user
      await User.deleteOne({ _id: testUser._id });
      console.log("✅ Test user cleaned up");
    } catch (testError) {
      console.error("❌ Error creating test user:", testError.message);
      if (testError.code === 11000) {
        console.log("This confirms the email index issue still exists");
      }
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await mongoose.disconnect();
    console.log("\nDisconnected from MongoDB");
  }
}

fixEmailIndex();
