import mongoose from "mongoose";
import { getDb } from "../connection/getDbConnection.js";



const MessageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      default: "text",
    },
    message: {
      type: String,
      required: true,
    },
    messageStatus: {
      type: String,
      enum: ["sent", "delivered", "pending", "read"],
      default: "sent",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export  const MessageModal = async (dbName) => {
  const masterDb = await getDb(dbName);
  return (
    masterDb.model.Message ||
    masterDb.model("Message", MessageSchema)
  );
};


// const Message = mongoose.models.Message || mongoose.model("Message", MessageSchema);
// export default Message;


// export const Message =
//   mongoose.models.Message || mongoose.model<IMessage>("Message", MessageSchema);
