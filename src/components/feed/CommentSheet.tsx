import { motion, AnimatePresence } from 'motion/react';
import { X, Send, Trash2 } from 'lucide-react';
import React, { useState } from 'react';
import { postStore, useProfile } from '../../store';
import type { Post } from '../../types';

interface CommentSheetProps {
  post: Post | null;
  isOpen: boolean;
  onClose: () => void;
}

export function CommentSheet({ post, isOpen, onClose }: CommentSheetProps) {
  const [text, setText] = useState('');
  
  const profile = useProfile();
  if (!profile) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !post || !profile) return;
    
    await postStore?.addComment?.(post.id, {
      id: Date.now().toString(),
      authorId: profile?.id,
      authorName: profile.name,
      authorHandle: profile.handle,
      authorInitials: profile.initials,
      authorAvatarUrl: profile.avatarUrl,
      content: text,
      timestamp: 'Just now',
      isOwn: true
    }, post.comments);
    setText('');
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!post) return;
    await postStore?.deleteComment?.(post.id, commentId, post.comments);
  };
  
  return (
    <AnimatePresence>
      {isOpen && post && (
        <div className="absolute inset-0 z-[100] flex flex-col justify-end">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div 
            initial={{ y: '100%' }} 
            animate={{ y: 0 }} 
            exit={{ y: '100%' }} 
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="relative w-full max-h-[85%] min-h-[60%] bg-white/95 backdrop-blur-2xl border-t border-slate-200/80 rounded-t-3xl flex flex-col shadow-[0_-10px_40px_rgba(15,23,42,0.1)]"
          >
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-12 h-1.5 bg-slate-200 rounded-full" />
            </div>
            <div className="px-5 pb-4 border-b border-slate-200/80 flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-900">Comments</h2>
              <button onClick={onClose} className="p-1.5 bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {post.comments.length === 0 ? (
                <div className="text-center font-medium text-slate-500 mt-10">No comments yet. Be the first!</div>
              ) : (
                post.comments.map(comment => (
                  <div key={comment.id} className="flex gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-sky-500 p-[2px] shrink-0 shadow-sm">
                      <div className="w-full h-full bg-white rounded-full flex items-center justify-center overflow-hidden">
                        {comment.authorAvatarUrl ? (
                          <img src={comment.authorAvatarUrl} alt={comment.authorName} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xs font-bold text-slate-700">{comment.authorName.charAt(0)}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="bg-slate-50 rounded-2xl rounded-tl-sm p-3.5 border border-slate-200 shadow-sm">
                        <div className="flex justify-between items-start mb-1">
                          <div>
                            <span className="text-sm font-bold text-slate-900">{comment.authorName}</span>
                            <span className="text-xs font-medium text-slate-500 ml-2">{comment.timestamp}</span>
                          </div>
                          {comment.authorId === profile?.id && (
                            <button 
                              onClick={() => handleDeleteComment(comment.id)} 
                              className="text-slate-400 hover:text-red-500 transition-colors p-1 -mt-1 -mr-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                        <p className="text-[14px] text-slate-700 font-medium leading-relaxed">{comment.content}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="p-4 border-t border-slate-200/80 bg-white/95 backdrop-blur-xl pb-safe">
              <form onSubmit={handleSubmit} className="flex gap-3 items-center">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-sky-500 p-[2px] shrink-0 shadow-sm">
                  <div className="w-full h-full bg-white rounded-full flex items-center justify-center overflow-hidden">
                    {profile.avatarUrl ? (
                      <img src={profile.avatarUrl} alt={profile.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs font-bold text-slate-700">{profile.initials}</span>
                    )}
                  </div>
                </div>
                <input 
                  type="text" 
                  value={text}
                  onChange={e => setText(e.target.value)}
                  placeholder="Add a comment..." 
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-full px-4 py-2.5 text-[15px] font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10 transition-colors shadow-inner"
                />
                <button 
                  type="submit" 
                  disabled={!text.trim()}
                  className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-sky-500 flex items-center justify-center disabled:opacity-50 disabled:grayscale transition-all shrink-0 shadow-[0_2px_8px_rgba(37,99,235,0.3)]"
                >
                  <Send className="w-4 h-4 text-white ml-0.5" />
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
