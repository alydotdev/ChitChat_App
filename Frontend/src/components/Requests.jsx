import { Check, X, UserPlus } from "lucide-react";
import { useFriendStore } from "../store/useFriendStore";

const Requests = () => {
  const { pendingRequests, isRequestsLoading, acceptRequest, rejectRequest } = useFriendStore();

  if (isRequestsLoading) {
    return (
      <div className="flex flex-col gap-3 p-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3 animate-pulse">
            <div className="size-12 rounded-full bg-base-300" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-base-300 rounded w-32" />
              <div className="h-3 bg-base-300 rounded w-20" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (pendingRequests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <UserPlus className="size-10 text-zinc-500 mb-3" />
        <p className="text-zinc-400 text-sm">No pending requests</p>
        <p className="text-zinc-500 text-xs mt-1">Friend requests you receive will appear here</p>
      </div>
    );
  }

  return (
    <div className="overflow-y-auto w-full py-2">
      {pendingRequests.map((request) => (
        <div
          key={request._id}
          className="w-full p-3 flex items-center gap-3 hover:bg-base-300 transition-colors"
        >
          <img
            src={request.sender?.profilePic || "/avatar.png"}
            alt={request.sender?.fullName}
            className="size-12 object-cover rounded-full shrink-0"
          />
          <div className="flex-1 min-w-0 text-left">
            <div className="font-medium truncate">{request.sender?.fullName}</div>
            <div className="text-xs text-zinc-400">ID: {request.sender?.userId}</div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => acceptRequest(request._id)}
              className="btn btn-circle btn-sm btn-success"
              title="Accept"
            >
              <Check size={16} />
            </button>
            <button
              onClick={() => rejectRequest(request._id)}
              className="btn btn-circle btn-sm btn-ghost text-error"
              title="Reject"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Requests;
