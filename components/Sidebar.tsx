import React from 'react';
import Logo from './Logo';
import type { User } from '../types';

type Page = 'dashboard' | 'analytics' | 'calendar' | 'achievements' | 'tools' | 'chat' | 'community' | 'vision' | 'settings';

interface SidebarProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  logout: () => void;
  currentUser: User;
}

const Sidebar: React.FC<SidebarProps> = ({ currentPage, setCurrentPage, logout, currentUser }) => {
  const navItems = [
    { id: 'dashboard', name: 'Dashboard', icon: DashboardIcon },
    { id: 'analytics', name: 'Analytics', icon: AnalyticsIcon },
    { id: 'calendar', name: 'Calendar', icon: CalendarIcon },
    { id: 'achievements', name: 'Achievements', icon: AchievementsIcon },
    { id: 'tools', name: 'Tools', icon: ToolsIcon },
    { id: 'chat', name: 'Chat with Aura', icon: ChatIcon },
    { id: 'community', name: 'Community', icon: CommunityIcon },
    { id: 'vision', name: 'Vision', icon: VisionIcon },
    { id: 'settings', name: 'Settings', icon: SettingsIcon },
  ];

  const NavLink: React.FC<{ page: Page, name: string, Icon: React.ElementType }> = ({ page, name, Icon }) => {
    const isActive = currentPage === page;
    return (
      <button
        onClick={() => setCurrentPage(page)}
        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
          isActive
            ? 'bg-primary/10 text-primary dark:bg-primary-dark/20 dark:text-primary-dark'
            : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
        }`}
      >
        <Icon className="h-6 w-6" />
        <span className="font-semibold">{name}</span>
      </button>
    );
  };

  return (
    <aside className="w-64 bg-white/50 dark:bg-gray-900/50 p-6 flex-col hidden md:flex backdrop-blur-lg border-r border-gray-200 dark:border-gray-800">
      <Logo className="h-10 w-auto mb-10" />
      <nav className="flex-1 flex flex-col space-y-2">
        {navItems.map(item => (
          <NavLink key={item.id} page={item.id as Page} name={item.name} Icon={item.icon} />
        ))}
      </nav>
      <div className="mt-auto">
         <div className="p-3 rounded-lg bg-gray-100 dark:bg-gray-800/50 mb-4 flex items-center space-x-3">
             {currentUser.photo ? (
                <img src={currentUser.photo} alt={currentUser.name} className="h-10 w-10 rounded-full object-cover" />
             ) : (
                <div className="h-10 w-10 rounded-full bg-primary dark:bg-primary-dark flex items-center justify-center text-white font-bold text-lg">
                    {currentUser.name.charAt(0).toUpperCase()}
                </div>
             )}
            <div className="overflow-hidden">
                <p className="font-bold text-sm text-text-light dark:text-text-dark truncate">{currentUser.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{currentUser.email}</p>
            </div>
         </div>
         <button
            onClick={logout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 text-gray-500 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/50 hover:text-danger"
          >
          <LogoutIcon className="h-6 w-6" />
          <span className="font-semibold">Logout</span>
        </button>
      </div>
    </aside>
  );
};

// SVG Icons
const DashboardIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
);
const AnalyticsIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
);
const CalendarIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
);
const AchievementsIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.5 2h-13A2.5 2.5 0 003 4.5V8a4 4 0 004 4h8a4 4 0 004-4V4.5A2.5 2.5 0 0018.5 2zM12 14a3 3 0 00-3 3v2a1 1 0 001 1h4a1 1 0 001-1v-2a3 3 0 00-3-3z"/>
    </svg>
);
const ToolsIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-2.25-1.313M21 7.5v2.25m0-2.25l-2.25 1.313M3 7.5l2.25-1.313M3 7.5l2.25 1.313M3 7.5v2.25m9 3l2.25-1.313M12 12.75l-2.25-1.313M12 12.75V15m0 6.75l2.25-1.313M12 21.75V19.5m0 2.25l-2.25-1.313m0-16.875L12 2.25l2.25 1.313M12 7.5V5.25m0 2.25l-2.25-1.313m0 0L9.75 5.25M3.75 7.5a3 3 0 003 3h.008c.017 0 .034 0 .052.002l.008.001c.017 0 .034 0 .052.002h.008a3 3 0 003-3v-.008c0-.017-.001-.034-.002-.052l-.001-.008a2.98 2.98 0 00-.052-.052v-.008a3 3 0 00-3-3h-.008c-.017 0-.034 0-.052-.002L9 4.5l-.008-.001A2.981 2.981 0 009 4.5h-.008a3 3 0 00-3 3v.008c0 .017.001.034.002.052l.001.008.001.008.052.052v.008a3 3 0 003 3h.008c.017 0 .034 0 .052.002l.008.001c.017 0 .034 0 .052.002h.008a3 3 0 003-3V7.5m-6 4.5v.008c0 .017.001.034.002.052l.001.008.001.008.052.052v.008a3 3 0 003 3h.008c.017 0 .034 0 .052.002l.008.001c.017 0 .034 0 .052.002h.008a3 3 0 003-3v-.008c0-.017-.001-.034-.002-.052l-.001-.008a2.98 2.98 0 00-.052-.052v-.008a3 3 0 00-3-3h-.008c-.017 0-.034 0-.052-.002L15 9l-.008-.001A2.981 2.981 0 0015 9h-.008a3 3 0 00-3 3v.008c0 .017.001.034.002.052l.001.008.001.008.052.052v.008a3 3 0 003 3h.008c.017 0 .034 0 .052.002l.008.001c.017 0 .034 0 .052.002h.008a3 3 0 003-3V12m-6 4.5v.008c0 .017.001.034.002.052l.001.008.001.008.052.052v.008a3 3 0 003 3h.008c.017 0 .034 0 .052.002l.008.001c.017 0 .034 0 .052.002h.008a3 3 0 003-3v-.008c0-.017-.001-.034-.002-.052l-.001-.008a2.98 2.98 0 00-.052-.052v-.008a3 3 0 00-3-3h-.008c-.017 0-.034 0-.052-.002L15 13.5l-.008-.001a2.981 2.981 0 00-.052-.052v-.008a3 3 0 00-3-3v.008c0 .017.001.034.002.052l.001.008.001.008.052.052v.008a3 3 0 003 3h.008c.017 0 .034 0 .052.002l.008.001c.017 0 .034 0 .052.002h.008a3 3 0 003-3V12" />
    </svg>
);
const ChatIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.455.09-.934.09-1.425v-2.287a6.75 6.75 0 016.75-6.75h.008a6.75 6.75 0 016.75 6.75z" />
    </svg>
);
const CommunityIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m-7.5-2.962c.57-1.023 1.535-1.854 2.732-2.31m-2.732 2.31l-2.732 2.31m0 0l2.732 2.31m-2.732-2.31l2.732-2.31m0 0l2.732 2.31m-2.732-2.31l-2.732-2.31m9.092-5.986a8.963 8.963 0 01-2.312 5.13m0 0a8.963 8.963 0 01-5.132 2.31m0 0a8.963 8.963 0 01-5.132-2.31m0 0a8.963 8.963 0 01-2.312-5.13m0 0a8.963 8.963 0 012.312-5.13m0 0a8.963 8.963 0 015.132-2.31m0 0a8.963 8.963 0 015.132 2.31M12 12.75a3 3 0 110-6 3 3 0 010 6z" />
  </svg>
);
const VisionIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);
const SettingsIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066 2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
);
const LogoutIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
);


export default Sidebar;