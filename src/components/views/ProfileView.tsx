import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Link as LinkIcon, Bookmark, Copy, Check, LogOut, Edit3 } from 'lucide-react';
import { useProfile, usePosts, postStore } from '../../store';
import { PostCard } from '../feed/PostCard';
import { CommentSheet } from '../feed/CommentSheet';
import { EditProfileModal } from '../profile/EditProfileModal';
import { FollowersModal } from '../profile/FollowersModal';

type ProfileTab = 'posts' | 'liked';

export function ProfileView() {
  const profile = useProfile();
  const [posts, setPosts] = usePosts();
  const [activeTab, setActiveTab] = useState<ProfileTab>('posts');
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [followersModalType, setFollowersModalType] = useState<'followers' | 'following' | null>(null);
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!profile) return (
    <div className="flex-1 flex items-center justify-center h-full bg-[#F8FAFC]">
      <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
    </div>
  );

  const activeCommentPost = activeCommentPostId 
    ? posts.find(p => p.id === activeCommentPostId) || null 
    : null;

  const displayPosts = activeTab === 'posts' 
    ? posts.filter(p => p.authorId === profile.id || p.isOwn)
    : posts.filter(p => p.isLiked);

  const handleDeletePost = (targetPostId: string) => {
    postStore?.deletePost?.(targetPostId);
  };

  const handleCopyCode = () => {
    if (profile.chatCode) {
      navigator.clipboard.writeText(profile.chatCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <>
      <div className="flex flex-col h-full relative bg-[#F8FAFC]">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="pb-6 overflow-y-auto flex-1"
        >
          {/* Header Banner */}
          <div className="relative h-[120px] bg-gradient-to-r from-blue-500 to-cyan-500 overflow-hidden shadow-xs">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,_rgba(255,255,255,0.25),_transparent)]" />
          </div>
          
          <div className="px-4 relative z-10">
            {/* Avatar & Action Buttons Row */}
            <div className="flex justify-between items-end mb-3 -mt-[44px]">
              {/* Avatar (88px = w-[88px] h-[88px]) */}
              <div className="w-[88px] h-[88px] rounded-full border-[4px] border-white bg-white p-0.5 shadow-md ring-1 ring-slate-200/60 ml-1">
                <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-600 to-sky-500 overflow-hidden flex items-center justify-center">
                  {profile.avatarUrl ? (
                    <img src={profile.avatarUrl} alt={profile.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl font-bold text-white shadow-xs">
                      {profile.initials}
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons Row */}
              <div className="flex items-center gap-2 pb-1">
                <button 
                  onClick={() => setIsEditOpen(true)}
                  className="px-3.5 py-1.5 rounded-full bg-[#F1F5F9] text-[#0F172A] border border-[#CBD5E1] hover:bg-slate-200 transition-all text-xs font-bold shadow-xs flex items-center gap-1.5"
                >
                  <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                  Edit Profile
                </button>
                <button 
                  onClick={() => import('../../firebase').then(m => m.auth.signOut())}
                  className="px-3.5 py-1.5 rounded-full bg-[#FEF2F2] text-[#DC2626] border border-[#FCA5A5] hover:bg-red-100 transition-all text-xs font-bold shadow-xs flex items-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Log Out
                </button>
              </div>
            </div>

            {/* User Info Details Card */}
            <div className="space-y-3 bg-white rounded-2xl p-4 border border-[#E2E8F0] shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
              <div>
                <h2 className="text-xl font-bold text-[#0F172A] tracking-tight">{profile.name}</h2>
                <p className="text-blue-600 text-xs font-semibold mt-0.5">{profile.handle}</p>
              </div>

              {/* Personal Chat Key Card - Redesigned against overflow */}
              {profile.chatCode && (
                <div 
                  className="flex items-center justify-between gap-2 w-full p-3 bg-[#F1F5F9] rounded-xl border border-[#E2E8F0]"
                >
                  <div className="flex items-center gap-1.5 min-w-0 shrink">
                    <span className="text-base shrink-0">🔑</span>
                    <span className="text-[13px] font-semibold text-[#475569] truncate">Chat Key</span>
                  </div>
                  <div className="bg-white text-[#2563EB] font-bold font-mono px-2.5 py-1 rounded-lg border border-[#CBD5E1] text-[13px] tracking-wide shrink-0 shadow-xs">
                    {profile.chatCode}
                  </div>
                  <button 
                    onClick={handleCopyCode}
                    className="bg-[#2563EB] hover:bg-blue-700 text-white rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap cursor-pointer border-none shrink-0 transition-colors shadow-xs flex items-center gap-1"
                  >
                    {copied ? (
                      <><Check className="w-3.5 h-3.5" /> Copied!</>
                    ) : (
                      <><Copy className="w-3.5 h-3.5" /> Copy Key</>
                    )}
                  </button>
                </div>
              )}

              {profile.bio && (
                <p className="text-sm text-slate-700 font-medium leading-relaxed whitespace-pre-wrap">
                  {profile.bio}
                </p>
              )}
              
              {(profile.location || profile.website) && (
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-semibold text-[#64748B] pt-1">
                  {profile.location && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{profile.location}</span>
                    </div>
                  )}
                  {profile.website && (
                    <div className="flex items-center gap-1.5">
                      <LinkIcon className="w-3.5 h-3.5 text-slate-400" />
                      <a href={`https://${profile.website}`} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                        {profile.website}
                      </a>
                    </div>
                  )}
                </div>
              )}
              
              {/* Dynamic Stats Row */}
              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 text-center">
                <div className="flex flex-col items-center">
                  <span className="text-base font-bold text-[#0F172A]">
                    {posts.filter(p => p.authorId === profile.id || p.isOwn).length}
                  </span> 
                  <span className="text-[#64748B] text-[11px] font-semibold uppercase tracking-wider">Posts</span>
                </div>
                <div 
                  onClick={() => setFollowersModalType('followers')}
                  className="flex flex-col items-center cursor-pointer group"
                >
                  <span className="text-base font-bold text-[#0F172A] group-hover:text-blue-600 transition-colors">
                    {profile.followers >= 1000 ? (profile.followers / 1000).toFixed(1) + 'k' : profile.followers}
                  </span> 
                  <span className="text-[#64748B] text-[11px] font-semibold uppercase tracking-wider group-hover:text-slate-900 transition-colors">Followers</span>
                </div>
                <div 
                  onClick={() => setFollowersModalType('following')}
                  className="flex flex-col items-center cursor-pointer group"
                >
                  <span className="text-base font-bold text-[#0F172A] group-hover:text-blue-600 transition-colors">
                    {profile.following}
                  </span> 
                  <span className="text-[#64748B] text-[11px] font-semibold uppercase tracking-wider group-hover:text-slate-900 transition-colors">Following</span>
                </div>
              </div>
            </div>

            {/* Profile Content Tabs Switcher */}
            <div className="flex bg-slate-200/60 p-1 rounded-xl my-4 border border-slate-200/80">
              {(['posts', 'liked'] as ProfileTab[]).map((tab) => (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all capitalize ${
                    activeTab === tab 
                      ? 'bg-white text-[#2563EB] shadow-xs' 
                      : 'text-[#64748B] hover:text-slate-900'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Content Feed */}
            <div>
              <AnimatePresence mode="wait">
                {displayPosts.length > 0 ? (
                  <motion.div 
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                  >
                    {displayPosts.map(post => (
                      <PostCard 
                        key={post.id}
                        post={post}
                        onOpenComments={(p) => setActiveCommentPostId(p.id)}
                        onDeletePost={handleDeletePost}
                      />
                    ))}
                  </motion.div>
                ) : (
                  <motion.div 
                    key={`empty-${activeTab}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex flex-col items-center justify-center py-12 px-4 bg-white rounded-2xl border border-[#E2E8F0] shadow-[0_2px_8px_rgba(0,0,0,0.04)] text-center"
                  >
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                      <Bookmark className="w-5 h-5 text-slate-400" />
                    </div>
                    <h3 className="text-[#0F172A] font-bold text-sm">
                      {activeTab === 'posts' ? 'No posts yet' : 'No liked posts yet'}
                    </h3>
                    <p className="text-[#64748B] text-xs mt-1 max-w-[220px] leading-relaxed font-medium">
                      {activeTab === 'posts' 
                        ? 'When you create posts, they will show up here.'
                        : "When you like posts across Linkora, they'll show up here."}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          
          <div className="h-20" /> {/* Bottom spacer */}
        </motion.div>
      </div>

      <EditProfileModal 
        isOpen={isEditOpen} 
        onClose={() => setIsEditOpen(false)} 
        profile={profile}
      />
      <FollowersModal 
        isOpen={!!followersModalType} 
        onClose={() => setFollowersModalType(null)} 
        type={followersModalType}
      />
      <CommentSheet 
        post={activeCommentPost} 
        isOpen={!!activeCommentPostId} 
        onClose={() => setActiveCommentPostId(null)} 
      />

      <AnimatePresence>
        {copied && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-full shadow-2xl flex items-center gap-2 z-[150]"
          >
            <Check className="w-4 h-4 text-emerald-400" />
            Chat Key copied to clipboard!
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
