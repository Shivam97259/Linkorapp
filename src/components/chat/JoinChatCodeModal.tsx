import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Key, Loader2 } from 'lucide-react';
import { db } from '../../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

interface JoinChatCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJoinSuccess: (userId: string) => void;
}

export function JoinChatCodeModal({ isOpen, onClose, onJoinSuccess }: JoinChatCodeModalProps) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || code.length < 6) return;
    
    setLoading(true);
    setError('');
    
    try {
      let formattedCode = code.trim().toUpperCase();
      if (!formattedCode.startsWith('LX-') && formattedCode.length === 6) {
        formattedCode = `LX-${formattedCode}`;
      }

      const q = query(collection(db, 'users'), where('chatCode', '==', formattedCode));
      const snap = await getDocs(q);
      
      if (snap.empty) {
        setError('Invalid Chat Key. Please check and try again.');
      } else {
        const userDoc = snap.docs[0];
        onJoinSuccess(userDoc.id);
        setCode('');
      }
    } catch (err: any) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
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
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-sm bg-white/90 backdrop-blur-xl border border-slate-200/80 shadow-[0_8px_32px_rgba(15,23,42,0.1)] rounded-3xl p-6 z-50"
          >
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors bg-slate-100 hover:bg-slate-200 rounded-full p-1"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="text-center mb-6 mt-2">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-50 to-sky-100 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-100 shadow-inner">
                <Key className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">Join Chat via 6-Digit Code</h3>
              <p className="text-[15px] text-slate-500 mt-2 leading-relaxed font-medium">
                Enter a user's 6-digit code<br/>to start a conversation instantly.
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium text-center shadow-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleJoin} className="space-y-3">
              <input
                type="text"
                placeholder="LX-839201"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="w-full bg-white/50 border border-slate-200 rounded-xl px-4 py-3.5 text-center font-mono font-bold tracking-wider text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-inner"
                maxLength={9}
                required
              />
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3.5 px-4 rounded-xl flex items-center justify-center transition-colors shadow-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || code.length < 6}
                  className="w-full bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-700 hover:to-sky-600 text-white font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_4px_14px_rgba(37,99,235,0.3)] disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Connect'}
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
