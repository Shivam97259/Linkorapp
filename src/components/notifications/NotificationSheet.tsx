import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Heart, MessageCircle, UserPlus, Bell } from 'lucide-react';
import type { Notification } from '../../types';

interface NotificationSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationSheet({ isOpen, onClose }: NotificationSheetProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'like': return <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />;
      case 'comment': return <MessageCircle className="w-3.5 h-3.5 text-blue-500 fill-blue-500" />;
      case 'follow': return <UserPlus className="w-3.5 h-3.5 text-sky-500" />;
      default: return <Bell className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

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
            className="fixed inset-x-0 bottom-0 bg-white border-t border-slate-200/80 rounded-t-3xl z-50 h-[80vh] flex flex-col max-w-md mx-auto shadow-[0_-10px_40px_rgba(15,23,42,0.1)]"
          >
            <div className="flex items-center justify-between p-5 pb-3 border-b border-slate-200/80 shrink-0">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Bell className="w-5 h-5 text-blue-600" />
                Notifications
              </h2>
              <div className="flex items-center gap-3">
                {notifications.length > 0 && (
                  <button 
                    onClick={handleMarkAllAsRead}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    Mark all read
                  </button>
                )}
                <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-3">
                  <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200/60">
                    <Bell className="w-6 h-6 text-slate-400" />
                  </div>
                  <div>
                    <h3 className="text-slate-900 font-bold text-[15px]">No new notifications.</h3>
                    <p className="text-slate-500 text-xs mt-1 max-w-[200px] mx-auto leading-relaxed font-medium">
                      When someone interacts with your posts or profile, you'll see it here.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {notifications.map(notification => (
                    <div 
                      key={notification.id}
                      className={`flex gap-4 p-4 rounded-2xl border transition-colors ${
                        notification.isRead 
                          ? 'bg-slate-50/50 border-slate-200/50' 
                          : 'bg-blue-50/30 border-blue-200/60 shadow-xs'
                      }`}
                    >
                      <div className="relative shrink-0 mt-1">
                        {notification.actorAvatarUrl ? (
                          <img src={notification.actorAvatarUrl} alt={notification.actorName} className="w-10 h-10 rounded-full object-cover border border-slate-200" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-700 border border-slate-200">
                            {notification.actorName.substring(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center border border-slate-200 shadow-xs">
                          {getIcon(notification.type)}
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] text-slate-700 leading-snug">
                          <span className="font-semibold text-slate-900">{notification.actorName}</span>{' '}
                          {notification.message}
                        </p>
                        <p className="text-[12px] text-slate-500 font-medium mt-1">
                          {notification.timestamp}
                        </p>
                      </div>

                      {!notification.isRead && (
                        <div className="w-2 h-2 rounded-full bg-blue-600 shrink-0 mt-2" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {notifications.length > 0 && (
              <div className="p-4 border-t border-slate-200/80 shrink-0">
                <button 
                  onClick={handleClearAll}
                  className="w-full py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition-colors"
                >
                  Clear All
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
