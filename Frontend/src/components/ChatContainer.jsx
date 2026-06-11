import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef, useState } from "react";

import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import ImageLightbox from "./ImageLightbox";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime, normalizeId } from "../lib/utils";
import MessageStatus from "./MessageStatus";
import { useVisualViewport } from "../hooks/useVisualViewport";

const ChatContainer = () => {
  const { messages, getMessages, isMessagesLoading, selectedUser } = useChatStore();
  const { authUser, socket } = useAuthStore();
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const [lightboxImage, setLightboxImage] = useState(null);
  const { height: viewportHeight, offsetTop: viewportOffsetTop } = useVisualViewport();
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  useEffect(() => {
    getMessages(selectedUser._id, authUser?._id, socket);
  }, [selectedUser._id, getMessages, authUser?._id, socket]);

  const scrollToBottom = (behavior = "smooth") => {
    const container = messagesContainerRef.current;
    if (!container) return;
    container.scrollTo({ top: container.scrollHeight, behavior });
  };

  useEffect(() => {
    if (messages?.length) scrollToBottom();
  }, [messages]);

  const mobileStyle =
    isMobile
      ? {
          height: viewportHeight,
          transform: viewportOffsetTop ? `translateY(${viewportOffsetTop}px)` : undefined,
        }
      : undefined;

  if (isMessagesLoading) {
    return (
      <div
        className="flex-1 flex flex-col min-h-0 h-full w-full overflow-hidden bg-base-100"
        style={mobileStyle}
      >
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput onInputFocus={() => scrollToBottom("auto")} />
      </div>
    );
  }

  return (
    <div
      className="flex-1 flex flex-col min-h-0 h-full w-full overflow-hidden bg-base-100"
      style={mobileStyle}
    >
      <ChatHeader />

      <div
        ref={messagesContainerRef}
        className="chat-messages flex-1 min-h-0 overflow-y-auto p-4 space-y-4"
      >
        {messages.map((message, index) => (
          <div
            key={message._id}
            className={`chat ${normalizeId(message.senderId) === normalizeId(authUser._id) ? "chat-end" : "chat-start"}`}
            ref={index === messages.length - 1 ? messagesEndRef : null}
          >
            <div className=" chat-image avatar">
              <div className="size-10 rounded-full border">
                <img
                  src={
                    normalizeId(message.senderId) === normalizeId(authUser._id)
                      ? authUser.profilePic || "/avatar.png"
                      : selectedUser.profilePic || "/avatar.png"
                  }
                  alt="profile pic"
                />
              </div>
            </div>
            <div className="chat-header mb-1 flex items-center gap-1">
              <time className="text-xs opacity-50">
                {formatMessageTime(message.createdAt)}
              </time>
              {normalizeId(message.senderId) === normalizeId(authUser._id) && (
                <MessageStatus status={message.status} />
              )}
            </div>
            <div className="chat-bubble flex flex-col max-w-[85vw] sm:max-w-md break-words">
              {message.image && (
                <img
                  src={message.image}
                  alt="Attachment"
                  className="max-w-full sm:max-w-[200px] rounded-md mb-2 cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => setLightboxImage(message.image)}
                />
              )}
              {message.text && <p className="break-words">{message.text}</p>}
              {normalizeId(message.senderId) === normalizeId(authUser._id) && message.image && !message.text && (
                <div className="flex justify-end mt-1">
                  <MessageStatus status={message.status} />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <MessageInput onInputFocus={() => scrollToBottom("auto")} />

      <ImageLightbox src={lightboxImage} onClose={() => setLightboxImage(null)} />
    </div>
  );
};
export default ChatContainer;
