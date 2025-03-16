import mongoose from "mongoose";
import { UserModal } from "../model/UserSchema.js";
import bcrypt from "bcrypt";
import { generateToken } from "../util/auth.js";

// Register Controller
export const registerUser = async (req, res) => {
  try {
    const { email, password, userName } = req.body;

    // Validate required fields
    if (!email || !password || !userName) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const dbName = email.split("@")[0];

    // Check if user already exists

    const UserDb = await UserModal();

    const existingUser = await UserDb.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // const dbList = await mongoose.connection.db.admin().listDatabases();
    // const dbExists = dbList.databases.some((db) => db.name === dbName);

    // if (dbExists) {
    //   return res
    //     .status(400)
    //     .json({
    //       message: "Database name already taken. Use a different email.",
    //     });
    // }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user in main database with database name
    const newUser = new UserDb({
      email,
      password: hashedPassword,
      userName,
      databaseName: dbName, // Save the user's database name
    });

    await newUser.save();

    // Create a separate database for the user
    // const userDB = mongoose.connection.useDb(dbName);
    // await userDB.createCollection("user_data");

    // Create a separate database for the user
    // const dbName = `user_${newUser._id}`;
    // const userDB = mongoose.connection.useDb(dbName);

    // Example: Create a collection in the user's database
    // await userDB.createCollection('user_data');

    res
      .status(201)
      .json({ message: "User registered successfully", user: newUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// 2. login Controller  ===
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const UserDb = await UserModal();

    const user = await UserDb.findOne({ email });

    // const messageDb = await MessageModal("email");

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate JWT token with userId and databaseName
    const token = await generateToken({
      userId: user._id.toString(),
      email: user.email,
      dbName: user.databaseName, // Include database name
    });

    console.log("Setting cookie...");
    res.cookie(process.env.TOKEN_NAME, token, {
      secure: process.env.NODE_ENV === "production",
      domain:
        process.env.NODE_ENV === "production" ? ".myCloud.com" : "localhost",
      maxAge: 30 * 24 * 60 * 60 * 1000,
      sameSite: "Strict",
      path: "/",
    });
    console.log("Cookie set:", token);

    res.setHeader("Authorization", `Bearer ${token}`);

    return res.status(200).json({
      message: "Login successful",
      token,
      user: user,
      // databaseName: user.databaseName, // Return database name in response
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

//  get current user
export const getCurrentUser = async (req, res) => {
  try {
    const ReqUser = req.user;
    const dbName = req.dbName;

    const UserDb = await UserModal();

    if (!ReqUser) {
      return res
        .status(401)
        .json({ success: false, message: "User not found." });
    }

    const user = await UserDb.findOne({ _id: req.user });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User fetched successfully",
      user,
      // databaseName: dbName, // Return database name in response
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Server error" });
  }
};
