import { MAX_IMAGE_SIZE_BYTES, MAX_IMAGE_SIZE_MB } from "../constants/index.js";

export const validateImageFile = (file) => {
  if (!file) return { valid: false, error: "No file selected" };
  if (!file.type.startsWith("image/")) {
    return { valid: false, error: "Please select an image file" };
  }
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return { valid: false, error: `Image must be smaller than ${MAX_IMAGE_SIZE_MB}MB` };
  }
  return { valid: true };
};

const PAK_LOCALE = "en-PK";
const PAK_TIMEZONE = "Asia/Karachi";

const getPakDayKey = (date) =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: PAK_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(date));

export const formatMessageTime = (date) => {
  return new Date(date).toLocaleTimeString(PAK_LOCALE, {
    timeZone: PAK_TIMEZONE,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

export const formatChatListTime = (date) => {
  if (!date) return "";
  const messageDate = new Date(date);
  const todayKey = getPakDayKey(new Date());
  const messageKey = getPakDayKey(messageDate);
  const yesterdayKey = getPakDayKey(new Date(Date.now() - 24 * 60 * 60 * 1000));

  if (messageKey === todayKey) return formatMessageTime(date);
  if (messageKey === yesterdayKey) return "Yesterday";
  return messageDate.toLocaleDateString(PAK_LOCALE, {
    timeZone: PAK_TIMEZONE,
    month: "short",
    day: "numeric",
  });
};

export const getMessagePreview = (lastMessage, authUserId) => {
  if (!lastMessage) return "No messages yet";

  const isMine = normalizeId(lastMessage.senderId) === normalizeId(authUserId);
  const prefix = isMine ? "You: " : "";

  if (lastMessage.image && !lastMessage.text) return `${prefix}Photo`;
  if (lastMessage.image && lastMessage.text) return `${prefix}${lastMessage.text}`;
  return `${prefix}${lastMessage.text || "Photo"}`;
};

export const normalizeId = (id) => (id?.toString ? id.toString() : String(id));

export const isUserOnline = (userId, onlineUsers) =>
  onlineUsers.some((id) => normalizeId(id) === normalizeId(userId));

const sortUsersByRecent = (users) =>
  [...users].sort((a, b) => {
    const aTime = a.lastMessage?.createdAt ? new Date(a.lastMessage.createdAt).getTime() : 0;
    const bTime = b.lastMessage?.createdAt ? new Date(b.lastMessage.createdAt).getTime() : 0;
    return bTime - aTime;
  });

export { sortUsersByRecent };
