import { useRef } from "react";
import { Loader2, MoreVertical, UserMinus, X } from "lucide-react";
import { useFriendStore } from "../store/useFriendStore";

const ChatOptionsMenu = ({ user, onCloseChat }) => {
  const modalRef = useRef(null);
  const { unfriendUser, isUnfriending } = useFriendStore();

  const openConfirm = () => {
    modalRef.current?.showModal();
  };

  const closeConfirm = () => {
    modalRef.current?.close();
  };

  const handleUnfriend = async () => {
    const success = await unfriendUser(user._id);
    if (success) {
      closeConfirm();
      onCloseChat?.();
    }
  };

  return (
    <>
      <div className="dropdown dropdown-end">
        <button
          type="button"
          tabIndex={0}
          className="btn btn-ghost btn-sm btn-circle"
          aria-label="Chat options"
        >
          <MoreVertical size={20} />
        </button>

        <ul
          tabIndex={0}
          className="dropdown-content menu bg-base-100 rounded-box z-50 w-52 p-2 shadow-lg border border-base-300 mt-1"
        >
          <li>
            <button
              type="button"
              className="text-error"
              onClick={openConfirm}
            >
              <UserMinus size={16} />
              Remove friend
            </button>
          </li>
        </ul>
      </div>

      <dialog ref={modalRef} className="modal modal-bottom sm:modal-middle">
        <div className="modal-box">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-bold text-lg">Remove friend?</h3>
              <p className="py-3 text-sm text-base-content/70">
                {user.fullName} will be removed from your contacts. You can send them a new
                friend request later using their user ID.
              </p>
            </div>
            <button
              type="button"
              className="btn btn-ghost btn-sm btn-circle shrink-0"
              onClick={closeConfirm}
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>

          <div className="modal-action mt-2">
            <button type="button" className="btn btn-ghost" onClick={closeConfirm}>
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-error"
              onClick={handleUnfriend}
              disabled={isUnfriending}
            >
              {isUnfriending ? <Loader2 className="size-4 animate-spin" /> : "Remove"}
            </button>
          </div>
        </div>

        <form method="dialog" className="modal-backdrop">
          <button type="button" onClick={closeConfirm}>
            close
          </button>
        </form>
      </dialog>
    </>
  );
};

export default ChatOptionsMenu;
