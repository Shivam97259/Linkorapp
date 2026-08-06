import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search as SearchIcon, Plus, Key, Bell, Sparkles } from 'lucide-react';
import { useChats, useSearchUsers, chatStore, useProfile, useActiveChat } from '../../store';
import { ChatDetail } from '../chat/ChatDetail';
import { NewChatModal } from '../chat/NewChatModal';
import { JoinChatCodeModal } from '../chat/JoinChatCodeModal';

export function ChatsView() {
  const profile = useProfile();
  const [chats] = useChats(profile);
  const searchUsers = useSearchUsers();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSessionId, setActiveSessionId] = useActiveChat();
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  const [isJoinCodeModalOpen, setIsJoinCodeModalOpen] = useState(false);

  const activeSession = chats?.find(c => c.id === activeSessionId);
  const activeParticipant = activeSession ? searchUsers?.find(u => u.id === activeSession.participantId) : null;

  const filteredChats = chats?.filter(chat => {
    const participant = searchUsers?.find(u => u.id === chat.participantId);
    if (!participant) return false;
    return participant.name.toLowerCase().includes(searchQuery.toLowerCase());
  }) || [];

  const handleStartNewChat = async (userId: string) => {
    const sessionId = await chatStore?.createSession?.(userId, profile);
    if (sessionId) {
      setActiveSessionId(sessionId);
    }
    setIsNewChatModalOpen(false);
    setIsJoinCodeModalOpen(false);
  };

  if (!profile) return (
    <div className="flex-1 flex items-center justify-center h-full bg-slate-50">
      <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
    </div>
  );

  return (
    <>
      <div className="flex flex-col h-full bg-[#F8FAFC]">
        {/* Search Bar Bar */}
        <div className="px-4 py-3 bg-white/95 backdrop-blur-md border-b border-[#E2E8F0] sticky top-0 z-10 shrink-0 shadow-xs">
          <div className="flex gap-2 items-center">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <SearchIcon className="h-4 w-4 text-[#475569]" />
              </div>
              <input 
                type="text" 
                placeholder="Search Linkora..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-[#F1F5F9] border border-[#CBD5E1] rounded-xl pl-10 pr-3 py-2 text-sm font-medium text-[#0F172A] placeholder:text-[#64748B] focus:outline-none focus:border-blue-600 focus:bg-white transition-all shadow-xs"
              />
            </div>
            <button 
              onClick={() => setIsJoinCodeModalOpen(true)}
              className="h-[38px] px-3.5 bg-white border border-[#CBD5E1] hover:bg-slate-50 text-[#0F172A] font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shrink-0 shadow-xs cursor-pointer"
              title="Join via Chat Key"
            >
              <span className="text-sm">🔑</span>
              <span>Chat Key</span>
            </button>
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-3">
            {filteredChats.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                <div className="w-20 h-20 rounded-3xl bg-white/80 flex items-center justify-center border border-slate-200/80 shadow-lg shadow-slate-200/50">
                  <SearchIcon className="w-8 h-8 text-slate-400" />
                </div>
                <div>
                  <h3 className="text-slate-900 font-bold text-[18px]">No active conversations</h3>
                  <p className="text-slate-500 text-[15px] mt-2 max-w-[260px] mx-auto leading-relaxed font-medium">
                    Search users or use a 6-digit Chat Key to connect.
                  </p>
                </div>
              </div>
            ) : (
              filteredChats.map((chat) => {
                const participant = (searchUsers || []).find(u => u.id === chat.participantId);
                if (!participant) return null;
                
                const lastMessage = chat.messages[chat.messages.length - 1];
                const unread = chat.unreadCount > 0;

                return (
                  <div 
                    key={chat.id} 
                    onClick={() => setActiveSessionId(chat.id)}
                    className="flex items-center gap-4 p-3.5 rounded-2xl bg-white/85 backdrop-blur-xl hover:bg-white hover:scale-[1.01] transition-all cursor-pointer border border-slate-200/80 shadow-[0_4px_20px_rgba(15,23,42,0.03)]"
                  >
                    <div className="relative shrink-0">
                      <div className={`w-14 h-14 rounded-full bg-gradient-to-tr ${participant.color} p-[2px] shadow-sm`}>
                         <div className="w-full h-full bg-white rounded-full flex items-center justify-center overflow-hidden">
                            {participant.avatarUrl ? (
                              <img src={participant.avatarUrl} alt={participant.name} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-[16px] font-bold text-slate-700">{participant.initials}</span>
                            )}
                         </div>
                      </div>
                      {/* Online indicator */}
                      <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-full border-[2.5px] border-white z-10" />
                    </div>
                    
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <div className="flex justify-between items-baseline mb-1">
                        <h3 className={`text-[16px] truncate text-slate-900 ${unread ? 'font-bold' : 'font-semibold'}`}>
                          {participant.name}
                        </h3>
                        <span className={`text-[12px] ${unread ? 'text-blue-600 font-bold' : 'text-slate-500 font-medium'}`}>
                          {lastMessage?.timestamp || ''}
                        </span>
                      </div>
                      <div className="flex justify-between items-center gap-2">
                        <p className={`text-[14px] truncate ${unread ? 'text-slate-700 font-medium' : 'text-slate-500 font-medium'}`}>
                          {lastMessage?.text || (lastMessage?.imageUrl ? '📷 Photo' : 'No messages yet')}
                        </p>
                        {unread && (
                          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-600 to-sky-500 flex items-center justify-center shrink-0 shadow-[0_2px_8px_rgba(37,99,235,0.4)]">
                            <span className="text-[11px] font-bold text-white">{chat.unreadCount}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* FAB */}
        <button 
          onClick={() => setIsJoinCodeModalOpen(true)}
          className="absolute right-5 bottom-24 w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-sky-500 flex items-center justify-center shadow-[0_8px_20px_rgba(37,99,235,0.3)] text-white hover:scale-105 active:scale-95 transition-all z-20"
        >
          <Plus className="w-7 h-7" />
        </button>
      </div>

      <AnimatePresence>
        {activeSessionId && activeSession && activeParticipant && (
          <ChatDetail 
            session={activeSession} 
            participant={activeParticipant} 
            onBack={() => setActiveSessionId(null)} 
          />
        )}
      </AnimatePresence>

      <NewChatModal 
        isOpen={isNewChatModalOpen} 
        onClose={() => setIsNewChatModalOpen(false)} 
        onSelectUser={handleStartNewChat} 
      />

      <JoinChatCodeModal
        isOpen={isJoinCodeModalOpen}
        onClose={() => setIsJoinCodeModalOpen(false)}
        onJoinSuccess={handleStartNewChat}
      />
    </>
  );
}
