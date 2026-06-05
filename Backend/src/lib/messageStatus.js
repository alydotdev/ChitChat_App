import Message from "../models/message.model.js";
import { getReceiverSocketId, io } from "./socket.js";

export const formatMessage = (message) => ({
  ...message.toObject(),
  senderId: message.senderId.toString(),
  receiverId: message.receiverId.toString(),
  status: message.status || (message.read ? "read" : "sent"),
});

export const notifySenderStatus = (senderId, messageId, status) => {
  const senderSocketId = getReceiverSocketId(senderId);
  if (senderSocketId) {
    io.to(senderSocketId).emit("messageStatusUpdate", {
      messageId: String(messageId),
      status,
    });
  }
};

export const markAsDelivered = async (messageId, receiverUserId) => {
  const message = await Message.findById(messageId);
  if (!message) return null;
  if (message.receiverId.toString() !== String(receiverUserId)) return null;

  const currentStatus = message.status || (message.read ? "read" : "sent");
  if (currentStatus === "read" || currentStatus === "delivered") return message;

  message.status = "delivered";
  message.read = false;
  await message.save();
  notifySenderStatus(message.senderId, messageId, "delivered");
  return message;
};

const unreadFilter = {
  $or: [
    { status: { $in: ["sent", "delivered"] } },
    { status: { $exists: false }, read: false },
  ],
};

export const markConversationAsRead = async (senderId, receiverId) => {
  const messages = await Message.find({
    senderId,
    receiverId,
    ...unreadFilter,
  });

  if (messages.length === 0) return [];

  await Message.updateMany(
    { senderId, receiverId, ...unreadFilter },
    { status: "read", read: true }
  );

  messages.forEach((msg) => {
    notifySenderStatus(senderId, msg._id.toString(), "read");
  });

  return messages;
};
