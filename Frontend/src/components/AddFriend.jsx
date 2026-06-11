import { useState } from "react";
import { Search, UserPlus, Clock } from "lucide-react";
import { useFriendStore } from "../store/useFriendStore";

const AddFriend = () => {
  const [userIdInput, setUserIdInput] = useState("");
  const {
    searchedUser,
    searchStatus,
    isSearching,
    isSendingRequest,
    searchUserById,
    sendFriendRequest,
    clearSearch,
  } = useFriendStore();

  const handleSearch = (e) => {
    e.preventDefault();
    searchUserById(userIdInput);
  };

  const handleSendRequest = () => {
    if (searchedUser?.userId) {
      sendFriendRequest(searchedUser.userId);
    }
  };

  return (
    <div className="flex flex-col h-full min-h-0 overflow-hidden">
      <div className="p-4 border-b border-base-300">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="number"
            placeholder="Enter user ID..."
            value={userIdInput}
            onChange={(e) => {
              setUserIdInput(e.target.value);
              if (!e.target.value) clearSearch();
            }}
            className="input input-bordered input-sm flex-1"
          />
          <button
            type="submit"
            className="btn btn-sm btn-primary"
            disabled={isSearching || !userIdInput.trim()}
          >
            <Search size={16} />
          </button>
        </form>
        <p className="text-xs text-zinc-500 mt-2">Search by unique ID to send a friend request</p>
      </div>

      <div className="chat-messages flex-1 min-h-0 overflow-y-auto p-4">
        {isSearching && (
          <div className="flex justify-center py-8">
            <span className="loading loading-spinner loading-md" />
          </div>
        )}

        {searchedUser && !isSearching && (
          <div className="bg-base-300 rounded-xl p-4 space-y-4">
            <div className="flex items-center gap-3">
              <img
                src={searchedUser.profilePic || "/avatar.png"}
                alt={searchedUser.fullName}
                className="size-14 object-cover rounded-full"
              />
              <div>
                <div className="font-medium">{searchedUser.fullName}</div>
                <div className="text-sm text-zinc-400">ID: {searchedUser.userId}</div>
              </div>
            </div>

            {searchStatus === "sent" ? (
              <div className="flex items-center gap-2 text-sm text-warning justify-center py-2">
                <Clock size={16} />
                Request pending
              </div>
            ) : searchStatus === "received" ? (
              <div className="flex items-center gap-2 text-sm text-info justify-center py-2">
                <UserPlus size={16} />
                This user sent you a request — check Requests tab
              </div>
            ) : (
              <button
                onClick={handleSendRequest}
                className="btn btn-primary btn-sm w-full"
                disabled={isSendingRequest}
              >
                {isSendingRequest ? (
                  <span className="loading loading-spinner loading-sm" />
                ) : (
                  <>
                    <UserPlus size={16} />
                    Send Friend Request
                  </>
                )}
              </button>
            )}
          </div>
        )}

        {!searchedUser && !isSearching && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Search className="size-10 text-zinc-500 mb-3" />
            <p className="text-zinc-400 text-sm">Search for a user by their ID</p>
            <p className="text-zinc-500 text-xs mt-1">Your ID is shown in your Profile tab</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddFriend;
