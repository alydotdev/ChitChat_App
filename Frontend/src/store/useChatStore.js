import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { getMessagePreview, normalizeId, sortUsersByRecent } from "../lib/utils";

const applyPendingStatus = (message, pendingStatusUpdates) => {
  const id = normalizeId(message._id);
  const pending = pendingStatusUpdates[id];
  return pending ? { ...message, status: pending } : message;
};

const isCurrentChat = (selectedUser, newMessage, authUserId) => {
  if (!selectedUser || !authUserId) return false;
  const senderId = normalizeId(newMessage.senderId);
  const receiverId = normalizeId(newMessage.receiverId);
  const selectedId = normalizeId(selectedUser._id);
  const myId = normalizeId(authUserId);

  return (
    (senderId === selectedId && receiverId === myId) ||
    (senderId === myId && receiverId === selectedId)
  );
};

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  typingUsers: {},
  pendingStatusUpdates: {},

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load contacts");
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId, authUserId, socket) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      const { pendingStatusUpdates } = get();
      set({
        messages: res.data.map((msg) => applyPendingStatus(msg, pendingStatusUpdates)),
      });

      if (authUserId && socket) {
        res.data.forEach((msg) => {
          const isReceived = normalizeId(msg.receiverId) === normalizeId(authUserId);
          const isSentOnly = !msg.status || msg.status === "sent";
          if (isReceived && isSentOnly) {
            socket.emit("messageDelivered", { messageId: msg._id });
          }
        });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load messages");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  updateMessageStatus: (messageId, status) => {
    const id = normalizeId(messageId);
    const { messages, pendingStatusUpdates } = get();
    const exists = messages.some((msg) => normalizeId(msg._id) === id);

    if (!exists) {
      set({
        pendingStatusUpdates: { ...pendingStatusUpdates, [id]: status },
      });
      return;
    }

    const updatedPending = { ...pendingStatusUpdates };
    delete updatedPending[id];

    set({
      messages: messages.map((msg) =>
        normalizeId(msg._id) === id ? { ...msg, status } : msg
      ),
      pendingStatusUpdates: updatedPending,
    });
  },

  markAsRead: async (userId) => {
    try {
      await axiosInstance.put(`/messages/read/${userId}`);
      set({
        users: get().users.map((user) =>
          normalizeId(user._id) === normalizeId(userId) ? { ...user, unreadCount: 0 } : user
        ),
      });
    } catch (error) {
      console.log("Failed to mark messages as read:", error);
    }
  },

  updateConversationPreview: (newMessage, authUserId) => {
    const { users, selectedUser } = get();
    const senderId = normalizeId(newMessage.senderId);
    const receiverId = normalizeId(newMessage.receiverId);
    const myId = normalizeId(authUserId);
    const friendId = senderId === myId ? receiverId : senderId;
    const isIncoming = senderId !== myId;
    const chatIsOpen = isCurrentChat(selectedUser, newMessage, authUserId);

    const updatedUsers = users.map((user) => {
      if (normalizeId(user._id) !== friendId) return user;

      return {
        ...user,
        lastMessage: {
          text: newMessage.text,
          image: newMessage.image,
          createdAt: newMessage.createdAt,
          senderId: newMessage.senderId,
        },
        unreadCount:
          isIncoming && !chatIsOpen ? (user.unreadCount || 0) + 1 : user.unreadCount || 0,
      };
    });

    set({ users: sortUsersByRecent(updatedUsers) });

    if (isIncoming && !chatIsOpen) {
      const friend = updatedUsers.find((u) => normalizeId(u._id) === friendId);
      toast(`${friend?.fullName || "Friend"}: ${getMessagePreview(
        { text: newMessage.text, image: newMessage.image, senderId: newMessage.senderId },
        authUserId
      ).replace(/^You: /, "")}`);
    }
  },

  setUserTyping: (userId, isTyping) => {
    const key = normalizeId(userId);
    set({
      typingUsers: { ...get().typingUsers, [key]: isTyping },
    });
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages, pendingStatusUpdates } = get();
    try {
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
      const messageToAdd = applyPendingStatus(res.data, pendingStatusUpdates);
      const exists = messages.some((m) => normalizeId(m._id) === normalizeId(messageToAdd._id));

      if (!exists) {
        set({ messages: [...messages, messageToAdd] });
      } else {
        get().updateMessageStatus(messageToAdd._id, messageToAdd.status);
      }

      const authUserId = res.data.senderId;
      get().updateConversationPreview(res.data, authUserId);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send message");
    }
  },

  handleIncomingMessage: (newMessage, authUserId) => {
    const { selectedUser, messages, pendingStatusUpdates } = get();
    const chatIsOpen = isCurrentChat(selectedUser, newMessage, authUserId);

    get().updateConversationPreview(newMessage, authUserId);

    if (!authUserId) return;

    if (!chatIsOpen) return;

    const messageToAdd = applyPendingStatus(newMessage, pendingStatusUpdates);
    if (messages.some((m) => normalizeId(m._id) === normalizeId(messageToAdd._id))) {
      get().updateMessageStatus(messageToAdd._id, messageToAdd.status);
      return;
    }

    set({ messages: [...messages, messageToAdd] });

    if (normalizeId(newMessage.receiverId) === normalizeId(authUserId) && selectedUser) {
      get().markAsRead(selectedUser._id);
    }
  },

  setSelectedUser: (selectedUser) => {
    set({ selectedUser });
    if (selectedUser) {
      get().markAsRead(selectedUser._id);
    }
  },
}));
