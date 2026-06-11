import React, { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useFriendStore } from "../store/useFriendStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Users, UserPlus, Bell, Search } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import AddFriend from "./AddFriend";
import Requests from "./Requests";
import { formatChatListTime, getMessagePreview, isUserOnline } from "../lib/utils";

const Sidebar = () => {
  const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading } = useChatStore();
  const { getPendingRequests, pendingRequests } = useFriendStore();
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("contacts");
  const { onlineUsers, authUser } = useAuthStore();

  useEffect(() => {
    getUsers();
    getPendingRequests();
  }, [getUsers, getPendingRequests]);

  const onlineFriendsCount = (users || []).filter((user) =>
    isUserOnline(user._id, onlineUsers)
  ).length;

  const filteredUsers = (users || [])
    .filter((user) => !showOnlineOnly || isUserOnline(user._id, onlineUsers))
    .filter((user) =>
      user.fullName?.toLowerCase().includes(searchQuery.toLowerCase().trim())
    );

  const tabs = [
    { id: "contacts", label: "Contacts", icon: Users },
    { id: "add", label: "Add", icon: UserPlus },
    { id: "requests", label: "Requests", icon: Bell, badge: pendingRequests.length },
  ];

  if (isUsersLoading && activeTab === "contacts") return <SidebarSkeleton />;

  return (
    <aside className="h-full min-h-0 w-full md:w-80 border-r border-base-300 flex flex-col overflow-hidden transition-all duration-200">
      <div className="border-b border-base-300 w-full">
        <div className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-3 px-2 text-sm font-medium transition-colors relative
                ${activeTab === tab.id ? "text-primary border-b-2 border-primary" : "text-zinc-400 hover:text-zinc-200"}`}
            >
              <tab.icon className="size-4" />
              <span className="hidden sm:inline">{tab.label}</span>
              {tab.badge > 0 && (
                <span className="absolute top-1.5 right-1 sm:right-3 size-4 bg-error text-error-content text-[10px] rounded-full flex items-center justify-center">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "contacts" && (
        <>
          <div className="px-3 pt-3">
            <label className="input input-bordered input-sm flex items-center gap-2 w-full">
              <Search className="size-4 text-zinc-400 shrink-0" />
              <input
                type="text"
                placeholder="Search friends..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="grow min-w-0"
              />
            </label>
          </div>

          <div className="border-b border-base-300 w-full px-4 py-3">
            <div className="flex items-center gap-2">
              <label className="cursor-pointer flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showOnlineOnly}
                  onChange={(e) => setShowOnlineOnly(e.target.checked)}
                  className="checkbox checkbox-sm"
                />
                <span className="text-sm">Online only</span>
              </label>
              <span className="text-xs text-zinc-500 ml-auto">
                {onlineFriendsCount} online
              </span>
            </div>
          </div>

          <div className="chat-messages overflow-y-auto w-full py-1 flex-1 min-h-0">
            {filteredUsers.map((user) =>
              user?._id ? (
                <button
                  key={user._id}
                  onClick={() => setSelectedUser(user)}
                  className={`
                    w-full px-3 py-3 flex items-center gap-3
                    hover:bg-base-300 transition-colors
                    ${selectedUser?._id === user._id ? "bg-base-300" : ""}
                    ${user.unreadCount > 0 ? "bg-base-300/40" : ""}
                  `}
                >
                  <div className="relative shrink-0">
                    <img
                      src={user.profilePic || "/avatar.png"}
                      alt={user.fullName}
                      className="size-12 object-cover rounded-full"
                    />
                    {isUserOnline(user._id, onlineUsers) && (
                      <span className="absolute bottom-0 right-0 size-3 bg-green-500 rounded-full ring-2 ring-zinc-900" />
                    )}
                  </div>

                  <div className="text-left min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`truncate ${user.unreadCount > 0 ? "font-semibold" : "font-medium"}`}
                      >
                        {user.fullName}
                      </span>
                      {user.lastMessage?.createdAt && (
                        <span
                          className={`text-xs shrink-0 ${user.unreadCount > 0 ? "text-primary font-medium" : "text-zinc-500"}`}
                        >
                          {formatChatListTime(user.lastMessage.createdAt)}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-2 mt-0.5">
                      <p
                        className={`text-sm truncate ${
                          user.unreadCount > 0 ? "text-base-content font-medium" : "text-zinc-400"
                        }`}
                      >
                        {getMessagePreview(user.lastMessage, authUser?._id)}
                      </p>
                      {user.unreadCount > 0 && (
                        <span className="size-2.5 bg-primary rounded-full shrink-0" />
                      )}
                    </div>
                  </div>
                </button>
              ) : null
            )}

            {filteredUsers.length === 0 && (
              <div className="text-center text-zinc-500 py-8 px-4">
                <Users className="size-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">
                  {searchQuery ? "No friends match your search" : "No friends yet"}
                </p>
                <p className="text-xs mt-1">
                  {searchQuery ? "Try a different name" : "Add friends using their unique ID"}
                </p>
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === "add" && <AddFriend />}
      {activeTab === "requests" && <Requests />}
    </aside>
  );
};

export default Sidebar;
