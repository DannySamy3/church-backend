module.exports = {
  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async up(db, client) {
    // Add a 'migrated' field to all users
    await db.collection("users").updateMany({}, { $set: { migrated: true } });
  },

  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async down(db, client) {
    // Remove the 'migrated' field from all users
    await db.collection("users").updateMany({}, { $unset: { migrated: "" } });
  },
};
