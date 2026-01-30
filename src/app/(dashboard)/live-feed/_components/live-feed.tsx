/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ClockCheck,
  Send,
  ThumbsUp,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import React, { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import LiveFeedSkeleton from "./live-feed-skeleton";
import { useSession } from "next-auth/react";

interface User {
  _id: string;
  firstName: string;
  lastName: string;
}

interface Comment {
  _id: string;
  user: User;
  content: string;
  createdAt: string;
}

interface Post {
  _id: string;
  user: User;
  content: string;
  tag: string;
  likes: number;
  createdAt: string;
  comments: Comment[];
  sport: string;
  betType: string;
  odds: string;
  stake: string;
  confidence: string;
}

interface ApiResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: Post[];
}

interface CommentPayload {
  post: string;
  content: string;
}

const LiveFeed = () => {
  const queryClient = useQueryClient();
  const [commentInputs, setCommentInputs] = useState<{ [key: string]: string }>(
    {},
  );
  const [expandedPosts, setExpandedPosts] = useState<{
    [key: string]: boolean;
  }>({});
  const session = useSession();
  const token = (session.data as any)?.user?.accessToken as string;

  const { data, isLoading } = useQuery<ApiResponse>({
    queryKey: ["posts"],
    queryFn: async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/posts`);
      const data = await res.json();
      return data;
    },
    refetchInterval: 30000,
  });

  const addCommentMutation = useMutation({
    mutationFn: async (commentData: CommentPayload) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/comments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(commentData),
        },
      );
      const data = await res.json();
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      setCommentInputs({});
    },
    onError: (error) => {
      console.error("Error adding comment:", error);
      alert("Failed to add comment. Please try again.");
    },
  });

  const formatTimeAgo = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      console.log("error", error);
      return "Some time ago";
    }
  };

  const handleCommentSubmit = (postId: string) => {
    const content = commentInputs[postId]?.trim();
    if (!content) return;

    const commentData: CommentPayload = {
      post: postId,
      content: content,
    };

    addCommentMutation.mutate(commentData);
  };

  const handleInputChange = (postId: string, value: string) => {
    setCommentInputs((prev) => ({
      ...prev,
      [postId]: value,
    }));
  };

  const handleKeyPress = (
    postId: string,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleCommentSubmit(postId);
    }
  };

  const toggleCommentsExpanded = (postId: string) => {
    setExpandedPosts((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  const getVisibleComments = (post: Post) => {
    const isExpanded = expandedPosts[post._id];
    const totalComments = post.comments.length;

    if (isExpanded || totalComments <= 2) {
      return post.comments;
    }

    return post.comments.slice(0, 2);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {[1, 2, 3, 4].map((item) => (
          <LiveFeedSkeleton key={item} />
        ))}
      </div>
    );
  }

  const posts = data?.data || [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {posts.map((post) => {
        const visibleComments = getVisibleComments(post);
        const isExpanded = expandedPosts[post._id];
        const totalComments = post.comments.length;
        const showSeeMore = totalComments > 2;

        return (
          <div
            key={post._id}
            className="w-full p-6 bg-[#151515] rounded-xl border border-gray-800"
          >
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-white font-semibold text-lg">
                  {post.user.firstName}_{post.user.lastName}
                </h3>
                <p className="text-gray-500 text-sm flex items-center gap-1 mt-1">
                  <ClockCheck className="h-4 w-4" />
                  {formatTimeAgo(post.createdAt)}
                </p>
              </div>
              <div className="flex items-center gap-3 text-white border border-gray-600 py-2 px-3 rounded-3xl cursor-pointer hover:bg-gray-800/50 transition-colors">
                <ThumbsUp size={20} className="fill-white/75" />
                <span className="text-sm">+{post.likes}</span>
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-3 mb-6">
              <div className="px-3 py-1.5 border border-gray-700 rounded-3xl text-sm">
                <span className="opacity-80"> Sport:</span>{" "}
                <span className="text-white capitalize">{post.sport}</span>
              </div>

              <div className="px-3 py-1.5 border border-gray-700 rounded-3xl text-sm">
                <span className="opacity-80"> Bet:</span>{" "}
                <span className="text-white capitalize">{post.betType}</span>
              </div>

              <div className="px-3 py-1.5 border border-gray-700 rounded-3xl text-sm">
                <span className="opacity-80"> Odds:</span>{" "}
                <span className="text-white capitalize">{post.odds}</span>
              </div>

              <div className="px-3 py-1.5 border border-gray-700 rounded-3xl text-sm">
                <span className="opacity-80"> Stack:</span>{" "}
                <span className="text-white capitalize">{post.stake}</span>
              </div>

              <div className="px-3 py-1.5 border border-gray-700 rounded-3xl text-sm">
                <span className="opacity-80"> Conf:</span>{" "}
                <span className="text-white capitalize">{post.confidence}/10</span>
              </div>
            </div>

            {/* Description */}
            <p className="text-gray-300 text-sm leading-relaxed mb-6">
              {post.content}
            </p>

            {/* Divider */}
            <div className="border-t border-gray-700 mb-6"></div>

            {/* Comments Section */}
            <h4 className="font-semibold mb-4 text-gray-600">
              Comments ({post.comments.length})
            </h4>

            {/* Comments List */}
            <div className="space-y-4 mb-6">
              {visibleComments.map((comment) => (
                <div key={comment._id}>
                  <div className="flex items-baseline gap-2">
                    <span className="text-white font-medium">
                      {comment.user.firstName}
                    </span>
                    <span className="text-gray-500 text-xs">
                      {formatTimeAgo(comment.createdAt)}
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm mt-1">
                    {comment.content}
                  </p>
                </div>
              ))}

              {/* See More/See Less Button */}
              {showSeeMore && (
                <button
                  onClick={() => toggleCommentsExpanded(post._id)}
                  className="flex items-center gap-1 text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors mt-2"
                >
                  {isExpanded ? (
                    <>
                      <ChevronUp size={16} />
                      See Less
                    </>
                  ) : (
                    <>
                      <ChevronDown size={16} />
                      See {totalComments - 2} more comments
                    </>
                  )}
                </button>
              )}

              {/* No comments message */}
              {post.comments.length === 0 && (
                <p className="text-gray-500 text-sm italic">
                  No comments yet. Be the first to comment!
                </p>
              )}
            </div>

            {/* Comment Input */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Write a comment..."
                value={commentInputs[post._id] || ""}
                onChange={(e) => handleInputChange(post._id, e.target.value)}
                onKeyPress={(e) => handleKeyPress(post._id, e)}
                disabled={addCommentMutation.isPending}
                className="flex-1 bg-black/85 text-white rounded-xl px-4 py-3 text-sm focus:outline-none border border-gray-600 focus:border-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <button
                onClick={() => handleCommentSubmit(post._id)}
                disabled={
                  !commentInputs[post._id]?.trim() ||
                  addCommentMutation.isPending
                }
                className="bg-gray-800 hover:bg-gray-700 text-blue-400 rounded-xl px-4 py-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-800"
              >
                {addCommentMutation.isPending ? (
                  <div className="h-5 w-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Send size={20} />
                )}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default LiveFeed;
