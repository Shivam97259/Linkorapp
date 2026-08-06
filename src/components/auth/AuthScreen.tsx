import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { auth, googleProvider, db } from '../../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { Mail, Lock, User as UserIcon, Loader2, ArrowRight } from 'lucide-react';

const generateChatCode = () => {
  return 'LX-' + Math.floor(100000 + Math.random() * 900000).toString();
};

export function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  
  // Email state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const createUserDocument = async (user: any, additionalData: any = {}) => {
    if (!user) return;
    const userRef = doc(db, 'users', user.uid);
    const snap = await getDoc(userRef);
    if (!snap.exists()) {
      const { email, displayName, photoURL, uid } = user;
      try {
        await setDoc(userRef, {
          uid,
          displayName: additionalData.displayName || displayName || 'New User',
          username: additionalData.username || email?.split('@')[0] || `user_${uid.slice(0, 5)}`,
          email: email || null,
          photoURL: photoURL || null,
          bio: 'New here! 👋',
          chatCode: generateChatCode(),
          createdAt: serverTimestamp(),
          onlineStatus: true
        });
      } catch (error) {
        console.error('Error creating user document', error);
      }
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        if (!displayName || !username) {
          setError('Please fill in all fields');
          setLoading(false);
          return;
        }
        const { user } = await createUserWithEmailAndPassword(auth, email, password);
        await createUserDocument(user, { displayName, username });
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      const { user } = await signInWithPopup(auth, googleProvider);
      await createUserDocument(user);
    } catch (err: any) {
      setError(err.message || 'Google sign-in failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 text-slate-900">
      
      <div className="w-full max-w-sm space-y-8 relative z-10">
        <div className="text-center">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-16 h-16 mx-auto bg-gradient-to-tr from-blue-600 to-sky-500 rounded-2xl flex items-center justify-center mb-6 shadow-md shadow-blue-500/20"
          >
            <span className="text-2xl font-bold text-white">LK</span>
          </motion.div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            {isLogin ? 'Welcome back' : 'Create an account'}
          </h2>
          <p className="text-slate-500 mt-2 text-[15px] font-medium">
            {isLogin ? 'Enter your details to access your account' : 'Join Linkora to connect with others'}
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.form 
            key="email-form"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            onSubmit={handleEmailAuth} 
            className="space-y-4"
          >
            {!isLogin && (
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Display Name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full bg-white border border-[#CBD5E1] rounded-xl pl-11 pr-4 py-3 text-[#0F172A] font-medium placeholder:text-[#64748B] focus:outline-none focus:border-blue-600 shadow-xs transition-colors"
                  />
                </div>
                <div className="flex-1 relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">@</span>
                  <input
                    type="text"
                    placeholder="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-white border border-[#CBD5E1] rounded-xl pl-9 pr-4 py-3 text-[#0F172A] font-medium placeholder:text-[#64748B] focus:outline-none focus:border-blue-600 shadow-xs transition-colors"
                  />
                </div>
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white border border-[#CBD5E1] rounded-xl pl-11 pr-4 py-3 text-[#0F172A] font-medium placeholder:text-[#64748B] focus:outline-none focus:border-blue-600 shadow-xs transition-colors"
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white border border-[#CBD5E1] rounded-xl pl-11 pr-4 py-3 text-[#0F172A] font-medium placeholder:text-[#64748B] focus:outline-none focus:border-blue-600 shadow-xs transition-colors"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-70 shadow-sm"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <>
                  {isLogin ? 'Sign In' : 'Sign Up'}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </motion.form>
        </AnimatePresence>

        <div className="relative flex items-center py-2">
          <div className="flex-grow border-t border-slate-200"></div>
          <span className="flex-shrink-0 mx-4 text-slate-500 text-sm font-medium">or continue with</span>
          <div className="flex-grow border-t border-slate-200"></div>
        </div>

        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full bg-white hover:bg-slate-50 border border-[#CBD5E1] text-slate-800 font-semibold py-3.5 px-4 rounded-xl flex items-center justify-center gap-3 transition-colors shadow-xs"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>
        </div>

        <p className="text-center text-slate-500 text-sm font-medium">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-blue-600 hover:text-blue-700 font-bold transition-colors"
          >
            {isLogin ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
}

