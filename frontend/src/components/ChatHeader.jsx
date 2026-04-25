import { X, Bot, Loader2, Users, LogOut, UserMinus, Info, VolumeX, Volume2 } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { useGroupStore } from "../store/useGroupStore";
import { useState } from "react";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser, messages: dmMessages } = useChatStore();
  const {
    selectedGroup,
    setSelectedGroup,
    groupMessages,
    leaveGroup,
    removeMember,
    muteMember,
    unmuteMember,
  } = useGroupStore();
  const { onlineUsers, authUser } = useAuthStore();
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState("");
  const [isAiDropdownOpen, setIsAiDropdownOpen] = useState(false);
  const [showGroupInfo, setShowGroupInfo] = useState(false);

  const isGroupChat = !!selectedGroup;
  const messages = isGroupChat ? groupMessages : dmMessages;

  const handleAIAction = async (mode) => {
    setIsAiLoading(true);
    setAiResult("");
    try {
      const recentMessages = messages.slice(-15).map((msg) => {
        const senderId =
          typeof msg.senderId === "object" ? msg.senderId._id : msg.senderId;
        const senderName =
          typeof msg.senderId === "object"
            ? msg.senderId.fullName
            : isGroupChat
            ? selectedGroup.members?.find((m) => m._id === msg.senderId)
                ?.fullName || "Unknown"
            : undefined;

        return {
          senderId,
          senderName,
          text:
            msg.messageType === "code"
              ? msg.text
              : msg.translatedText || msg.text,
        };
      });

      const payload = {
        messages: recentMessages,
        mode,
      };

      // Add group context for AI
      if (isGroupChat) {
        payload.groupName = selectedGroup.name;
      }

      const res = await axiosInstance.post("/ai/process", payload);
      setAiResult(res.data.result);
    } catch (error) {
      toast.error(error.response?.data?.error || "AI processing failed");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleClose = () => {
    if (isGroupChat) {
      setSelectedGroup(null);
    } else {
      setSelectedUser(null);
    }
    setIsAiDropdownOpen(false);
    setAiResult("");
    setShowGroupInfo(false);
  };

  const handleLeaveGroup = async () => {
    if (!selectedGroup) return;
    const confirmed = window.confirm(
      `Are you sure you want to leave "${selectedGroup.name}"?`
    );
    if (!confirmed) return;
    await leaveGroup(selectedGroup._id);
  };

  const handleRemoveMember = async (userId) => {
    if (!selectedGroup) return;
    const member = selectedGroup.members?.find((m) => m._id === userId);
    const confirmed = window.confirm(
      `Remove ${member?.fullName || "this member"} from the group?`
    );
    if (!confirmed) return;
    await removeMember(selectedGroup._id, userId);
  };

  const handleMuteMember = async (userId) => {
    if (!selectedGroup) return;
    const member = selectedGroup.members?.find((m) => m._id === userId);
    const confirmed = window.confirm(
      `Mute ${member?.fullName || "this member"}? They won't be able to send messages.`
    );
    if (!confirmed) return;
    await muteMember(selectedGroup._id, userId);
  };

  const handleUnmuteMember = async (userId) => {
    if (!selectedGroup) return;
    await unmuteMember(selectedGroup._id, userId);
  };

  const isAdmin =
    isGroupChat &&
    selectedGroup.admin?._id === authUser._id;

  return (
    <div className="p-2.5 border-b border-base-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="avatar">
            <div className="size-10 rounded-full relative">
              {isGroupChat ? (
                selectedGroup.groupPic ? (
                  <img
                    src={selectedGroup.groupPic}
                    alt={selectedGroup.name}
                  />
                ) : (
                  <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="size-5 text-primary" />
                  </div>
                )
              ) : (
                <img
                  src={selectedUser.profilePic || "/avatar.svg"}
                  alt={selectedUser.fullName}
                />
              )}
            </div>
          </div>

          {/* Info */}
          <div>
            <h3 className="font-medium">
              {isGroupChat ? selectedGroup.name : selectedUser.fullName}
            </h3>
            <p className="text-sm text-base-content/70">
              {isGroupChat
                ? `${selectedGroup.members?.length || 0} members`
                : onlineUsers.includes(selectedUser._id)
                ? "Online"
                : "Offline"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 relative">
          {/* Group Info Button */}
          {isGroupChat && (
            <div
              role="button"
              className="btn btn-circle btn-ghost btn-sm tooltip tooltip-bottom"
              data-tip="Group Info"
              onClick={() => {
                setShowGroupInfo(!showGroupInfo);
                setIsAiDropdownOpen(false);
              }}
            >
              <Info className="size-5" />
            </div>
          )}

          {/* AI Assistant Button */}
          <div
            role="button"
            className="btn btn-circle btn-ghost btn-sm tooltip tooltip-bottom"
            data-tip="AI Assistant"
            onClick={() => {
              setIsAiDropdownOpen(!isAiDropdownOpen);
              setShowGroupInfo(false);
            }}
          >
            <Bot className="size-5 text-primary" />
          </div>

          {/* AI Dropdown */}
          {(isAiDropdownOpen || aiResult || isAiLoading) && (
            <div className="absolute right-0 top-12 z-[50] p-4 shadow-xl bg-base-100 rounded-box w-80 border border-base-300">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <Bot className="size-5" /> AI Assistant
                </h3>
                <button
                  onClick={() => {
                    setIsAiDropdownOpen(false);
                    setAiResult("");
                  }}
                  className="btn btn-circle btn-ghost btn-xs"
                >
                  <X className="size-3" />
                </button>
              </div>

              <div className="flex flex-col gap-2 mb-4">
                <button
                  onClick={() => handleAIAction("summary")}
                  className="btn btn-sm btn-outline btn-primary"
                  disabled={isAiLoading}
                >
                  Summarize Context
                </button>
                <button
                  onClick={() => handleAIAction("reply")}
                  className="btn btn-sm btn-outline btn-secondary"
                  disabled={isAiLoading}
                >
                  Suggest Replies
                </button>
                <button
                  onClick={() => handleAIAction("sentiment")}
                  className="btn btn-sm btn-outline btn-accent"
                  disabled={isAiLoading}
                >
                  Analyze Sentiment
                </button>
              </div>

              {isAiLoading && (
                <div className="flex items-center justify-center py-4 text-base-content/70">
                  <Loader2 className="size-5 animate-spin mr-2" />
                  Thinking...
                </div>
              )}

              {aiResult && !isAiLoading && (
                <div className="bg-base-200 p-3 rounded-lg text-sm max-h-48 overflow-y-auto whitespace-pre-wrap">
                  {aiResult}
                </div>
              )}
            </div>
          )}

          {/* Group Info Panel */}
          {showGroupInfo && isGroupChat && (
            <div className="absolute right-0 top-12 z-[50] p-4 shadow-xl bg-base-100 rounded-box w-80 border border-base-300">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <Users className="size-5" /> Group Info
                </h3>
                <button
                  onClick={() => setShowGroupInfo(false)}
                  className="btn btn-circle btn-ghost btn-xs"
                >
                  <X className="size-3" />
                </button>
              </div>

              {selectedGroup.description && (
                <p className="text-sm text-base-content/70 mb-3">
                  {selectedGroup.description}
                </p>
              )}

              <div className="mb-3">
                <h4 className="text-sm font-semibold mb-2">
                  Members ({selectedGroup.members?.length || 0})
                </h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {selectedGroup.members?.map((member) => (
                    <div
                      key={member._id}
                      className="flex items-center justify-between gap-2"
                    >
                        <div className="flex items-center gap-2">
                        <img
                          src={member.profilePic || "/avatar.svg"}
                          alt={member.fullName}
                          className="size-8 rounded-full object-cover"
                        />
                        <div>
                          <span className="text-sm font-medium">
                            {member.fullName}
                          </span>
                          {member._id === selectedGroup.admin?._id && (
                            <span className="ml-1 text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full">
                              Admin
                            </span>
                          )}
                          {member._id === authUser._id && (
                            <span className="ml-1 text-[10px] text-base-content/50">
                              (You)
                            </span>
                          )}
                          {selectedGroup.mutedMembers?.includes(member._id) && (
                            <span className="ml-1 text-[10px] bg-warning/20 text-warning px-1.5 py-0.5 rounded-full">
                              Muted
                            </span>
                          )}
                        </div>
                      </div>
                      {/* Admin controls: mute/unmute + remove (not for themselves) */}
                      {isAdmin && member._id !== authUser._id && (
                        <div className="flex items-center gap-1">
                          {selectedGroup.mutedMembers?.includes(member._id) ? (
                            <button
                              onClick={() => handleUnmuteMember(member._id)}
                              className="btn btn-ghost btn-xs text-success"
                              title="Unmute member"
                            >
                              <Volume2 className="size-3" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleMuteMember(member._id)}
                              className="btn btn-ghost btn-xs text-warning"
                              title="Mute member"
                            >
                              <VolumeX className="size-3" />
                            </button>
                          )}
                          <button
                            onClick={() => handleRemoveMember(member._id)}
                            className="btn btn-ghost btn-xs text-error"
                            title="Remove member"
                          >
                            <UserMinus className="size-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Leave Group */}
              <button
                onClick={handleLeaveGroup}
                className="btn btn-outline btn-error btn-sm w-full gap-2"
              >
                <LogOut className="size-4" />
                Leave Group
              </button>
            </div>
          )}

          {/* Close button */}
          <button
            onClick={handleClose}
            className="btn btn-circle btn-ghost btn-sm"
          >
            <X className="size-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
export default ChatHeader;