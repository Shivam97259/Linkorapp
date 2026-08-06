import { motion, AnimatePresence } from 'motion/react';
import { X, Check } from 'lucide-react';
import React, { useState } from 'react';
import { profileStore } from '../../store';
import type { UserProfile } from '../../types';

import { doc, updateDoc } from 'firebase/firestore';
import { updateProfile as updateAuthProfile } from 'firebase/auth';
import { db, auth } from '../../firebase';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
}

export function EditProfileModal({ isOpen, onClose, profile }: EditProfileModalProps) {
  const [formData, setFormData] = useState({
    name: profile.name,
    handle: profile.handle,
    initials: profile.initials,
    avatarUrl: profile.avatarUrl || '',
    bio: profile.bio,
    location: profile.location,
    website: profile.website,
    bannerGradient: profile.bannerGradient,
    notificationsEnabled: true
  });

  const [saving, setSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (auth.currentUser) {
        const userRef = doc(db, 'users', auth.currentUser.uid);
        await updateDoc(userRef, {
          displayName: formData.name,
          username: formData.handle.replace('@', ''),
          photoURL: formData.avatarUrl,
          bio: formData.bio
        });
        await updateAuthProfile(auth.currentUser, {
          displayName: formData.name,
          photoURL: formData.avatarUrl
        });
      }
      profileStore.updateProfile(formData);
      
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
        onClose();
      }, 1200);

    } catch (err) {
      console.error('Error updating profile:', err);
    } finally {
      setSaving(false);
    }
  };

  const gradients = [
    'from-indigo-600 via-violet-500 to-cyan-500',
    'from-rose-500 via-fuchsia-500 to-indigo-500',
    'from-emerald-500 via-teal-500 to-cyan-500',
    'from-amber-500 via-orange-500 to-rose-500'
  ];

  return (
    <AnimatePresence>
      {isOpen && (
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
            className="relative w-full h-[90%] bg-white/95 backdrop-blur-2xl border-t border-slate-200/80 rounded-t-3xl flex flex-col shadow-[0_-10px_40px_rgba(15,23,42,0.1)]"
          >
            <div className="flex justify-between items-center p-4 border-b border-slate-200/80">
              <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors p-1.5 rounded-full hover:bg-slate-100">
                <X className="w-6 h-6" />
              </button>
              <h2 className="text-lg font-bold text-slate-900">Edit Profile</h2>
              <button 
                onClick={handleSubmit}
                disabled={saving}
                className="px-5 py-2 rounded-full bg-blue-600 text-sm font-bold text-white shadow-md disabled:opacity-50 hover:bg-blue-700 transition-all"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto pb-safe">
              <form id="edit-profile-form" onSubmit={handleSubmit} className="p-5 space-y-5">
                
                {/* Banner Settings */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Banner Gradient</label>
                  <div className="flex gap-3">
                    {gradients.map((grad, i) => (
                      <button 
                        key={i}
                        type="button"
                        onClick={() => setFormData({ ...formData, bannerGradient: grad })}
                        className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${grad} border-2 transition-all ${formData.bannerGradient === grad ? 'border-blue-600 scale-110 shadow-md' : 'border-transparent hover:border-slate-300'}`}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Display Name</label>
                    <input 
                      type="text" 
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-[15px] font-medium text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Username</label>
                    <input 
                      type="text" 
                      value={formData.handle}
                      onChange={e => setFormData({ ...formData, handle: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-[15px] font-medium text-blue-600 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Avatar URL (Optional)</label>
                    <input 
                      type="text" 
                      value={(formData as any).avatarUrl || ''}
                      onChange={e => setFormData({ ...formData, avatarUrl: e.target.value })}
                      placeholder="https://..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-[15px] font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Initials (Fallback)</label>
                    <input 
                      type="text" 
                      maxLength={2}
                      value={formData.initials}
                      onChange={e => setFormData({ ...formData, initials: e.target.value.toUpperCase() })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-[15px] font-medium text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Bio</label>
                    <textarea 
                      value={formData.bio}
                      onChange={e => setFormData({ ...formData, bio: e.target.value })}
                      rows={3}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-[15px] font-medium text-slate-900 resize-none focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-colors"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Location</label>
                      <input 
                        type="text" 
                        value={formData.location}
                        onChange={e => setFormData({ ...formData, location: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-[15px] font-medium text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Website</label>
                      <input 
                        type="text" 
                        value={formData.website}
                        onChange={e => setFormData({ ...formData, website: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-[15px] font-medium text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-colors"
                      />
                    </div>
                  </div>
                  
                  {/* Notification Toggle */}
                  <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200/80 rounded-2xl">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Push Notifications</h4>
                      <p className="text-xs font-medium text-slate-500">Receive alerts for new activity</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, notificationsEnabled: !formData.notificationsEnabled })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.notificationsEnabled ? 'bg-blue-600' : 'bg-slate-300'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.notificationsEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                </div>
              </form>
            </div>
            
            <AnimatePresence>
              {showToast && (
                <motion.div
                  initial={{ opacity: 0, y: 50, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 20, scale: 0.9 }}
                  className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-full shadow-lg"
                >
                  <Check className="w-4 h-4" />
                  <span className="text-xs font-bold">Profile Updated</span>
                </motion.div>
              )}
            </AnimatePresence>
            
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
