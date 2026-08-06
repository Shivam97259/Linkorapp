import { Bell, Hexagon } from 'lucide-react';
import { notificationStore, useNav } from '../store';

export function Header() {
  const [activeTab] = useNav();

  const getTitle = () => {
    switch (activeTab) {
      case 'feed': return 'Linkora Feed';
      case 'search': return 'Linkora Search';
      case 'chats': return 'Linkora Chats';
      case 'profile': return 'Linkora Profile';
      default: return 'Linkora';
    }
  };

  return (
    <header className="flex items-center justify-between px-4 py-3 bg-white/95 backdrop-blur-md z-30 sticky top-0 border-b border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.03)] shrink-0">
      <div className="flex items-center gap-2.5">
        <div className="bg-gradient-to-tr from-blue-600 to-sky-500 p-1.5 rounded-xl shadow-xs">
          <Hexagon className="w-5 h-5 text-white" />
        </div>
        <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-sky-600 bg-clip-text text-transparent tracking-wide">
          {getTitle()}
        </h1>
      </div>
      <button 
        onClick={() => notificationStore.open()}
        className="p-2 rounded-full hover:bg-slate-100 transition-colors relative group"
        title="Notifications"
      >
        <Bell className="w-5 h-5 text-slate-600 group-hover:text-slate-900 transition-colors" />
        <span className="absolute top-2 right-2 w-2 h-2 bg-blue-600 rounded-full ring-2 ring-white"></span>
      </button>
    </header>
  );
}
