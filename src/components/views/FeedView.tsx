import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Image as ImageIcon, Bell, Plus } from 'lucide-react';
import { PostCard } from '../feed/PostCard';
import { CreatePostModal } from '../feed/CreatePostModal';
import { CommentSheet } from '../feed/CommentSheet';
import { usePosts, useProfile, postStore } from '../../store';

export function FeedView() {
  const [posts] = usePosts();
  const profile = useProfile();
  const [activeFilter, setActiveFilter] = useState<'for-you' | 'following'>('for-you');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);

  // Derive active post directly from store to ensure comments stay fresh
  const activeCommentPost = activeCommentPostId 
    ? posts.find(p => p.id === activeCommentPostId) || null 
    : null;

  const handleDeletePost = (targetPostId: string) => {
    postStore?.deletePost?.(targetPostId);
  };
  
  if (!profile) return (
    <div className="flex-1 flex items-center justify-center h-full bg-slate-50">
      <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
    </div>
  );

  return (
    <>
      <div className="flex flex-col h-full relative bg-[#F8FAFC]">
        {/* Sticky Tab Switcher */}
        <div className="px-4 py-2.5 sticky top-0 bg-white/95 backdrop-blur-md z-10 shrink-0 border-b border-slate-200/80 shadow-xs">
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/80">
            <button 
              onClick={() => setActiveFilter('for-you')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${activeFilter === 'for-you' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              For You
            </button>
            <button 
              onClick={() => setActiveFilter('following')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${activeFilter === 'following' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Following
            </button>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Create Post Trigger Card */}
          <div 
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-3 p-4 rounded-3xl bg-white/85 backdrop-blur-xl border border-slate-200/80 hover:bg-white hover:scale-[1.01] transition-all cursor-text group shadow-[0_4px_16px_rgba(15,23,42,0.04)]"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-sky-500 p-[2px] shrink-0">
              <div className="w-full h-full bg-white rounded-full flex items-center justify-center overflow-hidden">
                {profile.avatarUrl ? (
                  <img src={profile.avatarUrl} alt={profile.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs font-bold text-slate-700">{profile.initials}</span>
                )}
              </div>
            </div>
            <div className="flex-1 text-[15px] font-medium text-slate-400 group-hover:text-slate-500 transition-colors">
              What's on your mind?
            </div>
            <div className="flex gap-2">
               <button className="p-2 text-blue-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors">
                 <ImageIcon className="w-5 h-5" />
               </button>
            </div>
          </div>

          {/* Posts Feed */}
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {posts.length > 0 ? (
                posts.map(post => (
                  <PostCard 
                    key={post.id} 
                    post={post} 
                    onOpenComments={(p) => setActiveCommentPostId(p.id)}
                    onDeletePost={handleDeletePost} 
                  />
                ))
              ) : (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center justify-center py-16 text-center space-y-4"
                >
                  <div className="w-20 h-20 rounded-3xl bg-white/80 flex items-center justify-center border border-slate-200/80 shadow-lg shadow-slate-200/50">
                    <ImageIcon className="w-8 h-8 text-slate-400" />
                  </div>
                  <div>
                    <h3 className="text-slate-900 font-bold text-[18px]">No posts yet</h3>
                    <p className="text-slate-500 text-[15px] mt-2 max-w-[240px] mx-auto leading-relaxed font-medium">
                      Tap '+' to create your first post!
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <div className="h-24" /> {/* Bottom spacer for nav */}
        </div>

        {/* Floating Action Button (+) */}
        <button 
          onClick={() => setIsCreateOpen(true)}
          className="fixed right-5 bottom-20 w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-sky-500 flex items-center justify-center shadow-[0_8px_20px_rgba(37,99,235,0.3)] text-white hover:scale-105 active:scale-95 transition-all z-20 cursor-pointer"
          title="Create Post"
        >
          <Plus className="w-7 h-7" />
        </button>
      </div>

      <CreatePostModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
      <CommentSheet 
        post={activeCommentPost} 
        isOpen={!!activeCommentPostId} 
        onClose={() => setActiveCommentPostId(null)} 
      />
    </>
  );
}
