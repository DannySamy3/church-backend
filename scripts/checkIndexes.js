const mongoose = require("mongoose");

async function checkIndexes() {
  try {
    // Connect to your MongoDB database
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/ubh-db"
    );

    console.log("Connected to MongoDB");

    // Get all indexes
    const indexes = await mongoose.connection.db.collection("users").indexes();
    console.log("All indexes on users collection:");
    indexes.forEach((index, i) => {
      console.log(`${i + 1}. Name: ${index.name}`);
      console.log(`   Key:`, index.key);
      console.log(`   Unique: ${index.unique || false}`);
      console.log("---");
    });

    // Check if email_1 index still exists
    const emailIndex = indexes.find((idx) => idx.name === "email_1");
    if (emailIndex) {
      console.log("WARNING: email_1 index still exists!");
      console.log("Attempting to drop it again...");

      try {
        await mongoose.connection.db.collection("users").dropIndex("email_1");
        console.log("Email index dropped successfully");
      } catch (dropError) {
        console.error("Error dropping email index:", dropError.message);
      }
    } else {
      console.log("email_1 index does not exist");
    }
  } catch (error) {
    console.error("Error checking indexes:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

checkIndexes();
