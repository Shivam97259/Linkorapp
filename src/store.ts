import { useState, useEffect } from 'react';
import type { Post, PostComment, UserProfile, SearchUser, Tab, ChatSession, ChatMessage } from './types';

import { collection, onSnapshot, query, orderBy, addDoc, deleteDoc, doc, updateDoc, serverTimestamp, setDoc, getDoc, where } from 'firebase/firestore';
import { db, auth } from './firebase';

export const profileStore = {
  updateProfile: async (updated: Partial<UserProfile>) => {
    const user = auth.currentUser;
    if (!user) return;
    try {
      await updateDoc(doc(db, 'users', user.uid), updated);
      // We don't necessarily need to update all posts manually if we rely on normalized DB or handle it here,
      // but for simplicity we will just let it be updated on the profile document.
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  },
  toggleFollowUser: async (userId: string, currentProfile: UserProfile) => {
    const user = auth.currentUser;
    if (!user) return;
    try {
      const isFollowing = currentProfile.followingIds.includes(userId);
      let newFollowingIds = [...currentProfile.followingIds];
      
      if (isFollowing) {
        newFollowingIds = newFollowingIds.filter(id => id !== userId);
      } else {
        newFollowingIds.push(userId);
      }
      
      await updateDoc(doc(db, 'users', user.uid), {
        followingIds: newFollowingIds,
        following: newFollowingIds.length
      });
    } catch (error) {
      console.error('Error toggling follow:', error);
    }
  }
};

export function useProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged(user => {
      if (!user) {
        setProfile(null);
        return;
      }
      
      const unsubscribeDoc = onSnapshot(doc(db, 'users', user.uid), (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          
          let chatCode = data.chatCode;
          if (!chatCode) {
            chatCode = 'LX-' + Math.floor(100000 + Math.random() * 900000).toString();
            updateDoc(doc(db, 'users', user.uid), { chatCode }).catch(console.error);
          }

          setProfile({
            id: docSnap.id,
            name: data.displayName || 'User',
            handle: `@${data.username || 'user'}`,
            initials: (data.displayName || 'U').substring(0, 2).toUpperCase(),
            avatarUrl: data.photoURL,
            bio: data.bio || '',
            location: data.location || '',
            website: data.website || '',
            followers: data.followers || 0,
            following: data.following || 0,
            followingIds: data.followingIds || [],
            bannerGradient: data.bannerGradient,
            notificationsEnabled: data.notificationsEnabled,
            chatCode: chatCode,
          });

        }
      });
      
      return () => unsubscribeDoc();
    });

    return () => unsubscribeAuth();
  }, []);

  return profile;
}

export function usePosts() {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged(user => {
      if (!user) {
        setPosts([]);
        return;
      }
      const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
      const unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
        const postsData: Post[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          postsData.push({
            id: doc.id,
            authorId: data.authorId,
            authorName: data.authorName,
            authorHandle: data.authorHandle,
            authorInitials: data.authorInitials || '?',
            authorAvatarUrl: data.authorAvatarUrl,
            content: data.content,
            imageUrl: data.imageUrl,
            timestamp: data.timestamp,
            likes: data.likes || 0,
            isLiked: data.likes > 0, // simple mock for now
            comments: data.comments || [],
            isOwn: data.authorId === user.uid,
          });
        });
        setPosts(postsData);
      });
      return () => unsubscribeSnapshot();
    });

    return () => unsubscribeAuth();
  }, []);

  return [posts, setPosts] as const;
}

export const postStore = {
  addPost: async (post: Omit<Post, 'id' | 'isOwn'>) => {
    try {
      await addDoc(collection(db, 'posts'), {
        ...post,
        createdAt: serverTimestamp()
      });
    } catch (e) {
      console.error('Error adding post: ', e);
    }
  },
  deletePost: async (id: string) => {
    try {
      if (!auth.currentUser) return;
      await deleteDoc(doc(db, 'posts', id));
    } catch (e) {
      console.error('Error deleting post: ', e);
    }
  },
  updatePost: async (id: string, updated: Partial<Post>) => {
    try {
      await updateDoc(doc(db, 'posts', id), updated);
    } catch (e) {
      console.error('Error updating post: ', e);
    }
  },
  addComment: async (postId: string, comment: PostComment, currentComments: PostComment[]) => {
    try {
      await updateDoc(doc(db, 'posts', postId), {
        comments: [...currentComments, comment]
      });
    } catch (e) {
      console.error('Error adding comment: ', e);
    }
  },
  deleteComment: async (postId: string, commentId: string, currentComments: PostComment[]) => {
    try {
      await updateDoc(doc(db, 'posts', postId), {
        comments: currentComments.filter(c => c.id !== commentId)
      });
    } catch (e) {
      console.error('Error deleting comment: ', e);
    }
  }
};

let globalActiveTab: Tab = 'feed';
let tabListeners: ((tab: Tab) => void)[] = [];

export const navStore = {
  getTab: () => globalActiveTab,
  setTab: (tab: Tab) => {
    globalActiveTab = tab;
    tabListeners.forEach(l => l(globalActiveTab));
  },
  subscribe: (listener: (tab: Tab) => void) => {
    tabListeners.push(listener);
    return () => {
      tabListeners = tabListeners.filter(l => l !== listener);
    };
  }
};

