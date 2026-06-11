import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useChatStore } from "./useChatStore";

export const useFriendStore = create((set, get) => ({
  pendingRequests: [],
  searchedUser: null,
  searchStatus: null,
  searchRequestId: null,
  isSearching: false,
  isRequestsLoading: false,
  isSendingRequest: false,
  isUnfriending: false,

  getPendingRequests: async () => {
    set({ isRequestsLoading: true });
    try {
      const res = await axiosInstance.get("/friends/requests");
      set({ pendingRequests: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load requests");
    } finally {
      set({ isRequestsLoading: false });
    }
  },

  searchUserById: async (userId) => {
    if (!userId?.trim()) {
      toast.error("Please enter a user ID");
      return;
    }
    set({ isSearching: true, searchedUser: null, searchStatus: null });
    try {
      const res = await axiosInstance.get(`/friends/search/${userId.trim()}`);
      set({
        searchedUser: res.data.user,
        searchStatus: res.data.requestStatus,
        searchRequestId: res.data.requestId,
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "User not found");
      set({ searchedUser: null, searchStatus: null, searchRequestId: null });
    } finally {
      set({ isSearching: false });
    }
  },

  sendFriendRequest: async (userId) => {
    set({ isSendingRequest: true });
    try {
      await axiosInstance.post("/friends/request", { userId: Number(userId) });
      toast.success("Friend request sent");
      set({ searchStatus: "sent" });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send request");
    } finally {
      set({ isSendingRequest: false });
    }
  },

  acceptRequest: async (requestId) => {
    try {
      const res = await axiosInstance.post(`/friends/accept/${requestId}`);
      set({ pendingRequests: get().pendingRequests.filter((r) => r._id !== requestId) });
      toast.success("Friend request accepted");
      useChatStore.getState().getUsers();
      return res.data.friend;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to accept request");
    }
  },

  rejectRequest: async (requestId) => {
    try {
      await axiosInstance.post(`/friends/reject/${requestId}`);
      set({ pendingRequests: get().pendingRequests.filter((r) => r._id !== requestId) });
      toast.success("Friend request rejected");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reject request");
    }
  },

  unfriendUser: async (friendId) => {
    set({ isUnfriending: true });
    try {
      await axiosInstance.delete(`/friends/${friendId}`);
      const chatStore = useChatStore.getState();
      const removedId = friendId?.toString?.() ?? friendId;

      chatStore.setSelectedUser(null);
      useChatStore.setState({
        users: chatStore.users.filter((user) => user._id?.toString() !== removedId),
        messages: [],
      });

      toast.success("Friend removed");
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to remove friend");
      return false;
    } finally {
      set({ isUnfriending: false });
    }
  },

  clearSearch: () => set({ searchedUser: null, searchStatus: null, searchRequestId: null }),
}));
