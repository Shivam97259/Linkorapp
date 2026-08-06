import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, RecaptchaVerifier, signInWithPopup, signInWithPhoneNumber } from 'firebase/auth';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "perfect-grammar-r6shk",
  appId: "1:812614344780:web:6812ad77e96a816dae94e9",
  apiKey: "AIzaSyCDtem1HwQxuKaVx0WWRd8N8J8jTOLp9cg",
  authDomain: "perfect-grammar-r6shk.firebaseapp.com",
  storageBucket: "perfect-grammar-r6shk.firebasestorage.app",
  messagingSenderId: "812614344780",
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({tabManager: persistentMultipleTabManager()})
}, "ai-studio-nexussocialchata-01db6b53-fda6-4958-8272-2f9abb8390cd");

export const googleProvider = new GoogleAuthProvider();

export const setupRecaptcha = (containerId: string) => {
  return new RecaptchaVerifier(auth, containerId, {
    size: 'invisible',
  });
};
