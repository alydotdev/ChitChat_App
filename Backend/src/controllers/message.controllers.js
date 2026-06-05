import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import {v2 as cloudinary} from 'cloudinary'
import { getReceiverSocketId , io} from "../lib/socket.js";
import { formatMessage, markConversationAsRead } from "../lib/messageStatus.js";

export const getUserForSidebar= async(req,res)=>{
    try{
        const myId = req.user._id;
        const user = await User.findById(myId).populate("friends", "-password");

        const conversations = await Promise.all(
          user.friends.map(async (friend) => {
            const lastMessage = await Message.findOne({
              $or: [
                { senderId: myId, receiverId: friend._id },
                { senderId: friend._id, receiverId: myId },
              ],
            })
              .sort({ createdAt: -1 })
              .lean();

            const unreadCount = await Message.countDocuments({
              senderId: friend._id,
              receiverId: myId,
              $or: [
                { status: { $in: ["sent", "delivered"] } },
                { status: { $exists: false }, read: false },
              ],
            });

            return {
              ...friend.toObject(),
              lastMessage: lastMessage
                ? {
                    text: lastMessage.text,
                    image: lastMessage.image,
                    createdAt: lastMessage.createdAt,
                    senderId: lastMessage.senderId.toString(),
                  }
                : null,
              unreadCount,
            };
          })
        );

        conversations.sort((a, b) => {
          const aTime = a.lastMessage?.createdAt ? new Date(a.lastMessage.createdAt).getTime() : 0;
          const bTime = b.lastMessage?.createdAt ? new Date(b.lastMessage.createdAt).getTime() : 0;
          return bTime - aTime;
        });

        res.status(200).json(conversations);

    }catch(error){
        console.error("Error in getUsersforSdiebar", error.message);
        res.status(500).json({error: "Internal server error"});
    }


}

export const markMessagesAsRead = async (req, res) => {
  try {
    const { id: senderId } = req.params;
    const myId = req.user._id;

    await markConversationAsRead(senderId, myId);

    res.status(200).json({ success: true });
  } catch (error) {
    console.log("Error in markMessagesAsRead:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMessages = async(req, res)=>{
    
    try{
        const {id:userToChatId} =req.params
        const myId = req.user._id;
         const messages = await Message.find({
         $or: [
          { senderId: myId, receiverId: userToChatId },
          { senderId: userToChatId, receiverId: myId },
      ],
    }).sort({ createdAt: 1 });

    res.status(200).json(messages.map((msg) => formatMessage(msg)));


    }catch(error){
         console.log("Error in getMessages controller: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }


}

export const sendMessage= async(req,res)=>{
     try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    let imageUrl;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
      status: "sent",
    });

    await newMessage.save();

    const messagePayload = formatMessage(newMessage);

    const receiverSocketId = getReceiverSocketId(receiverId);

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", messagePayload);
    }

     res.status(201).json(messagePayload);
   }catch(error){
      console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
   }
}
