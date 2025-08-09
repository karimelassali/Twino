"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

const HistorySidebar = ({
  user,
  isOpen,
  onToggle,
  overlay = false,
  pageSize = 10,
}) => {
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchUserConversations = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        const { data: conversationsData, error } = await supabase
          .from("conversations")
          .select("*, personalities(personality_pair)")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .range(page * pageSize, page * pageSize + pageSize - 1);

        if (error) {
          console.error("Error fetching conversations:", error);
        } else {
          setHistory((prev) => [...prev, ...(conversationsData || [])]);
          setHasMore(conversationsData && conversationsData.length === pageSize);
        }
      } catch (error) {
        console.error("Error in fetchUserConversations:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserConversations();
  }, [user?.id, supabase, page, pageSize]);

  // Close sidebar on escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape" && isOpen) {
        closeSidebar();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  return (
    <>
      {/* Mobile Menu Button removed; handled by parent */}

      {/* Sidebar - z-index is now higher to appear over content */}
      <aside
        className={`fixed top-0 left-0 h-full w-80 border-r text-white transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform ease-in-out duration-300 md:translate-x-0 md:static md:h-screen md:w-80 md:flex-shrink-0 z-10 flex flex-col`}
        style={overlay ? { zIndex: 60 } : {}}
      >
        {/* Header Section */}
        <div className="flex-shrink-0 p-6 border-b border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-slate-800  dark:text-white">Last Conversations</h2>
            <button
              onClick={onToggle}
              className="md:hidden p-1 rounded-md hover:bg-gray-700 transition-colors duration-200"
              aria-label="Close sidebar"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Scrollable History Section */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
          <nav className="p-4">
            {isLoading ? (
              // Loading skeleton
              <div className="space-y-3">
                {[...Array(5)].map((_, index) => (
                  <div key={index} className="animate-pulse">
                    <div className="h-12 bg-gray-700 rounded-lg"></div>
                  </div>
                ))}
              </div>
            ) : history.length > 0 ? (
              <ul className="space-y-2">
                {history.map((conversation) => (
                  <li key={conversation.id}>
                    <Link
                      href={`/chat/${conversation.id}`}
                      onClick={onToggle}
                      className="group block p-3 rounded-lg text-sm text-gray-300 hover:bg-violet-300 dark:hover:bg-gray-700 hover:text-white transition-all duration-200 border border-transparent hover:border-gray-600"
                    >
                      <div className="flex flex-col space-y-1">
                        <span className="font-medium truncate text-slate-800 dark:text-white  group-hover:text-white">
                          {conversation.generated_title || "Untitled Chat"}
                        </span>
                        {conversation.personalities?.personality_pair && (
                          <span className="text-xs text-gray-500 group-hover:text-gray-400 truncate">
                            {conversation.personalities.personality_pair}
                          </span>
                        )}
                        <span className="text-xs text-gray-600 group-hover:text-gray-500">
                          {new Date(
                            conversation.created_at
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    </Link>
                  </li>
                ))}
                {/* Load More Button */}
                {hasMore && !isLoading && (
                  <button
                    className="w-full mt-4 py-2 rounded-lg bg-violet-500 text-white font-medium hover:bg-violet-600 transition"
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Load More
                  </button>
                )}
              </ul>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <svg
                  className="w-12 h-12 mx-auto mb-4 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                <p className="text-sm">No conversations yet</p>
                <p className="text-xs mt-1">
                  Start a new chat to see your history here
                </p>
              </div>
            )}
          </nav>
        </div>

        {/* User Info Section - Fixed at bottom */}
        <div className="flex-shrink-0 p-4 border-t border-gray-700 dark:bg-gray-800">
          {user ? (
            <div className="flex items-center space-x-3">
              <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                {user.imageUrl ? (
                  <img
                    src={user.imageUrl}
                    alt={`${user.name}'s profile picture`}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                    {user.firstName?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-800 dark:text-white truncate">
                  {user?.fullName || "User"}
                </p>
                {/* Conversations count */}
                <div className="text-sm text-gray-400">
                  {isLoading ? (
                    <div className="animate-pulse">
                      Loading conversations...
                    </div>
                  ) : (
                    <span>
                      {history.length} conversation
                      {history.length !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="animate-pulse flex items-center space-x-3">
              <div className="w-12 h-12 bg-gray-700 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-700 rounded w-24 mb-2"></div>
                <div className="h-3 bg-gray-700 rounded w-16"></div>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Overlay for mobile - z-index is now just below the sidebar */}
      {isOpen && overlay && (
        <div
          onClick={onToggle}
          className="fixed inset-0 bg-black bg-opacity-40 md:hidden backdrop-blur-sm"
          style={{ zIndex: 59 }}
        />
      )}
    </>
  );
};

export default HistorySidebar;
