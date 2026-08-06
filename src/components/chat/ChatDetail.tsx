import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Send, Paperclip, Smile, Check, CheckCheck, X } from 'lucide-react';
import { useProfile, chatStore } from '../../store';
import type { ChatSession, SearchUser } from '../../types';

interface ChatDetailProps {
  session: ChatSession;
  participant: SearchUser;
  onBack: () => void;
}

export function ChatDetail({ session, participant, onBack }: ChatDetailProps) {
  const profile = useProfile();
  if (!profile) return null;
  const [inputText, setInputText] = useState('');
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Mark as read when opened
  useEffect(() => {
    if (session.unreadCount > 0) {
      chatStore?.markAsRead?.(session.id, profile);
    }
  }, [session.id, session.unreadCount]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [session.messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if ((!inputText.trim() && !selectedMedia) || !profile) return;

    const newMessage = {
      senderId: profile.id,
      text: inputText.trim(),
      imageUrl: selectedMedia || undefined
    };

    chatStore?.addMessage?.(session.id, newMessage, profile, session);
    setInputText('');
    setSelectedMedia(null);
  };

  const handleAttach = () => {
    setSelectedMedia('https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&q=80&w=800');
  };

  return (
    <motion.div 
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="absolute inset-0 z-50 bg-[#F8FAFC] flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-3 border-b border-slate-200/80 bg-white/95 backdrop-blur-md z-10 shrink-0 shadow-xs">
        <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-700 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="relative shrink-0">
            <div className={`w-10 h-10 rounded-full bg-gradient-to-tr ${participant.color} p-[2px]`}>
              <div className="w-full h-full bg-white rounded-full flex items-center justify-center overflow-hidden">
                {participant.avatarUrl ? (
                  <img src={participant.avatarUrl} alt={participant.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-sm font-bold text-slate-800">{participant.initials}</span>
                )}
              </div>
            </div>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-[15px] font-bold text-slate-900 truncate">
              {participant.name}
            </h2>
            <p className="text-[12px] text-emerald-600 font-semibold">{inputText ? 'Typing...' : 'Online'}</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {session.messages.map((msg, i) => {
          const isOwn = msg.senderId === profile.id;
          return (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={msg.id} 
              className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
            >
              {!isOwn && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-500 to-blue-600 p-[1.5px] shrink-0 mr-2 mt-auto">
                  <div className="w-full h-full bg-white rounded-full flex items-center justify-center overflow-hidden">
                    {participant.avatarUrl ? (
                      <img src={participant.avatarUrl} alt={participant.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[10px] font-bold text-slate-800">{participant.initials}</span>
                    )}
                  </div>
                </div>
              )}
              <div className={`max-w-[75%] rounded-2xl p-3.5 ${
                isOwn 
                  ? 'bg-gradient-to-br from-blue-600 to-sky-600 rounded-br-xs text-white shadow-xs' 
                  : 'bg-white rounded-bl-xs border border-slate-200/90 text-slate-900 shadow-xs'
              }`}>
                {msg.imageUrl && (
                  <div className="mb-2 rounded-xl overflow-hidden border border-slate-200/50">
                    <img src={msg.imageUrl} alt="attachment" className="w-full h-auto object-cover max-h-[200px]" />
                  </div>
                )}
                {msg.text && (
                  <p className="text-[15px] leading-relaxed break-words font-medium">{msg.text}</p>
                )}
                <div className={`flex items-center gap-1 mt-1.5 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                  <span className={`text-[11px] font-medium ${isOwn ? 'text-white/80' : 'text-slate-400'}`}>
                    {msg.timestamp}
                  </span>
                  {isOwn && (
                    msg.isRead ? <CheckCheck className="w-3.5 h-3.5 text-sky-200" /> : <Check className="w-3.5 h-3.5 text-white/70" />
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
        <div ref={messagesEndRef} className="h-2" />
      </div>

      {/* Input */}
      <div className="p-4 bg-white/95 backdrop-blur-md border-t border-slate-200/80 pb-safe shrink-0 shadow-sm">
        <AnimatePresence>
          {selectedMedia && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="mb-3 relative inline-block"
            >
              <img src={selectedMedia} alt="preview" className="h-20 w-auto rounded-lg object-cover border border-slate-200" />
              <button 
                type="button"
                onClick={() => setSelectedMedia(null)}
                className="absolute -top-2 -right-2 w-6 h-6 bg-slate-800 rounded-full flex items-center justify-center text-white shadow-md"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
        <form onSubmit={handleSend} className="flex gap-3 items-end">
          <div className="flex-1 relative">
            <input 
              type="text" 
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder="Message..."
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-11 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-sm font-medium"
            />
            <button 
              type="button" 
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors"
            >
              <Smile className="w-5 h-5" />
            </button>
            <button 
              type="button" 
              onClick={handleAttach}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors transform rotate-45"
            >
              <Paperclip className="w-5 h-5" />
            </button>
          </div>
          <button 
            type="submit"
            disabled={!inputText.trim() && !selectedMedia}
            className="w-11 h-11 rounded-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center shrink-0 disabled:opacity-50 disabled:cursor-not-allowed shadow-md text-white transition-colors"
          >
            <Send className="w-5 h-5 ml-0.5" />
          </button>
        </form>
      </div>
    </motion.div>
  );
}
