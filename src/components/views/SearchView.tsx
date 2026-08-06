import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search as SearchIcon, X, Users, TrendingUp, Hash, MessageCircle } from 'lucide-react';
import { OtherUserProfile } from '../search/OtherUserProfile';
import { useSearchUsers, useProfile, chatStore, navStore, chatNavStore, profileStore } from '../../store';
import type { UserProfile } from '../../types';

export function SearchView() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'All' | 'People' | 'Trending Posts' | 'Hashtags'>('All');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

  const users = useSearchUsers();
  const profile = useProfile();

  const filteredUsers = (users || []).filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.handle.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (u.chatCode && u.chatCode.toLowerCase() === searchQuery.toLowerCase())
  );

  const TRENDING_TOPICS = [
    { tag: '#LinkoraDesign', posts: '12.4k' },
    { tag: '#ReactConf', posts: '8.2k' },
    { tag: '#Cyberpunk', posts: '5.1k' },
    { tag: '#FramerMotion', posts: '3.8k' },
  ];

  const handleStartChat = async (e: React.MouseEvent, userId: string) => {
    e.stopPropagation();
    const sessionId = await chatStore?.createSession?.(userId, profile);
    if (sessionId) {
      chatNavStore.setActiveChat(sessionId);
      navStore.setTab('chats');
    }
  };

  const handleFollowToggle = (e: React.MouseEvent, userId: string) => {
    e.stopPropagation();
    if (profile) profileStore.toggleFollowUser(userId, profile);
  };

  if (!profile) return (
    <div className="flex-1 flex items-center justify-center h-full bg-slate-50">
      <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
    </div>
  );

  return (
    <>
      <div className="flex flex-col h-full bg-[#F8FAFC]">
        {/* Header / Search Bar */}
        <div className="px-4 py-3 border-b border-[#E2E8F0] sticky top-0 bg-white/95 backdrop-blur-md z-10 shadow-xs">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <SearchIcon className="h-4 w-4 text-[#475569]" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Linkora users by name or @handle..."
              className="w-full bg-[#F1F5F9] border border-[#CBD5E1] rounded-xl py-2.5 pl-10 pr-10 text-sm font-medium text-[#0F172A] placeholder:text-[#64748B] focus:outline-none focus:border-blue-600 focus:bg-white transition-all shadow-xs"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#64748B] hover:text-[#0F172A] transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Categories */}
          <div className="flex gap-2 mt-2.5 overflow-x-auto no-scrollbar pb-0.5">
            {(['All', 'People', 'Trending Posts', 'Hashtags'] as const).map(filter => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`whitespace-nowrap px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeFilter === filter 
                    ? 'bg-blue-600 text-white shadow-xs' 
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:text-slate-900 shadow-xs'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-8">
          
          {/* People Section */}
          {(activeFilter === 'All' || activeFilter === 'People') && (
            <section>
              <h2 className="text-[15px] font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-500" /> People to Follow
              </h2>
              
              <div className="space-y-3">
                {filteredUsers.length > 0 ? filteredUsers.map((user) => {
                  const isFollowing = (profile?.followingIds || []).includes(user.id);
                  return (
                    <motion.div 
                      key={user.id}
                      onClick={() => setSelectedUser(user)}
                      className="flex items-center justify-between p-4 rounded-3xl border border-slate-200/90 bg-white/85 backdrop-blur-xl shadow-[0_4px_16px_rgba(15,23,42,0.04)] hover:bg-white transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className={`w-12 h-12 rounded-full bg-gradient-to-tr from-blue-600 to-sky-500 p-[2px] shadow-sm`}>
                           <div className="w-full h-full bg-white rounded-full flex items-center justify-center overflow-hidden">
                              {user.avatarUrl ? (
                                <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-[15px] font-bold text-slate-700">{user.initials}</span>
                              )}
                           </div>
                        </div>
                        <div>
                          <div className="text-[15px] font-bold text-slate-900">{user.name}</div>
                          <div className="text-[13px] font-medium text-blue-600">{user.handle}</div>
                          <div className="text-[13px] font-medium text-slate-500 mt-0.5 max-w-[150px] truncate">{user.bio}</div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <button 
                          onClick={(e) => handleStartChat(e, user.id)}
                          className="w-9 h-9 rounded-full transition-all shadow-sm bg-slate-50 border border-slate-200 text-slate-500 hover:text-blue-600 hover:bg-blue-50 flex items-center justify-center"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={(e) => handleFollowToggle(e, user.id)}
                          className={`px-4 py-1.5 rounded-full text-[13px] font-bold transition-all shadow-sm border ${
                            isFollowing 
                              ? 'bg-transparent border-slate-300 text-slate-500 hover:border-slate-400' 
                              : 'bg-slate-900 border-slate-900 text-white hover:bg-slate-800 hover:shadow-md'
                          }`}
                        >
                          {isFollowing ? 'Following' : 'Follow'}
                        </button>
                      </div>
                    </motion.div>
                  )
                }) : (
                  <div className="text-center p-6 bg-white/80 backdrop-blur-md rounded-3xl border border-slate-200 shadow-sm">
                    <p className="text-[15px] font-medium text-slate-500">
                      No users found. Try searching by another name or handle.
                    </p>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Trending Section */}
          {(activeFilter === 'All' || activeFilter === 'Trending Posts' || activeFilter === 'Hashtags') && (
            <section>
              <h2 className="text-[15px] font-bold text-slate-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-sky-500" /> Trending Topics
              </h2>
              
              <div className="bg-white/85 backdrop-blur-xl border border-slate-200/90 rounded-3xl overflow-hidden shadow-[0_4px_16px_rgba(15,23,42,0.04)]">
                {TRENDING_TOPICS.map((topic, i) => (
                  <div key={i} className="p-4 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-between">
                    <div>
                      <div className="text-[12px] font-bold text-slate-400 mb-1 tracking-wide uppercase">Trending in Tech</div>
                      <div className="text-[15px] font-bold text-slate-900 flex items-center gap-1">
                        <Hash className="w-4 h-4 text-blue-500" />
                        {topic.tag.replace('#', '')}
                      </div>
                    </div>
                    <div className="text-[13px] text-slate-500 font-medium bg-slate-100 px-3 py-1 rounded-full">
                      {topic.posts} posts
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

        </div>
      </div>

      <AnimatePresence>
        {selectedUser && (
          <OtherUserProfile 
            user={selectedUser} 
            isOpen={!!selectedUser} 
            onClose={() => setSelectedUser(null)} 
          />
        )}
      </AnimatePresence>
    </>
  );
}
