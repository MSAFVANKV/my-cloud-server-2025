// import { User } from "../model/UserSchema.js";
// import mongoose from "mongoose";
// import {MessageModal} from "../model/messageModal.js";
// import { existsSync, mkdirSync, renameSync } from "fs";
// import path from "path";

// export const addMessage = async (req, res, next) => {
//   try {
//     const { message, from, to } = req.body;

//     // Validate request body
//     if (!message || !from || !to) {
//       return res.status(400).json({ message: "Missing required fields" });
//     }

//     // Ensure `from` and `to` are valid ObjectIds
//     if (
//       !mongoose.Types.ObjectId.isValid(from) ||
//       !mongoose.Types.ObjectId.isValid(to)
//     ) {
//       return res.status(400).json({ message: "Invalid sender or receiver ID" });
//     }

//     // check if the use online
//     const getUser = onlineUser.get(to);
//     console.log(getUser, "getUser");

//     // Create a new message
//     const newMessage = await Message.create({
//       senderId: from,
//       receiverId: to,
//       message,
//       messageStatus: getUser ? "delivered" : "sent",
//     });

//     const populatedMessage = await Message.findById(newMessage._id);
//     // .populate("senderId", "userName email avatar") // Include sender details
//     // .populate("receiverId", "userName email avatar"); // Include receiver details

//     // Update sender & receiver message references
//     await User.findByIdAndUpdate(from, {
//       $push: { sentMessages: newMessage._id },
//     });
//     await User.findByIdAndUpdate(to, {
//       $push: { receiveMessages: newMessage._id },
//     });

//     return res.status(201).json({
//       message: "Message Created successfully",
//       data: populatedMessage,
//     });
//   } catch (error) {
//     console.error("Error sending message:", error);
//     return res.status(500).json({ message: "Internal server error" });
//   }
// };

// // 2. get messages

// export const getMessages = async (req, res, next) => {
//   try {
//     let { from, to } = req.params;

//     console.log("Received params - from:", from, "to:", to);
//     if (!from || !to) {
//       console.error("❌ Missing 'from' or 'to' in request!");
//       return res.status(400).json({ message: "Missing sender or receiver ID" });
//     }

//     if (
//       !mongoose.Types.ObjectId.isValid(from) ||
//       !mongoose.Types.ObjectId.isValid(to)
//     ) {
//       return res.status(400).json({ message: "Invalid sender or receiver ID" });
//     }

//     from = new mongoose.Types.ObjectId(from);
//     to = new mongoose.Types.ObjectId(to);

//     console.log("Converted ObjectId - from:", from, "to:", to);

//     const messages = await Message.find({
//       $or: [
//         { senderId: from, receiverId: to },
//         { senderId: to, receiverId: from },
//       ],
//     }).sort({ createdAt: 1 });

//     const unreadMessages = [];

//     messages.forEach((message, index) => {
//       console.log(message.senderId, "ll", to);

//       //   if (message.messageStatus !== "read" && message.senderId === to) {
//       //     message[index].messageStatus = "read";
//       //     unreadMessages.push(message._id);
//       //   }
//       if (message.messageStatus !== "read" && message.senderId.equals(to)) {
//         message.messageStatus = "read"; // ✅ Fix: Directly update the property
//         unreadMessages.push(message._id);
//       }
//     });

//     await Message.updateMany(
//       { _id: { $in: unreadMessages } },
//       { $set: { messageStatus: "read" } } // ✅ Use `$set` to update correctly
//     );

//     // console.log("Fetched Messages:", messages);

//     return res
//       .status(200)
//       .json({ message: "Messages fetched", data: messages });
//   } catch (error) {
//     console.error("Error fetching messages:", error);
//     return res.status(500).json({ message: "Internal server error" });
//   }
// };

// // 3. upload files to

// export const addFilesMessage = async (req, res, next) => {
//   try {
//     // console.log(req.query,'req.query');

//     if (req.file) {
//       const date = Date.now();
//       const imagesFolderPath = path.join("uploads", "images");
//       if (!existsSync(imagesFolderPath)) {
//         mkdirSync(imagesFolderPath, { recursive: true }); // Create folder if it doesn't exist
//       }
//       const fileName = path.join(
//         imagesFolderPath,
//         `${date}-${req.file.originalname}`
//       );

//       console.log("Original Path:", req.file.path);
//       console.log("New Path:", fileName);
//       // let fileName = `uploads/images`+date+req.file.originalname;
//       // console.log(req.file.path,'req.file.path');

//       renameSync(req.file.path, fileName);
//       const { from, to } = req.query;

//       if (
//         !mongoose.Types.ObjectId.isValid(from) ||
//         !mongoose.Types.ObjectId.isValid(to)
//       ) {
//         return res
//           .status(400)
//           .json({ message: "Invalid sender or receiver ID" });
//       }

//       if (from && to) {
//         const getUser = onlineUser.get(to);
//         // Create a new message
//         const newMessage = await Message.create({
//           senderId: from,
//           receiverId: to,
//           message: fileName,
//           type: "image",
//           messageStatus: getUser ? "delivered" : "sent",
//         });
//         return res
//           .status(200)
//           .json({ message: "Added new message image", file: newMessage });
//       }
//       return res.status(400).send({ message: "from and to is required" });
//     }

//     return res.status(400).send({ message: "image is required" });
//   } catch (error) {
//     console.error("Error adding message image:", error);
//     return res.status(500).json({ message: "Internal server error" });
//   }
// };


// // 3. upload audio files to

// export const addAudioMessage = async (req, res, next) => {
//   try {
//     // console.log(req.query,'req.query');

//     if (req.file) {
//       const date = Date.now();
//       const imagesFolderPath = path.join("uploads", "recordings");
//       if (!existsSync(imagesFolderPath)) {
//         mkdirSync(imagesFolderPath, { recursive: true }); // Create folder if it doesn't exist
//       }
//       const fileName = path.join(
//         imagesFolderPath,
//         `${date}-${req.file.originalname}`
//       );

//       console.log("Original Path:", req.file.path);
//       console.log("New Path:", fileName);
//       // let fileName = `uploads/images`+date+req.file.originalname;
//       // console.log(req.file.path,'req.file.path');

//       renameSync(req.file.path, fileName);
//       const { from, to } = req.query;

//       if (
//         !mongoose.Types.ObjectId.isValid(from) ||
//         !mongoose.Types.ObjectId.isValid(to)
//       ) {
//         return res
//           .status(400)
//           .json({ message: "Invalid sender or receiver ID" });
//       }

//       if (from && to) {
//         const getUser = onlineUser.get(to);
//         // Create a new message
//         const newMessage = await Message.create({
//           senderId: from,
//           receiverId: to,
//           message: fileName,
//           type: "audio",
//           messageStatus: getUser ? "delivered" : "sent",
//         });
//         return res
//           .status(200)
//           .json({ message: "Added new message audio", file: newMessage });
//       }
//       return res.status(400).send({ message: "from and to is required" });
//     }

//     return res.status(400).send({ message: "audio is required" });
//   } catch (error) {
//     console.error("Error adding message audio:", error);
//     return res.status(500).json({ message: "Internal server error" });
//   }
// };