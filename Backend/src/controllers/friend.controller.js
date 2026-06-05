import User from "../models/user.model.js";
import FriendRequest from "../models/friendRequest.model.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

export const searchUserById = async (req, res) => {
  try {
    const { userId } = req.params;
    const numericId = Number(userId);

    if (!numericId || numericId <= 0) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    if (numericId === req.user.userId) {
      return res.status(400).json({ message: "You cannot add yourself" });
    }

    const user = await User.findOne({ userId: numericId }).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isFriend = req.user.friends.some((id) => id.toString() === user._id.toString());
    if (isFriend) {
      return res.status(400).json({ message: "Already friends with this user" });
    }

    const existingRequest = await FriendRequest.findOne({
      $or: [
        { sender: req.user._id, receiver: user._id, status: "pending" },
        { sender: user._id, receiver: req.user._id, status: "pending" },
      ],
    });

    res.status(200).json({
      user,
      requestStatus: existingRequest
        ? existingRequest.sender.toString() === req.user._id.toString()
          ? "sent"
          : "received"
        : null,
      requestId: existingRequest?._id || null,
    });
  } catch (error) {
    console.log("Error in searchUserById:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const sendFriendRequest = async (req, res) => {
  try {
    const { userId } = req.body;
    const numericId = Number(userId);

    if (!numericId || numericId <= 0) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    if (numericId === req.user.userId) {
      return res.status(400).json({ message: "You cannot add yourself" });
    }

    const receiver = await User.findOne({ userId: numericId });
    if (!receiver) {
      return res.status(404).json({ message: "User not found" });
    }

    const isFriend = req.user.friends.some((id) => id.toString() === receiver._id.toString());
    if (isFriend) {
      return res.status(400).json({ message: "Already friends with this user" });
    }

    const existingRequest = await FriendRequest.findOne({
      $or: [
        { sender: req.user._id, receiver: receiver._id },
        { sender: receiver._id, receiver: req.user._id },
      ],
      status: "pending",
    });

    if (existingRequest) {
      return res.status(400).json({ message: "Friend request already pending" });
    }

    const friendRequest = await FriendRequest.create({
      sender: req.user._id,
      receiver: receiver._id,
    });

    const receiverSocketId = getReceiverSocketId(receiver._id);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newFriendRequest");
    }

    res.status(201).json(friendRequest);
  } catch (error) {
    console.log("Error in sendFriendRequest:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getPendingRequests = async (req, res) => {
  try {
    const requests = await FriendRequest.find({
      receiver: req.user._id,
      status: "pending",
    })
      .populate("sender", "-password")
      .sort({ createdAt: -1 });

    res.status(200).json(requests);
  } catch (error) {
    console.log("Error in getPendingRequests:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const acceptFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.params;

    const friendRequest = await FriendRequest.findOne({
      _id: requestId,
      receiver: req.user._id,
      status: "pending",
    });

    if (!friendRequest) {
      return res.status(404).json({ message: "Friend request not found" });
    }

    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { friends: friendRequest.sender },
    });
    await User.findByIdAndUpdate(friendRequest.sender, {
      $addToSet: { friends: req.user._id },
    });

    friendRequest.status = "accepted";
    await friendRequest.save();

    const sender = await User.findById(friendRequest.sender).select("-password");
    const receiver = await User.findById(req.user._id).select("-password");

    const senderSocketId = getReceiverSocketId(friendRequest.sender);
    const receiverSocketId = getReceiverSocketId(req.user._id);

    if (senderSocketId) {
      io.to(senderSocketId).emit("friendRequestAccepted", { friend: receiver });
    }
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("friendRequestAccepted", { friend: sender });
    }

    res.status(200).json({ message: "Friend request accepted", friend: sender });
  } catch (error) {
    console.log("Error in acceptFriendRequest:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const rejectFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.params;

    const friendRequest = await FriendRequest.findOne({
      _id: requestId,
      receiver: req.user._id,
      status: "pending",
    });

    if (!friendRequest) {
      return res.status(404).json({ message: "Friend request not found" });
    }

    friendRequest.status = "rejected";
    await friendRequest.save();

    res.status(200).json({ message: "Friend request rejected" });
  } catch (error) {
    console.log("Error in rejectFriendRequest:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getFriends = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("friends", "-password");
    res.status(200).json(user.friends);
  } catch (error) {
    console.log("Error in getFriends:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
