import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, MessageSquare, MapPin } from 'lucide-react';
import { useProfile, profileStore, usePosts, postStore, navStore, chatStore, chatNavStore } from '../../store';
import { PostCard } from '../feed/PostCard';
import type { SearchUser } from '../../types';
import { useState } from 'react';
import { CommentSheet } from '../feed/CommentSheet';

interface OtherUserProfileProps {
  user: SearchUser;
  isOpen: boolean;
  onClose: () => void;
}

export function OtherUserProfile({ user, isOpen, onClose }: OtherUserProfileProps) {
  const profile = useProfile();
  if (!profile) return null;

  const [posts, setPosts] = usePosts();
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
  
  const isFollowing = profile?.followingIds.includes(user.id) || false;
  const userPosts = posts.filter(p => p.authorId === user.id);
  
  const activeCommentPost = activeCommentPostId 
    ? posts.find(p => p.id === activeCommentPostId) || null 
    : null;

  const handleFollowToggle = () => {
    if (profile) profileStore.toggleFollowUser(user.id, profile);
  };

  const handleDeletePost = (targetPostId: string) => {
    postStore?.deletePost?.(targetPostId);
    setPosts(prevPosts => prevPosts.filter(p => p.id !== targetPostId));
  };

  const handleMessage = async () => {
    onClose();
    const sessionId = await chatStore?.createSession?.(user.id, profile);
    if (sessionId) {
      chatNavStore.setActiveChat(sessionId);
      navStore.setTab('chats');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="absolute inset-0 z-50 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#F1F5F9] to-[#E0F2FE] flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-5 pt-6 pb-4 border-b border-slate-200/50 sticky top-0 bg-white/60 backdrop-blur-xl z-10 shadow-sm">
            <button onClick={onClose} className="p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-bold text-slate-900">{user.name}</h1>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {/* Cover Banner */}
            <div className={`relative h-32 bg-gradient-to-br ${user.color.replace('violet', 'blue')} overflow-hidden opacity-90 shadow-inner`}>
              <div className="absolute inset-0 bg-gradient-to-t from-[#F1F5F9] to-transparent opacity-90" />
            </div>
            
            <div className="px-5 -mt-12 relative z-10">
              <div className="flex justify-between items-end mb-4">
                <div className="relative w-24 h-24 rounded-full bg-white p-1 shadow-md">
                  <div className={`w-full h-full rounded-full bg-gradient-to-br ${user.color.replace('violet', 'blue')} overflow-hidden flex items-center justify-center border-[2px] border-white ring-4 ring-slate-100`}>
                     {user.avatarUrl ? (
                       <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                     ) : (
                       <span className="text-2xl font-bold text-white shadow-sm">
                         {user.initials}
                       </span>
                     )}
                  </div>
                </div>
                <div className="flex items-center gap-2 pb-2">
                  <button 
                    onClick={handleMessage}
                    className="w-10 h-10 rounded-full flex items-center justify-center bg-white border border-slate-200 text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors shadow-sm"
                  >
                    <MessageSquare className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={handleFollowToggle}
                    className={`px-6 py-2 rounded-full text-[14px] font-bold transition-all shadow-sm ${
                      isFollowing 
                        ? 'bg-transparent border border-slate-300 text-slate-600 hover:border-slate-400 hover:bg-white/50' 
                        : 'bg-slate-900 border border-slate-900 text-white hover:bg-slate-800 hover:shadow-md'
                    }`}
                  >
                    {isFollowing ? 'Following' : 'Follow'}
                  </button>
                </div>
              </div>

              <div className="space-y-3 mt-2 bg-white/60 backdrop-blur-md rounded-3xl p-5 border border-slate-200/50 shadow-[0_4px_16px_rgba(15,23,42,0.02)]">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">{user.name}</h2>
                  <p className="text-blue-600 text-[15px] font-medium mt-0.5">{user.handle}</p>
                </div>
                
                <p className="text-[15px] text-slate-600 font-medium leading-relaxed whitespace-pre-wrap">
                  {user.bio}
                </p>
                
                <div className="flex items-center gap-6 pt-4 border-t border-slate-200/50">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-[18px] font-bold text-slate-900">{user.followers + (isFollowing ? 1 : 0)}</span> 
                    <span className="text-slate-500 text-[11px] font-bold uppercase tracking-widest">Followers</span>
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-[18px] font-bold text-slate-900">{user.following}</span> 
                    <span className="text-slate-500 text-[11px] font-bold uppercase tracking-widest">Following</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Posts */}
            <div className="p-5">
              <h3 className="text-sm font-bold text-slate-400 mb-4 uppercase tracking-widest ml-1">Posts</h3>
              {userPosts.length > 0 ? (
                <div className="space-y-4">
                  {userPosts.map(post => (
                    <PostCard 
                      key={post.id}
                      post={post}
                      onOpenComments={(p) => setActiveCommentPostId(p.id)}
                      onDeletePost={handleDeletePost}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-white/50 backdrop-blur-sm rounded-3xl border border-slate-200/50">
                  <p className="text-[15px] font-medium text-slate-500">No posts yet from {user.name}.</p>
                </div>
              )}
            </div>
            
            <div className="h-10" />
          </div>

          <CommentSheet 
            post={activeCommentPost} 
            isOpen={!!activeCommentPostId} 
            onClose={() => setActiveCommentPostId(null)} 
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
