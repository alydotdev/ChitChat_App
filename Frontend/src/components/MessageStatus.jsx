import { Check, CheckCheck } from "lucide-react";

const MessageStatus = ({ status }) => {
  const resolvedStatus = status || "sent";

  if (resolvedStatus === "read") {
    return <CheckCheck size={14} className="text-sky-400 shrink-0" />;
  }

  if (resolvedStatus === "delivered") {
    return <CheckCheck size={14} className="opacity-50 shrink-0" />;
  }

  return <Check size={14} className="opacity-50 shrink-0" />;
};

export default MessageStatus;
