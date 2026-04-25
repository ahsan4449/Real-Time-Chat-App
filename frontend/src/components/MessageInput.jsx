import { useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useGroupStore } from "../store/useGroupStore";
import { useAuthStore } from "../store/useAuthStore";
import { Image, Send, X, VolumeX } from "lucide-react";
import toast from "react-hot-toast";

const CODE_LANGUAGES = ["javascript", "python", "java", "cpp", "ruby", "go", "php"];

const MessageInput = () => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const fileInputRef = useRef(null);
  const { sendMessage } = useChatStore();
  const { sendGroupMessage, selectedGroup } = useGroupStore();
  const { authUser } = useAuthStore();
  const isGroupChat = !!selectedGroup;

  // Check if current user is muted in this group
  const isMuted =
    isGroupChat &&
    selectedGroup.mutedMembers?.includes(authUser._id);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview) return;

    if (isMuted) {
      toast.error("You are muted in this group");
      return;
    }

    let cleanText = text.trim();
    let messageType = "text";
    let language = "javascript";

    if (cleanText.startsWith("```") && cleanText.endsWith("```")) {
      messageType = "code";
      language = selectedLanguage;
      
      const lines = cleanText.split("\n");
      if (lines.length >= 2) {
        lines.shift();
        lines.pop();
        cleanText = lines.join("\n");
      } else {
        cleanText = cleanText.replace(/`/g, "");
      }
    }

    try {
      const messageData = {
        text: cleanText,
        image: imagePreview,
        messageType,
        language,
      };

      if (isGroupChat) {
        await sendGroupMessage(messageData);
      } else {
        await sendMessage(messageData);
      }

      // Clear form
      setText("");
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  // Show muted banner if user is muted
  if (isMuted) {
    return (
      <div className="p-4 w-full">
        <div className="flex items-center justify-center gap-2 py-3 px-4 bg-warning/10 border border-warning/20 rounded-lg text-warning">
          <VolumeX className="size-5" />
          <span className="text-sm font-medium">You are muted in this group</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 w-full">
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
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300
              flex items-center justify-center"
              type="button"
            >
              <X className="size-3" />
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSendMessage} className="flex items-center gap-2">
        <div className="flex-1 flex gap-2">
          <textarea
            className="w-full input input-bordered rounded-lg input-sm sm:input-md py-2 min-h-[40px] max-h-[150px] resize-none overflow-y-auto leading-relaxed"
            placeholder="Type a message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(e);
              }
            }}
            rows={1}
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
            className={`hidden sm:flex btn btn-circle
                     ${imagePreview ? "text-emerald-500" : "text-zinc-400"}`}
            onClick={() => fileInputRef.current?.click()}
          >
            <Image size={20} />
          </button>
          
          <select 
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="select select-bordered rounded-lg select-sm sm:select-md w-24 sm:w-32 hidden sm:block"
          >
            {CODE_LANGUAGES.map(lang => (
              <option key={lang} value={lang}>{lang}</option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="btn btn-sm btn-circle"
          disabled={!text.trim() && !imagePreview}
        >
          <Send size={22} />
        </button>
      </form>
    </div>
  );
};
export default MessageInput;