import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Search } from 'lucide-react';
import { useSearchUsers } from '../../store';

interface NewChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectUser: (userId: string) => void;
}

export function NewChatModal({ isOpen, onClose, onSelectUser }: NewChatModalProps) {
  const users = useSearchUsers();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredUsers = (users || []).filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.handle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-[8px] z-50"
            onClick={onClose}
          />
          <motion.div 
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-x-0 bottom-0 bg-white/95 backdrop-blur-2xl border-t border-slate-200/80 rounded-t-3xl z-50 h-[80vh] flex flex-col shadow-[0_-10px_40px_rgba(15,23,42,0.1)]"
          >
            <div className="flex items-center justify-between p-5 pb-3 border-b border-slate-200/80 shrink-0">
              <h2 className="text-lg font-bold text-slate-900">New Message</h2>
              <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 shrink-0">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-slate-400" />
                </div>
                <input 
                  type="text" 
                  placeholder="Search people..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-100 border border-slate-200/80 rounded-xl pl-9 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all font-medium"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-2">
              <div className="space-y-1 p-2">
                {filteredUsers.map(user => (
                  <button 
                    key={user.id}
                    onClick={() => onSelectUser(user.id)}
                    className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-100/80 transition-colors border border-transparent hover:border-slate-200/60 text-left"
                  >
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-tr ${user.color} p-[2px] shrink-0`}>
                       <div className="w-full h-full bg-white rounded-full flex items-center justify-center overflow-hidden">
                          {user.avatarUrl ? (
                            <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-sm font-bold text-slate-800">{user.initials}</span>
                          )}
                       </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-[15px] font-bold text-slate-900 truncate">{user.name}</h3>
                      <p className="text-[13px] text-slate-500 truncate">{user.handle}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
