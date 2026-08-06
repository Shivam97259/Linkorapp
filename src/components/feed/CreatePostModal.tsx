import { motion, AnimatePresence } from 'motion/react';
import { X, Image as ImageIcon, Smile, Loader2 } from 'lucide-react';
import { useState, useRef, ChangeEvent } from 'react';
import { postStore, useProfile } from '../../store';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreatePostModal({ isOpen, onClose }: CreatePostModalProps) {
  const [content, setContent] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isPosting, setIsPosting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const profile = useProfile();
  if (!profile) return null;

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handlePost = async () => {
    if ((!content.trim() && !selectedImage) || !profile || isPosting) return;
    setIsPosting(true);
    
    await postStore?.addPost?.({
      authorId: profile.id,
      authorName: profile.name,
      authorHandle: profile.handle,
      authorInitials: profile.initials,
      authorAvatarUrl: profile.avatarUrl,
      content,
      imageUrl: selectedImage || undefined,
      timestamp: 'Just now',
      likes: 0,
      isLiked: false,
      comments: []
    });

    setContent('');
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setIsPosting(false);
    onClose();
  };
  
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex flex-col justify-end max-w-[420px] mx-auto">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-[8px]"
            onClick={onClose}
          />
          <motion.div 
            initial={{ y: '100%' }} 
            animate={{ y: 0 }} 
            exit={{ y: '100%' }} 
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="relative w-full h-[85%] bg-white border-t border-slate-200/80 rounded-t-3xl flex flex-col shadow-[0_-10px_40px_rgba(15,23,42,0.1)]"
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center p-4 border-b border-slate-200/80">
              <button 
                onClick={onClose} 
                className="text-slate-500 hover:text-slate-800 transition-colors p-1.5 rounded-full hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
              <h2 className="text-base font-bold text-[#0F172A]">Create Post</h2>
              <button 
                onClick={handlePost}
                disabled={(!content.trim() && !selectedImage) || isPosting}
                className="px-5 py-2 rounded-full bg-[#2563EB] hover:bg-blue-700 text-xs font-bold text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xs flex items-center gap-1.5"
              >
                {isPosting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Post
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="flex-1 p-4 overflow-y-auto">
              <div className="flex gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-sky-500 p-[2px] shrink-0 shadow-xs">
                  <div className="w-full h-full bg-white rounded-full flex items-center justify-center overflow-hidden">
                    {profile.avatarUrl ? (
                      <img src={profile.avatarUrl} alt={profile.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-sm font-bold text-slate-800">{profile.initials}</span>
                    )}
                  </div>
                </div>
                <textarea 
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="What's happening? Share your thoughts..."
                  className="flex-1 bg-transparent text-[#0F172A] font-medium placeholder:text-[#64748B] text-base resize-none focus:outline-none min-h-[140px] pt-1"
                  autoFocus
                />
              </div>

              {/* Real Image Preview */}
              <AnimatePresence>
                {selectedImage && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="relative rounded-2xl overflow-hidden border border-slate-200 mb-4 group shadow-xs bg-slate-50"
                  >
                    <img src={selectedImage} alt="Selected attachment" className="w-full h-56 object-cover" />
                    <button 
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-2.5 right-2.5 p-1.5 bg-slate-900/70 hover:bg-slate-900 text-white rounded-full transition-all shadow-md cursor-pointer"
                      title="Remove image"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Modal Bottom Actions */}
            <div className="p-3.5 px-4 border-t border-slate-200/80 flex items-center gap-3 bg-white pb-safe">
              <input 
                type="file" 
                ref={fileInputRef} 
                accept="image/*" 
                onChange={handleImageChange} 
                className="hidden" 
              />
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors border border-transparent hover:border-blue-100 flex items-center gap-1.5 cursor-pointer"
                title="Add Photo"
              >
                <ImageIcon className="w-5 h-5" />
                <span className="text-xs font-semibold">Photo</span>
              </button>
              <button 
                type="button"
                className="p-2 text-sky-600 hover:bg-sky-50 rounded-xl transition-colors border border-transparent hover:border-sky-100 flex items-center gap-1.5"
                title="Add Emoji"
              >
                <Smile className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
