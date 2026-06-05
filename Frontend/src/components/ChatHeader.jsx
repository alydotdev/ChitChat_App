import { ArrowLeft, X } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { isUserOnline, normalizeId } from "../lib/utils";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser, typingUsers } = useChatStore();
  const { onlineUsers } = useAuthStore();

  const isTyping = typingUsers[normalizeId(selectedUser._id)];
  const isOnline = isUserOnline(selectedUser._id, onlineUsers);

  return (
    <div className="p-2.5 border-b border-base-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => setSelectedUser(null)}
            className="btn btn-ghost btn-sm btn-circle md:hidden"
            aria-label="Back to contacts"
          >
            <ArrowLeft size={20} />
          </button>

          <div className="avatar">
            <div className="size-10 rounded-full relative">
              <img src={selectedUser.profilePic || "/avatar.png"} alt={selectedUser.fullName} />
              {isOnline && (
                <span className="absolute bottom-0 right-0 size-2.5 bg-green-500 rounded-full ring-2 ring-base-100" />
              )}
            </div>
          </div>

          <div className="min-w-0">
            <h3 className="font-medium truncate">{selectedUser.fullName}</h3>
            <p className={`text-sm ${isTyping ? "text-primary" : "text-base-content/70"}`}>
              {isTyping ? "typing..." : isOnline ? "Online" : "Offline"}
            </p>
          </div>
        </div>

        <button
          onClick={() => setSelectedUser(null)}
          className="btn btn-ghost btn-sm btn-circle hidden md:flex"
          aria-label="Close chat"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
};
export default ChatHeader;