export function useNav() {
  const [tab, setTab] = useState(globalActiveTab);
  useEffect(() => {
    return navStore.subscribe(setTab);
  }, []);
  return [tab, navStore.setTab] as const;
}

export function useSearchUsers() {
  const [users, setUsers] = useState<SearchUser[]>([]);

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged(user => {
      if (!user) {
        setUsers([]);
        return;
      }
      const q = query(collection(db, 'users'));
      const unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
        const usersData: SearchUser[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          if (data.uid !== user.uid) {
            usersData.push({
              id: data.uid,
              name: data.displayName || 'User',
              handle: `@${data.username || 'user'}`,
              initials: (data.displayName || 'U').substring(0, 2).toUpperCase(),
              avatarUrl: data.photoURL,
              bio: data.bio || '',
              followers: data.followers || 0,
              chatCode: data.chatCode,
              following: data.following || 0,
              color: 'from-violet-500 to-cyan-500' // default gradient
            });
          }
        });
        setUsers(usersData);
      });
      return () => unsubscribeSnapshot();
    });

    return () => unsubscribeAuth();
  }, []);

  return users;
}


export const chatStore = {
  createSession: async (participantId: string, currentProfile: UserProfile | null) => {
    if (!currentProfile) return null;
    const sortedIds = [currentProfile.id, participantId].sort();
    const chatId = `${sortedIds[0]}_${sortedIds[1]}`;
    const chatRef = doc(db, 'chats', chatId);
    const docSnap = await getDoc(chatRef);
    if (!docSnap.exists()) {
      await setDoc(chatRef, {
        participants: sortedIds,
        updatedAt: serverTimestamp(),
        unreadCounts: {
          [sortedIds[0]]: 0,
          [sortedIds[1]]: 0
        },
        messages: []
      });
    }
    return chatId;
  },
  addMessage: async (sessionId: string, message: Omit<ChatMessage, 'id' | 'timestamp' | 'isRead'>, currentProfile: UserProfile | null, chatSession: ChatSession) => {
    if (!currentProfile) return;
    try {
      const chatRef = doc(db, 'chats', sessionId);
      const newMessage: ChatMessage = {
        ...message,
        id: Date.now().toString(),
        timestamp: 'Just now',
        isRead: false
      };
      const newMessages = [...chatSession.messages, newMessage];
      const participantId = chatSession.participantId;
      await updateDoc(chatRef, {
        messages: newMessages,
        updatedAt: serverTimestamp(),
        [`unreadCounts.${participantId}`]: (chatSession.unreadCount || 0) + 1
      });
    } catch (e) {
      console.error(e);
    }
  },
  markAsRead: async (sessionId: string, currentProfile: UserProfile | null) => {
    if (!currentProfile) return;
    try {
      const chatRef = doc(db, 'chats', sessionId);
      await updateDoc(chatRef, {
        [`unreadCounts.${currentProfile.id}`]: 0
      });
    } catch (e) {
      console.error(e);
    }
  }
};

export function useChats(currentProfile: UserProfile | null) {
  const [chats, setChats] = useState<ChatSession[]>([]);

  useEffect(() => {
    if (!currentProfile) {
      setChats([]);
      return;
    }
    const q = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', currentProfile.id),
      orderBy('updatedAt', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chatsData: ChatSession[] = [];
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        const otherParticipantId = data.participants.find((id: string) => id !== currentProfile.id) || currentProfile.id;
        chatsData.push({
          id: docSnap.id,
          participantId: otherParticipantId,
          unreadCount: data.unreadCounts?.[currentProfile.id] || 0,
          messages: data.messages || []
        });
      });
      setChats(chatsData);
    });
    return () => unsubscribe();
  }, [currentProfile]);

  return [chats, setChats] as const;
}

let isNotificationSheetOpen = false;
let notificationListeners: ((isOpen: boolean) => void)[] = [];
export const notificationStore = {
  isOpen: () => isNotificationSheetOpen,
  open: () => {
    isNotificationSheetOpen = true;
    notificationListeners.forEach(l => l(isNotificationSheetOpen));
  },
  close: () => {
    isNotificationSheetOpen = false;
    notificationListeners.forEach(l => l(isNotificationSheetOpen));
  },
  subscribe: (listener: (isOpen: boolean) => void) => {
    notificationListeners.push(listener);
    return () => {
      notificationListeners = notificationListeners.filter(l => l !== listener);
    };
  }
};
export function useNotificationSheet() {
  const [isOpen, setIsOpen] = useState(isNotificationSheetOpen);
  useEffect(() => notificationStore.subscribe(setIsOpen), []);
  return { isOpen, open: notificationStore.open, close: notificationStore.close };
}

let globalActiveChatId: string | null = null;
let activeChatListeners: ((id: string | null) => void)[] = [];

export const chatNavStore = {
  setActiveChat: (id: string | null) => {
    globalActiveChatId = id;
    activeChatListeners.forEach(l => l(globalActiveChatId));
  },
  subscribe: (listener: (id: string | null) => void) => {
    activeChatListeners.push(listener);
    return () => {
      activeChatListeners = activeChatListeners.filter(l => l !== listener);
    };
  }
};

export function useActiveChat() {
  const [activeChat, setActiveChat] = useState<string | null>(globalActiveChatId);
  useEffect(() => chatNavStore.subscribe(setActiveChat), []);
  return [activeChat, chatNavStore.setActiveChat] as const;
}
