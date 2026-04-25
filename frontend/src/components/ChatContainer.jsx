import { useChatStore } from "../store/useChatStore";
import { useGroupStore } from "../store/useGroupStore";
import { useEffect, useRef, useState } from "react";

import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";
import { Globe, Play } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";

const ChatContainer = () => {
  const {
    messages: dmMessages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
  } = useChatStore();

  const {
    groupMessages,
    getGroupMessages,
    isGroupMessagesLoading,
    selectedGroup,
    subscribeToGroupMessages,
    unsubscribeFromGroupMessages,
  } = useGroupStore();

  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);
  const [showOriginal, setShowOriginal] = useState({});
  const [executionResults, setExecutionResults] = useState({});

  const isGroupChat = !!selectedGroup;
  const messages = isGroupChat ? groupMessages : dmMessages;
  const isLoading = isGroupChat ? isGroupMessagesLoading : isMessagesLoading;

  // Helper to get senderId string (handles both populated object and plain string)
  const getSenderId = (message) => {
    if (typeof message.senderId === "object" && message.senderId !== null) {
      return message.senderId._id;
    }
    return message.senderId;
  };

  // Helper to get sender info for group messages
  const getSenderInfo = (message) => {
    if (typeof message.senderId === "object" && message.senderId !== null) {
      return {
        name: message.senderId.fullName,
        pic: message.senderId.profilePic || "/avatar.svg",
      };
    }
    // Fallback: look up in group members
    if (selectedGroup?.members) {
      const member = selectedGroup.members.find(
        (m) => m._id === message.senderId
      );
      if (member) {
        return {
          name: member.fullName,
          pic: member.profilePic || "/avatar.svg",
        };
      }
    }
    return { name: "Unknown", pic: "/avatar.svg" };
  };

  const toggleOriginal = (msgId) => {
    setShowOriginal((prev) => ({ ...prev, [msgId]: !prev[msgId] }));
  };

  const handleRunCode = async (msgId, code, language) => {
    setExecutionResults((prev) => ({ ...prev, [msgId]: { loading: true } }));
    
    const languageMap = {
      javascript: 93, // Node.js
      python: 71,
      java: 62,
      cpp: 54,
      ruby: 72,
      go: 60,
      php: 68,
    };
    
    const langId = languageMap[language?.toLowerCase()] || 93;

    try {
      const res = await fetch("https://ce.judge0.com/submissions?base64_encoded=false&wait=true", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source_code: code,
          language_id: langId,
        }),
      });
      const data = await res.json();
      
      let output = data.stdout || data.stderr || data.compile_output || "No output";
      if (data.message) output += `\nError: ${data.message}`;

      setExecutionResults((prev) => ({
        ...prev,
        [msgId]: { output: output.trim(), loading: false },
      }));
    } catch (error) {
      setExecutionResults((prev) => ({
        ...prev,
        [msgId]: { output: "Execution failed: The public API might be down or rate-limited.", loading: false },
      }));
    }
  };

  // Subscribe to DM messages
  useEffect(() => {
    if (!selectedUser) return;
    getMessages(selectedUser._id);
    subscribeToMessages();
    return () => unsubscribeFromMessages();
  }, [selectedUser?._id, getMessages, subscribeToMessages, unsubscribeFromMessages]);

  // Subscribe to group messages
  useEffect(() => {
    if (!selectedGroup) return;
    getGroupMessages(selectedGroup._id);
    subscribeToGroupMessages();
    return () => unsubscribeFromGroupMessages();
  }, [selectedGroup?._id, getGroupMessages, subscribeToGroupMessages, unsubscribeFromGroupMessages]);

  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => {
          const senderId = getSenderId(message);
          const isMe = senderId === authUser._id;

          return (
            <div
              key={message._id}
              className={`chat ${isMe ? "chat-end" : "chat-start"}`}
              ref={messageEndRef}
            >
              <div className="chat-image avatar">
                <div className="size-10 rounded-full border">
                  <img
                    src={
                      isMe
                        ? authUser.profilePic || "/avatar.svg"
                        : isGroupChat
                        ? getSenderInfo(message).pic
                        : selectedUser.profilePic || "/avatar.svg"
                    }
                    alt="profile pic"
                  />
                </div>
              </div>
              <div className="chat-header mb-1">
                {/* Show sender name in group chats */}
                {isGroupChat && !isMe && (
                  <span className="text-xs font-medium mr-2">
                    {getSenderInfo(message).name}
                  </span>
                )}
                <time className="text-xs opacity-50 ml-1">
                  {formatMessageTime(message.createdAt)}
                </time>
              </div>
              <div className="chat-bubble flex flex-col">
                {message.image && (
                  <img
                    src={message.image}
                    alt="Attachment"
                    className="sm:max-w-[200px] rounded-md mb-2"
                  />
                )}
                {message.text && (
                  message.messageType === "code" ? (
                    <div className="flex flex-col w-full max-w-full sm:max-w-[600px]">
                      <div className="flex items-center justify-between bg-zinc-900 text-zinc-400 px-4 py-2 rounded-t-md text-xs font-mono">
                        <span>{message.language || "code"}</span>
                        <button
                          onClick={() => handleRunCode(message._id, message.text, message.language)}
                          className="flex items-center gap-1 hover:text-white transition-colors disabled:opacity-50"
                          disabled={executionResults[message._id]?.loading}
                        >
                          <Play className="size-3" />
                          {executionResults[message._id]?.loading ? "Running..." : "Run Code"}
                        </button>
                      </div>
                      <div className="overflow-hidden rounded-b-md bg-[#1d1f21]">
                        <SyntaxHighlighter
                          language={message.language || "javascript"}
                          style={atomDark}
                          wrapLines={true}
                          wrapLongLines={true}
                          customStyle={{
                            margin: 0,
                            borderRadius: 0,
                            padding: "1rem",
                            minHeight: "300px",
                            maxHeight: "600px",
                            overflowY: "auto",
                            overflowX: "hidden"
                          }}
                        >
                          {message.text}
                        </SyntaxHighlighter>
                      </div>
                      {executionResults[message._id] && !executionResults[message._id].loading && (
                        <div className="bg-black text-green-400 font-mono text-xs p-3 rounded-md mt-1 overflow-x-auto whitespace-pre-wrap">
                          {executionResults[message._id].output}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1">
                      <div className="flex items-start justify-between gap-4">
                        <p className="break-words">
                          {message.translatedText && !showOriginal[message._id]
                            ? message.translatedText
                            : message.text}
                        </p>
                        {message.translatedText && message.translatedText !== message.text && (
                          <button
                            onClick={() => toggleOriginal(message._id)}
                            className="btn btn-ghost btn-xs btn-circle opacity-50 hover:opacity-100"
                            title={showOriginal[message._id] ? "Show Translation" : "Show Original"}
                          >
                            <Globe className="size-4" />
                          </button>
                        )}
                      </div>
                      {message.translatedText && !showOriginal[message._id] && message.translatedText !== message.text && (
                        <span className="text-[10px] opacity-40">Translated</span>
                      )}
                    </div>
                  )
                )}
              </div>
            </div>
          );
        })}
      </div>

      <MessageInput />
    </div>
  );
};
export default ChatContainer;