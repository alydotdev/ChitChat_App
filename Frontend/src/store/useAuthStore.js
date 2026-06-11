
import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
import { useChatStore } from "./useChatStore.js";
import { useFriendStore } from "./useFriendStore.js";
import { normalizeId } from "../lib/utils.js";

const BASE_URL = import.meta.env.MODE === "development" 
  ? "http://16.170.218.202:5000" 
  : (import.meta.env.SOCKET_API_URL || "https://chitchat-backend.duckdns.org");

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");

      set({ authUser: res.data });
      get().connectSocket();
    } catch (error) {
      console.log("Error in checkAuth:", error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      set({ authUser: res.data });
      toast.success("Account created successfully");
      get().connectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data });
      toast.success("Logged in successfully");

      get().connectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      toast.success("Logged out successfully");
      get().disconnectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      set({ authUser: res.data });
      toast.success("Profile updated successfully");
    } catch (error) {
      console.log("error in update profile:", error);
      toast.error(error.response.data.message);
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  connectSocket: () => {
    const { authUser } = get();
    if (!authUser) return;

    const existingSocket = get().socket;
    if (existingSocket?.connected) return;

    const socket =
      existingSocket ||
      io(BASE_URL, {
        query: { userId: authUser._id },
        withCredentials: true,
        transports: ["websocket", "polling"],
      });

    if (!existingSocket) {
      socket.on("getOnlineUsers", (userIds) => {
        set({ onlineUsers: userIds });
      });

      socket.on("newMessage", (newMessage) => {
        const authUserId = get().authUser?._id;
        if (!authUserId) return;

        const isReceiver = normalizeId(newMessage.receiverId) === normalizeId(authUserId);
        if (isReceiver && (!newMessage.status || newMessage.status === "sent")) {
          socket.emit("messageDelivered", { messageId: newMessage._id });
        }

        useChatStore.getState().handleIncomingMessage(newMessage, authUserId);
      });

      socket.on("messageStatusUpdate", ({ messageId, status }) => {
        useChatStore.getState().updateMessageStatus(messageId, status);
      });

      socket.on("newFriendRequest", () => {
        useFriendStore.getState().getPendingRequests();
      });

      socket.on("friendRequestAccepted", () => {
        useChatStore.getState().getUsers();
        useFriendStore.getState().getPendingRequests();
      });

      socket.on("friendRemoved", ({ userId }) => {
        const chatStore = useChatStore.getState();
        const removedId = userId?.toString?.() ?? userId;

        if (chatStore.selectedUser?._id?.toString() === removedId) {
          chatStore.setSelectedUser(null);
          useChatStore.setState({ messages: [] });
        }

        useChatStore.setState({
          users: chatStore.users.filter((user) => user._id?.toString() !== removedId),
        });
      });

      socket.on("userTyping", ({ senderId }) => {
        useChatStore.getState().setUserTyping(senderId, true);
      });

      socket.on("userStopTyping", ({ senderId }) => {
        useChatStore.getState().setUserTyping(senderId, false);
      });

      set({ socket });
    }

    socket.connect();
  },

  emitTyping: (receiverId) => {
    get().socket?.emit("typing", { receiverId });
  },

  emitStopTyping: (receiverId) => {
    get().socket?.emit("stopTyping", { receiverId });
  },
  disconnectSocket: () => {
    const socket = get().socket;
    if (socket) {
      socket.disconnect();
      socket.removeAllListeners();
      set({ socket: null, onlineUsers: [] });
    }
  },
}));
