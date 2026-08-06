import { motion, AnimatePresence } from 'motion/react';
import { Heart, MessageSquare, Share2, MoreHorizontal, Trash2, Edit2 } from 'lucide-react';
import React, { useState } from 'react';
import { postStore, useProfile } from '../../store';
import type { Post } from '../../types';

interface PostCardProps {
  key?: string | number;
  post: Post;
  onOpenComments: (post: Post) => void;
  onDeletePost: (postId: string) => void;
}

export function PostCard({ post, onOpenComments, onDeletePost }: PostCardProps) {
  const [showOptions, setShowOptions] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  
  const currentUser = useProfile();
  if (!currentUser) return null;

  const isAuthor = currentUser?.id === post.authorId;

  const handleLike = () => {
    postStore?.updatePost?.(post.id, {
      isLiked: !post.isLiked,
      likes: post.isLiked ? post.likes - 1 : post.likes + 1
    });
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      onDeletePost(post.id);
    }
    setShowOptions(false);
  };

  const handleSaveEdit = () => {
    if (!editContent.trim()) return;
    postStore?.updatePost?.(post.id, { content: editContent });
    setIsEditing(false);
  };

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      className="p-4 rounded-3xl bg-white/85 backdrop-blur-xl border border-slate-200/90 shadow-[0_4px_16px_rgba(15,23,42,0.04)]"
    >
      <div className="flex justify-between items-start mb-3 relative">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-600 to-sky-500 p-[2px] shadow-sm">
            <div className="w-full h-full bg-white rounded-full flex items-center justify-center overflow-hidden">
               {post.authorAvatarUrl ? (
                 <img src={post.authorAvatarUrl} alt={post.authorName} className="w-full h-full object-cover" />
               ) : (
                 <span className="text-sm font-bold text-slate-700">{post.authorInitials}</span>
               )}
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <h4 className="text-[15px] font-bold text-slate-900">{post.authorName}</h4>
              <span className="text-xs font-medium text-slate-500">{post.timestamp}</span>
            </div>
            <p className="text-[13px] font-medium text-blue-600">{post.authorHandle}</p>
          </div>
        </div>
        
        {isAuthor && (
          <div className="relative">
            <button 
              onClick={() => setShowOptions(!showOptions)}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>
            
            <AnimatePresence>
              {showOptions && (
                <>
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[5]" 
                    onClick={() => setShowOptions(false)}
                  />
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    className="absolute right-0 top-full mt-1 w-36 bg-white border border-slate-200 rounded-2xl shadow-xl z-10 overflow-hidden"
                  >
                    <button 
                      onClick={() => { setIsEditing(true); setShowOptions(false); }}
                      className="w-full flex items-center gap-2 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <Edit2 className="w-4 h-4 text-blue-500" />
                      Edit
                    </button>
                    <div className="h-[1px] bg-slate-100 w-full" />
                    <button 
                      onClick={handleDelete}
                      className="w-full flex items-center gap-2 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
      
      {isEditing ? (
        <div className="mb-4 space-y-2">
          <textarea 
            value={editContent}
            onChange={e => setEditContent(e.target.value)}
            className="w-full bg-slate-50 text-slate-900 font-medium border border-blue-200 rounded-xl p-3 text-[15px] resize-none focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            rows={4}
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <button 
              onClick={() => setIsEditing(false)}
              className="px-4 py-1.5 rounded-lg text-sm font-bold text-slate-500 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleSaveEdit}
              disabled={!editContent.trim()}
              className="px-4 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-sm font-bold hover:bg-blue-100 transition-colors disabled:opacity-50"
            >
              Save
            </button>
          </div>
        </div>
      ) : (
        <p className="text-[15px] text-slate-900 font-medium leading-relaxed mb-4 whitespace-pre-wrap">
          {post.content}
        </p>
      )}
      
      {post.imageUrl && !isEditing && (
        <div className="w-full rounded-2xl overflow-hidden mb-4 border border-slate-200/80 bg-slate-100/50 shadow-sm">
          <img src={post.imageUrl} alt="Post attachment" className="w-full h-auto max-h-[300px] object-cover" />
        </div>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-slate-200/80">
        <button 
          onClick={handleLike}
          className="flex items-center gap-2 group transition-colors"
        >
          <div className={`p-2 rounded-full transition-colors ${post.isLiked ? 'bg-red-50' : 'group-hover:bg-slate-100'}`}>
            <Heart className={`w-5 h-5 transition-all ${post.isLiked ? 'fill-red-500 text-red-500 scale-110 drop-shadow-sm' : 'text-slate-400 group-hover:text-slate-600'}`} />
          </div>
          <span className={`text-sm font-bold ${post.isLiked ? 'text-red-500' : 'text-slate-500 group-hover:text-slate-700'}`}>
            {post.likes}
          </span>
        </button>
        
        <button 
          onClick={() => onOpenComments(post)}
          className="flex items-center gap-2 group transition-colors"
        >
          <div className="p-2 rounded-full group-hover:bg-blue-50 transition-colors">
            <MessageSquare className="w-5 h-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
          </div>
          <span className="text-sm font-bold text-slate-500 group-hover:text-blue-500 transition-colors">
            {post.comments.length}
          </span>
        </button>
        
        <button className="flex items-center gap-2 group transition-colors mr-2">
          <div className="p-2 rounded-full group-hover:bg-slate-100 transition-colors">
            <Share2 className="w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-colors" />
          </div>
        </button>
      </div>
    </motion.div>
  );
}
