import { motion, AnimatePresence } from 'motion/react';
import { X, UserX } from 'lucide-react';
import { useProfile, useSearchUsers, profileStore } from '../../store';

interface FollowersModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'followers' | 'following' | null;
}

export function FollowersModal({ isOpen, onClose, type }: FollowersModalProps) {
  const profile = useProfile();
  const searchUsers = useSearchUsers();

  if (!profile) return null;

  // Filter real users
  const listUsers = (searchUsers || []).filter(u => {
    if (type === 'following') {
      return profile.followingIds?.includes(u.id);
    }
    // For followers, check if other user's following list or basic match
    return false;
  });

  const handleToggleFollow = (userId: string) => {
    if (profile) {
      profileStore?.toggleFollowUser?.(userId, profile);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && type && (
        <div className="fixed inset-0 z-[100] flex flex-col justify-end max-w-[420px] mx-auto">
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
            className="relative w-full h-[70%] bg-white border-t border-slate-200/80 rounded-t-3xl flex flex-col shadow-[0_-10px_40px_rgba(15,23,42,0.1)]"
          >
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-12 h-1.5 bg-slate-200 rounded-full" />
            </div>
            <div className="px-5 pb-4 border-b border-slate-200/80 flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-900 capitalize">{type}</h2>
              <button onClick={onClose} className="p-1.5 bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {listUsers.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                    <UserX className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {type === 'following' ? 'Not following anyone yet' : 'No followers yet'}
                  </h3>
                  <p className="text-xs text-slate-500 max-w-[200px]">
                    Search for Linkora users to discover and follow people.
                  </p>
                </div>
              ) : (
                listUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 bg-white shadow-xs">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full bg-gradient-to-tr ${user.color || 'from-blue-600 to-sky-500'} p-[2px] shadow-xs`}>
                        <div className="w-full h-full bg-white rounded-full flex items-center justify-center overflow-hidden">
                          {user.avatarUrl ? (
                            <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xs font-bold text-slate-800">{user.initials}</span>
                          )}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-900">{user.name}</div>
                        <div className="text-xs font-medium text-blue-600">{user.handle}</div>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleToggleFollow(user.id)}
                      className="px-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-bold text-slate-700 transition-colors shadow-xs"
                    >
                      Unfollow
                    </button>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

