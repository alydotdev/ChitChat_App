import React, { useState, useRef, useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { Image, Send, X, Smile } from "lucide-react";
import toast from "react-hot-toast";
import EmojiPicker, { Theme } from "emoji-picker-react";
import { validateImageFile } from "../lib/utils";
import { useThemeStore } from "../store/useThemeStore";

const DARK_THEMES = ["dark", "night", "dracula", "black", "dim", "sunset", "synthwave", "cyberpunk", "halloween", "forest", "coffee"];

const MessageInput = () => {
  const [text, setInputText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef(null);
  const inputRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const { sendMessage, selectedUser } = useChatStore();
  const { emitTyping, emitStopTyping } = useAuthStore();
  const { theme } = useThemeStore();
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target)) {
        setShowEmojiPicker(false);
      }
    };

    if (showEmojiPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showEmojiPicker]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    const { valid, error } = validateImageFile(file);
    if (!valid) {
      toast.error(error);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleEmojiClick = (emojiData) => {
    setInputText((prev) => prev + emojiData.emoji);
    inputRef.current?.focus();
  };

  const handleTyping = (value) => {
    if (!selectedUser) return;

    if (value.trim()) {
      emitTyping(selectedUser._id);
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        emitStopTyping(selectedUser._id);
      }, 2000);
    } else {
      emitStopTyping(selectedUser._id);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview) return;

    if (selectedUser) emitStopTyping(selectedUser._id);

    try {
      await sendMessage({
        text: text.trim(),
        image: imagePreview,
      });

      setInputText("");
      setImagePreview(null);
      setShowEmojiPicker(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("Failed to send message. Please try again.");
    }
  };

  return (
    <div className="p-3 sm:p-4 w-full relative">
      {imagePreview && (
        <div className="mb-3 flex items-center gap-2">
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-20 h-20 object-cover rounded-lg border border-zinc-700"
            />
            <button
              onClick={removeImage}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300 flex items-center justify-center"
              type="button"
            >
              <X className="size-3" />
            </button>
          </div>
        </div>
      )}

      {showEmojiPicker && (
        <div ref={emojiPickerRef} className="absolute bottom-full left-2 sm:left-4 mb-2 z-50">
          <EmojiPicker
            onEmojiClick={handleEmojiClick}
            theme={DARK_THEMES.includes(theme) ? Theme.DARK : Theme.LIGHT}
            width="min(320px, calc(100vw - 2rem))"
            height={360}
            searchPlaceholder="Search emoji..."
            previewConfig={{ showPreview: false }}
          />
        </div>
      )}

      <form onSubmit={handleSendMessage} className="flex items-center gap-1.5 sm:gap-2">
        <button
          type="button"
          className={`btn btn-circle btn-sm sm:btn-md shrink-0 ${
            showEmojiPicker ? "text-primary" : "text-zinc-400"
          }`}
          onClick={() => setShowEmojiPicker((prev) => !prev)}
        >
          <Smile size={20} />
        </button>

        <div className="flex-1 flex gap-1.5 sm:gap-2 min-w-0">
          <input
            ref={inputRef}
            type="text"
            className="w-full input input-bordered rounded-lg input-sm sm:input-md"
            placeholder="Type a message..."
            value={text}
            onChange={(e) => {
              setInputText(e.target.value);
              handleTyping(e.target.value);
            }}
            onFocus={() => setShowEmojiPicker(false)}
          />
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageChange}
          />

          <button
            type="button"
            className={`btn btn-circle btn-sm sm:btn-md shrink-0 ${
              imagePreview ? "text-emerald-500" : "text-zinc-400"
            }`}
            onClick={() => fileInputRef.current?.click()}
          >
            <Image size={20} />
          </button>
        </div>

        <button
          type="submit"
          className="btn btn-sm btn-circle shrink-0"
          disabled={!text.trim() && !imagePreview}
        >
          <Send size={22} />
        </button>
      </form>
    </div>
  );
};

export default MessageInput;
