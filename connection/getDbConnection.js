// utils/getDbConnection.js
import mongoose from 'mongoose';

const connections = new Map();

const mongoOptions = {
  autoIndex: false,
  connectTimeoutMS: 10000,
  socketTimeoutMS: 30000,
  serverSelectionTimeoutMS: 5000,
};

/**
 * Returns a Mongoose connection for the specified database.
 * If a connection already exists for that database, it reuses it.
 * Otherwise, it creates a new connection using the dynamic database name.
 *
 * @param {string} [dbName=process.env.DB_NAME] - The name of the database.
 * @returns {Promise<mongoose.Connection>} - A promise that resolves to the Mongoose connection.
 */
export const getDb = async (dbName = process.env.BASE_DB) => {
  if (connections.has(dbName)) {
    return connections.get(dbName);
  }

  // Ensure the connection string is properly formatted.
  const connectionString = `${process.env.MONGODB_URI}${dbName}`;

  // Use createConnection to obtain a dedicated connection instance.
  const db = mongoose.createConnection(connectionString, mongoOptions);

  // Attach event listeners
  db.on('connected', () => console.log(`✅ Connected to DB: ${dbName}`));
  db.on('error', (err) =>
    console.error(`❌ MongoDB Connection Error for ${dbName}:`, err)
  );

  // Wait for the connection to be established.
  await new Promise((resolve, reject) => {
    db.once('open', resolve);
    db.once('error', reject);
  });

  connections.set(dbName, db);
  return db;
};
