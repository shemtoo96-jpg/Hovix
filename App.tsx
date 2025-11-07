import React, { useState, useEffect } from 'react';
import useLocalStorage from './hooks/useLocalStorage';
import type { MoodEntry, User } from './types';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Analytics from './components/Analytics';
import Calendar from './components/Calendar';
import Settings from './components/Settings';
import Achievements from './components/Achievements';
import Tools from './components/Tools';
import LearningHub from './components/LearningHub';
import Chat from './components/Chat';
import Community from './components/Community';
import Vision from './components/Vision';
import Login from './components/Login';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import { getAIEmoCoachFeedback } from './services/geminiService';

type Page = 'dashboard' | 'analytics' | 'calendar' | 'achievements' | 'tools' | 'learning' | 'chat' | 'community' | 'vision' | 'settings';

const App: React.FC = () => {
  const [moodEntries, setMoodEntries] = useLocalStorage<{[email: string]: MoodEntry[]}>('allMoodEntries', {});
  const [isDarkMode, setIsDarkMode] = useLocalStorage('isDarkMode', false);
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [isSaving, setIsSaving] = useState(false);
  const [currentUser, setCurrentUser] = useLocalStorage<User | null>('currentUser', null);
  const isOnline = useOnlineStatus();
  
  const userMoodEntries = currentUser ? moodEntries[currentUser.email] || [] : [];

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);
  
  // Effect to sync offline entries when connection is restored
  useEffect(() => {
    if (isOnline && currentUser) {
      const syncOfflineEntries = async () => {
        const entriesToSync = userMoodEntries.filter(e => e.needsAiFeedback);
        if (entriesToSync.length === 0) return;
  
        console.log(`Syncing ${entriesToSync.length} offline mood entries for ${currentUser.email}...`);
  
        const updatedEntriesPromise = userMoodEntries.map(async (entry) => {
          if (entry.needsAiFeedback) {
            const feedback = await getAIEmoCoachFeedback(entry.mood, entry.journal);
            if (feedback) {
              return { ...entry, aiFeedback: feedback, needsAiFeedback: false };
            }
          }
          return entry;
        });
  
        const newMoodEntries = await Promise.all(updatedEntriesPromise);
        
        if (JSON.stringify(newMoodEntries) !== JSON.stringify(userMoodEntries)) {
           setMoodEntries(prev => ({ ...prev, [currentUser.email]: newMoodEntries }));
        }
      };
      
      syncOfflineEntries();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOnline, currentUser]);


  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  const addMoodEntry = (newEntry: MoodEntry) => {
    if (!currentUser) return;
    setIsSaving(true);
    setMoodEntries(prev => ({
        ...prev,
        [currentUser.email]: [newEntry, ...(prev[currentUser.email] || [])]
    }));
    setIsSaving(false);
  };
  
  const clearData = () => {
    if (!currentUser) return;
    setMoodEntries(prev => ({...prev, [currentUser.email]: []}));
  }
  
  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setCurrentPage('dashboard');
  }

  const handleLogout = () => {
    setCurrentUser(null);
  }

  const updateUser = (updatedUserData: Partial<User>) => {
    if (!currentUser) return;

    const updatedUser = { ...currentUser, ...updatedUserData };
    setCurrentUser(updatedUser);

    // Update the master list of users in local storage
    const allUsersJSON = window.localStorage.getItem('users');
    if (allUsersJSON) {
        try {
            let allUsers: (User & { password?: string })[] = JSON.parse(allUsersJSON);
            const userIndex = allUsers.findIndex(u => u.email === currentUser.email);
            if (userIndex !== -1) {
                const originalUser = allUsers[userIndex];
                allUsers[userIndex] = { ...originalUser, ...updatedUser };
                window.localStorage.setItem('users', JSON.stringify(allUsers));
            }
        } catch (e) {
            console.error("Failed to update master user list:", e);
        }
    }
  };
  
  if (!currentUser) {
      return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark">
      <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} logout={handleLogout} currentUser={currentUser} />
      <main className="flex-1 overflow-y-auto">
        {currentPage === 'dashboard' && <Dashboard moodEntries={userMoodEntries} addMoodEntry={addMoodEntry} isSaving={isSaving} currentUser={currentUser}/>}
        {currentPage === 'analytics' && <Analytics moodEntries={userMoodEntries} isDarkMode={isDarkMode} />}
        {currentPage === 'calendar' && <Calendar moodEntries={userMoodEntries} />}
        {currentPage === 'achievements' && <Achievements moodEntries={userMoodEntries} />}
        {currentPage === 'tools' && <Tools />}
        {currentPage === 'learning' && <LearningHub />}
        {currentPage === 'chat' && <Chat />}
        {currentPage === 'community' && <Community />}
        {currentPage === 'vision' && <Vision />}
        {currentPage === 'settings' && <Settings isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} moodEntries={userMoodEntries} clearData={clearData} setCurrentPage={setCurrentPage} currentUser={currentUser} updateUser={updateUser} />}
      </main>
    </div>
  );
};

export default App;