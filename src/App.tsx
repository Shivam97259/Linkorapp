/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { useState } from 'react';
import { PhoneFrame } from './components/PhoneFrame';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { FeedView } from './components/views/FeedView';
import { SearchView } from './components/views/SearchView';
import { ChatsView } from './components/views/ChatsView';
import { ProfileView } from './components/views/ProfileView';
import { useNav, useNotificationSheet } from './store';
import { useAuth } from './components/auth/AuthProvider';
import { AuthScreen } from './components/auth/AuthScreen';
import { NotificationSheet } from './components/notifications/NotificationSheet';

export default function App() {
  const [activeTab, setActiveTab] = useNav();
  const { user } = useAuth();
  const notificationSheet = useNotificationSheet();

  if (!user) {
    return (
      <PhoneFrame>
        <AuthScreen />
      </PhoneFrame>
    );
  }

  return (
    <PhoneFrame>
      <Header />
      
      <main className="flex-1 overflow-y-auto overflow-x-hidden relative pb-24 scrollbar-hide">
        <div className={activeTab === 'feed' ? 'block h-full' : 'hidden'}>
          <FeedView />
        </div>
        <div className={activeTab === 'search' ? 'block h-full' : 'hidden'}>
          <SearchView />
        </div>
        <div className={activeTab === 'chats' ? 'block h-full' : 'hidden'}>
          <ChatsView />
        </div>
        <div className={activeTab === 'profile' ? 'block h-full' : 'hidden'}>
          <ProfileView />
        </div>
      </main>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      
      <NotificationSheet 
        isOpen={notificationSheet.isOpen} 
        onClose={notificationSheet.close} 
      />
    </PhoneFrame>
  );
}
