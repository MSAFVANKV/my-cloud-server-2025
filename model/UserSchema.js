import mongoose from "mongoose";
import { getDb } from "../connection/getDbConnection.js";



const UserSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    // trim: true,
  },
  password:{
    type: String,
    required: true,
    minlength: 8,
  }
 ,
 databaseName: {
  type: String,
  required: true, // Added to store user's database name
  unique: true,   // Ensures each database name is unique
},
totalStorage: { type: Number, default: 10 * 1024 * 1024 * 1024 }, // 10GB in bytes
usedStorage: { type: Number, default: 0 },
  avatar: {
    type: String,
    default: "https://via.placeholder.com/150x150",
  },
  unread_Count: {
    type: Number,
    default: 0,
  },
  isDeleted:{
    type: Boolean,
    default: false,
  },
  last_Message_Time: {
    type: Date,
    default: null,
  },
  followers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  following: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  sentMessages: [{ type: mongoose.Schema.Types.ObjectId, ref: "Message" }], 
  receiveMessages: [{ type: mongoose.Schema.Types.ObjectId, ref: "Message" }], 

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// export const  User = mongoose.models.User ||
//   mongoose.model("User", UserSchema);

  export  const UserModal = async () => {
    const masterDb = await getDb();
    return (
      masterDb.model.User ||
      masterDb.model("User", UserSchema)
    );
  };


 
