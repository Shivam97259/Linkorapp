export interface UserProfile {
  id: string;
  name: string;
  handle: string;
  initials: string;
  avatarUrl?: string;
  bio: string;
  location?: string;
  website?: string;
  followers: number;
  chatCode?: string;
  following: number;
  followingIds: string[];
  bannerGradient?: string;
  notificationsEnabled?: boolean;
}

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorHandle: string;
  authorInitials: string;
  authorAvatarUrl?: string;
  content: string;
  imageUrl?: string;
  timestamp: string;
  likes: number;
  isLiked: boolean;
  comments: Comment[];
  isOwn?: boolean;
}

export interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  authorHandle: string;
  authorInitials: string;
  authorAvatarUrl?: string;
  content: string;
  timestamp: string;
}

export interface SearchUser {
  id: string;
  name: string;
  handle: string;
  initials: string;
  avatarUrl?: string;
  bio: string;
  followers: number;
  chatCode?: string;
  following: number;
  color: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  text?: string;
  imageUrl?: string;
  timestamp: string;
  isRead: boolean;
}

export interface ChatSession {
  id: string;
  participantId: string;
  unreadCount: number;
  messages: ChatMessage[];
}

export interface Notification {
  id: string;
  type: 'like' | 'comment' | 'follow';
  actorName: string;
  actorAvatarUrl?: string;
  targetId?: string; // e.g. postId
  message: string;
  timestamp: string;
  isRead: boolean;
}

export type Tab = 'feed' | 'search' | 'chats' | 'profile';

export interface PostComment {
  id: string;
  authorId: string;
  authorName: string;
  authorHandle: string;
  authorInitials: string;
  authorAvatarUrl?: string;
  content: string;
  timestamp: string;
  isOwn?: boolean;
}
