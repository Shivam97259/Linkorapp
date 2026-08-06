import { Rss, Search, MessageCircle, User } from 'lucide-react';
import type { Tab } from '../types';

interface BottomNavProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const tabs = [
    { id: 'feed', icon: Rss, label: 'Feed' },
    { id: 'search', icon: Search, label: 'Search' },
    { id: 'chats', icon: MessageCircle, label: 'Chats' },
    { id: 'profile', icon: User, label: 'Profile' },
  ] as const;

  return (
    <nav className="absolute bottom-0 left-0 w-full bg-white/90 backdrop-blur-xl border-t border-slate-200/80 pb-safe z-20 shadow-[0_-4px_20px_rgba(15,23,42,0.03)]">
      <div className="flex justify-around items-center pt-2 px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="flex flex-col items-center justify-center p-2 w-16 relative group"
            >
              <div className="relative">
                <Icon 
                  className={`w-6 h-6 transition-all duration-300 ${
                    isActive ? 'text-blue-600 scale-110 drop-shadow-md' : 'text-slate-400 group-hover:text-slate-500'
                  }`} 
                />
              </div>
              <span 
                className={`text-[10px] mt-1 font-bold transition-colors duration-300 ${
                  isActive ? 'text-blue-600' : 'text-slate-400'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
