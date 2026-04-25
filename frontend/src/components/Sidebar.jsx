import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useGroupStore } from "../store/useGroupStore";
import { useAuthStore } from "../store/useAuthStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import CreateGroupModal from "./CreateGroupModal";
import { Users, MessageCircle, Plus } from "lucide-react";

const Sidebar = () => {
  const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading } = useChatStore();
  const {
    groups,
    getGroups,
    selectedGroup,
    setSelectedGroup,
    isGroupsLoading,
    setupGroupSocketListeners,
    cleanupGroupSocketListeners,
  } = useGroupStore();

  const { onlineUsers } = useAuthStore();
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [activeTab, setActiveTab] = useState("chats"); // "chats" | "groups"
  const [showCreateGroup, setShowCreateGroup] = useState(false);

  useEffect(() => {
    getUsers();
    getGroups();
    setupGroupSocketListeners();

    return () => {
      cleanupGroupSocketListeners();
    };
  }, [getUsers, getGroups, setupGroupSocketListeners, cleanupGroupSocketListeners]);

  const filteredUsers = showOnlineOnly
    ? users.filter((user) => onlineUsers.includes(user._id))
    : users;

  if (isUsersLoading && activeTab === "chats") return <SidebarSkeleton />;

  return (
    <aside className="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200">
      {/* Tab Header */}
      <div className="border-b border-base-300 w-full p-3">
        <div className="flex items-center gap-1 bg-base-200 rounded-lg p-1">
          <button
            onClick={() => setActiveTab("chats")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-all ${
              activeTab === "chats"
                ? "bg-base-100 shadow-sm text-base-content"
                : "text-base-content/60 hover:text-base-content"
            }`}
          >
            <MessageCircle className="size-4" />
            <span className="hidden lg:inline">Chats</span>
          </button>
          <button
            onClick={() => setActiveTab("groups")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-all ${
              activeTab === "groups"
                ? "bg-base-100 shadow-sm text-base-content"
                : "text-base-content/60 hover:text-base-content"
            }`}
          >
            <Users className="size-4" />
            <span className="hidden lg:inline">Groups</span>
          </button>
        </div>

        {/* Online filter — only on Chats tab */}
        {activeTab === "chats" && (
          <div className="mt-3 hidden lg:flex items-center gap-2">
            <label className="cursor-pointer flex items-center gap-2">
              <input
                type="checkbox"
                checked={showOnlineOnly}
                onChange={(e) => setShowOnlineOnly(e.target.checked)}
                className="checkbox checkbox-sm"
              />
              <span className="text-sm">Show online only</span>
            </label>
            <span className="text-xs text-zinc-500">({onlineUsers.length - 1} online)</span>
          </div>
        )}

        {/* New Group button — only on Groups tab */}
        {activeTab === "groups" && (
          <button
            onClick={() => setShowCreateGroup(true)}
            className="mt-3 btn btn-primary btn-sm w-full gap-2"
          >
            <Plus className="size-4" />
            <span className="hidden lg:inline">New Group</span>
          </button>
        )}
      </div>

      {/* List */}
      <div className="overflow-y-auto w-full py-3">
        {activeTab === "chats" ? (
          <>
            {filteredUsers.map((user) => (
              <button
                key={user._id}
                onClick={() => setSelectedUser(user)}
                className={`
                  w-full p-3 flex items-center gap-3
                  hover:bg-base-300 transition-colors
                  ${selectedUser?._id === user._id ? "bg-base-300 ring-1 ring-base-300" : ""}
                `}
              >
                <div className="relative mx-auto lg:mx-0">
                  <img
                    src={user.profilePic || "/avatar.svg"}
                    alt={user.fullName}
                    className="size-12 object-cover rounded-full"
                  />
                  {onlineUsers.includes(user._id) && (
                    <span
                      className="absolute bottom-0 right-0 size-3 bg-green-500 
                      rounded-full ring-2 ring-zinc-900"
                    />
                  )}
                </div>

                {/* User info - only visible on larger screens */}
                <div className="hidden lg:block text-left min-w-0">
                  <div className="font-medium truncate">{user.fullName}</div>
                  <div className="text-sm text-zinc-400">
                    {onlineUsers.includes(user._id) ? "Online" : "Offline"}
                  </div>
                </div>
              </button>
            ))}
            {filteredUsers.length === 0 && (
              <div className="text-center text-zinc-500 py-4">No online users</div>
            )}
          </>
        ) : (
          <>
            {isGroupsLoading ? (
              <div className="flex justify-center py-8">
                <span className="loading loading-spinner loading-md"></span>
              </div>
            ) : (
              <>
                {groups.map((group) => (
                  <button
                    key={group._id}
                    onClick={() => setSelectedGroup(group)}
                    className={`
                      w-full p-3 flex items-center gap-3
                      hover:bg-base-300 transition-colors
                      ${selectedGroup?._id === group._id ? "bg-base-300 ring-1 ring-base-300" : ""}
                    `}
                  >
                    <div className="mx-auto lg:mx-0">
                      {group.groupPic ? (
                        <img
                          src={group.groupPic}
                          alt={group.name}
                          className="size-12 object-cover rounded-full"
                        />
                      ) : (
                        <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <Users className="size-6 text-primary" />
                        </div>
                      )}
                    </div>

                    {/* Group info - only visible on larger screens */}
                    <div className="hidden lg:block text-left min-w-0">
                      <div className="font-medium truncate">{group.name}</div>
                      <div className="text-sm text-zinc-400">
                        {group.members?.length || 0} members
                      </div>
                    </div>
                  </button>
                ))}
                {groups.length === 0 && (
                  <div className="text-center text-zinc-500 py-4">
                    <p>No groups yet</p>
                    <p className="text-xs mt-1">Create one to get started!</p>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>

      {/* Create Group Modal */}
      <CreateGroupModal
        isOpen={showCreateGroup}
        onClose={() => setShowCreateGroup(false)}
      />
    </aside>
  );
};
export default Sidebar;