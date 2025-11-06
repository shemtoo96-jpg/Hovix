import React, { useState, useEffect, useMemo, ChangeEvent } from 'react';
import Card from './ui/Card';
import Button from './ui/Button';
import type { MoodEntry, ReminderSettings, User } from '../types';
import { MUSIC_SERVICES } from '../constants';
import useLocalStorage from '../hooks/useLocalStorage';
import { getAIMorningQuote, getAIEveningReflection } from '../services/geminiService';
import ConfirmationDialog from './ui/ConfirmationDialog';
import SafetyNetModal from './ui/SafetyNetModal';

type Page = 'dashboard' | 'analytics' | 'calendar' | 'achievements' | 'tools' | 'chat' | 'community' | 'vision' | 'settings';

interface SettingsProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  moodEntries: MoodEntry[];
  clearData: () => void;
  setCurrentPage: (page: Page) => void;
  currentUser: User;
  updateUser: (updatedUser: Partial<User>) => void;
}

const GoogleFitIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="currentColor"><path d="M15.02 6.38L12 2.69 8.98 6.38 6.69 4.1l-4.6 4.6 2.29 2.29L2.1 13.28l4.6 4.6 2.29-2.29 2.29 2.29 3.02-3.69-3.7-3.02 3.7-3.02-2.29-2.29zM19.9 13.28l-4.6-4.6-2.29 2.29L15.3 8.7l-3.02 3.69 3.7 3.02-3.7 3.02 2.29 2.29 4.6-4.6z"/></svg>
);
const AppleHealthIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="currentColor"><path d="M17.31 4.31a3.75 3.75 0 00-5.3 0l-1.06 1.06-1.06-1.06a3.75 3.75 0 00-5.3 5.3l1.06 1.06L12 17.06l6.36-6.36 1.06-1.06a3.75 3.75 0 000-5.3z"/></svg>
);

const Settings: React.FC<SettingsProps> = ({ isDarkMode, toggleDarkMode, moodEntries, clearData, setCurrentPage, currentUser, updateUser }) => {
  const [reminder, setReminder] = useLocalStorage<ReminderSettings>('reminderSettings', {
    daily: { isEnabled: false, time: '19:00', message: 'How are you feeling today? 💛' },
    morningBoost: { isEnabled: false, time: '08:00' },
    eveningReflection: { isEnabled: false, time: '21:00' },
    intelligentCheckIn: { isEnabled: false }
  });
  
  const [notificationPermission, setNotificationPermission] = useState('default');
  const [saveStatus, setSaveStatus] = useState('');
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSafetyModalOpen, setIsSafetyModalOpen] = useState(false);
  const [currentName, setCurrentName] = useState(currentUser.name);

  
  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);
  
  const handlePermissionRequest = async () => {
    if (notificationPermission !== 'granted') {
        const permission = await Notification.requestPermission();
        setNotificationPermission(permission);
        return permission === 'granted';
    }
    return true;
  };

  const handleToggle = async (key: keyof ReminderSettings) => {
    const currentSetting = reminder[key];
    const newIsEnabled = !currentSetting.isEnabled;

    if (newIsEnabled) {
      const permissionGranted = await handlePermissionRequest();
      if (!permissionGranted) {
        return; // Don't enable if permission is denied
      }
    }
    
    setReminder(prev => ({
        ...prev,
        [key]: { ...prev[key], isEnabled: newIsEnabled }
    }));
  };

  const handleInputChange = (key: 'daily', field: 'time' | 'message', value: string) => {
     setReminder(prev => ({
        ...prev,
        [key]: { ...prev[key], [field]: value }
    }));
  };
  
  const handleSave = () => {
    if(currentName.trim() !== currentUser.name) {
        updateUser({ name: currentName.trim() });
    }
    setSaveStatus('Settings saved!');
    setTimeout(() => setSaveStatus(''), 2000);
    console.log("Settings saved.");
  };

  const handlePhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const reader = new FileReader();
        reader.onload = (event) => {
            if(event.target?.result) {
                updateUser({ photo: event.target.result as string });
                setSaveStatus('Profile photo updated!');
                setTimeout(() => setSaveStatus(''), 2000);
            }
        };
        reader.readAsDataURL(e.target.files[0]);
    }
  };
  
  const handleSendTest = async (type: 'daily' | 'morning' | 'evening') => {
    if (notificationPermission !== 'granted') {
      alert('Please enable notifications and grant permission first.');
      return;
    }
    
    let title = 'Hovix Reminder';
    let body = '';

    if (type === 'daily') {
        body = reminder.daily.message;
    } else if (type === 'morning') {
        title = "Your Morning Boost ☀️";
        body = await getAIMorningQuote();
    } else if (type === 'evening') {
        title = "Evening Reflection 🌙";
        body = await getAIEveningReflection();
    }

    new Notification(title, {
      body: body,
      icon: '/vite.svg',
    });
  };

  const suggestedTime = useMemo(() => {
    if (moodEntries.length < 5) return null;
    const hours = moodEntries.map(e => new Date(e.date).getHours());
    const hourCounts: { [key: number]: number } = {};
    hours.forEach(hour => {
        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });
    const mostFrequentHour = Object.keys(hourCounts).reduce((a, b) => hourCounts[parseInt(a)] > hourCounts[parseInt(b)] ? a : b);
    const hour = parseInt(mostFrequentHour);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:00 ${ampm}`;
  }, [moodEntries]);

  const hasRecentNegativeStreak = useMemo(() => {
      if (moodEntries.length < 3) return false;
      const recentUniqueDays = [...new Map(moodEntries.map(e => [new Date(e.date).toDateString(), e])).values()];
      if (recentUniqueDays.length < 3) return false;
      // FIX: Explicitly type `entry` to resolve issue where it was inferred as `unknown`.
      return recentUniqueDays.slice(0, 3).every((entry: MoodEntry) => entry.mood.value < 3);
  }, [moodEntries]);


  const exportToCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "ID,Date,Mood,Emoji,Journal,Tags\r\n";
    
    moodEntries.forEach(entry => {
        const row = [
            entry.id,
            new Date(entry.date).toLocaleString(),
            entry.mood.name,
            entry.mood.emoji,
            `"${entry.journal.replace(/"/g, '""')}"`,
            entry.tags.join(';')
        ].join(",");
        csvContent += row + "\r\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "hovix_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeleteData = () => {
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    clearData();
    setIsConfirmOpen(false);
  };
  
  const Toggle = ({ isEnabled, onToggle }: { isEnabled: boolean; onToggle: () => void }) => (
    <button onClick={onToggle} className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${isEnabled && notificationPermission === 'granted' ? 'bg-primary dark:bg-primary-dark' : 'bg-gray-200 dark:bg-gray-700'}`}>
        <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${isEnabled && notificationPermission === 'granted' ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  );


  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-8">
      <header>
        <h1 className="text-4xl font-bold text-text-light dark:text-text-dark">Settings</h1>
        <p className="text-lg text-gray-500 dark:text-gray-400 mt-1">Customize your Hovix experience.</p>
      </header>

       <Card>
        <h2 className="text-2xl font-semibold mb-4 text-text-light dark:text-text-dark">Profile</h2>
        <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <div className="relative">
                {currentUser.photo ? (
                    <img src={currentUser.photo} alt="Profile" className="h-24 w-24 rounded-full object-cover" />
                ) : (
                    <div className="h-24 w-24 rounded-full bg-primary dark:bg-primary-dark flex items-center justify-center text-white font-bold text-4xl">
                        {currentUser.name.charAt(0).toUpperCase()}
                    </div>
                )}
                <label htmlFor="photo-upload" className="absolute -bottom-1 -right-1 bg-white dark:bg-gray-700 p-1.5 rounded-full cursor-pointer shadow-md hover:bg-gray-100 dark:hover:bg-gray-600">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-text-light dark:text-text-dark" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>
                    <input id="photo-upload" type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                </label>
            </div>
            <div className="flex-1 w-full">
                <label htmlFor="name-input" className="block text-sm font-medium text-text-light dark:text-gray-300 mb-1">Your Name</label>
                <input id="name-input" type="text" value={currentName} onChange={(e) => setCurrentName(e.target.value)} className="w-full p-2 rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-primary dark:focus:ring-primary-dark outline-none transition" />
            </div>
        </div>
      </Card>
      
      <Card>
        <h2 className="text-2xl font-semibold mb-4 text-text-light dark:text-text-dark">Appearance</h2>
        <div className="flex justify-between items-center">
          <span className="text-lg text-text-light dark:text-text-dark">Dark Mode</span>
          <Toggle isEnabled={isDarkMode} onToggle={toggleDarkMode} />
        </div>
      </Card>

      <Card>
        <h2 className="text-2xl font-semibold mb-4 text-text-light dark:text-text-dark">Emergency Support</h2>
        <div className="space-y-4">
            <p className="text-gray-500 dark:text-gray-400">
                If you are in crisis or need immediate support, please use these resources. You are not alone.
            </p>
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button onClick={() => setIsSafetyModalOpen(true)} variant="danger">
                    View Immediate Support Resources
                </Button>
            </div>
        </div>
      </Card>
      
      <Card>
          <h2 className="text-2xl font-semibold mb-2 text-text-light dark:text-text-dark">Intelligent Notifications</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">Let Aura support you at the right time with the right message.</p>
          
          {notificationPermission === 'denied' && (
             <p className="text-danger text-sm mb-4 p-3 bg-danger/10 rounded-lg">Notifications are blocked. You'll need to enable them in your browser settings to use these features.</p>
          )}

          {/* Daily Reminder */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg text-text-light dark:text-text-dark border-b border-gray-200 dark:border-gray-700 pb-2">Daily Reminder</h3>
            <div className="flex justify-between items-center">
              <span className="text-text-light dark:text-text-dark">Enable custom reminder</span>
              <Toggle isEnabled={reminder.daily.isEnabled} onToggle={() => handleToggle('daily')} />
            </div>
            {reminder.daily.isEnabled && notificationPermission === 'granted' && (
              <div className="space-y-4 pt-2 animate-fade-in">
                  {suggestedTime && <p className="text-sm text-primary dark:text-primary-dark">💡 Aura suggests setting your reminder around {suggestedTime} based on your habits.</p>}
                  <div>
                      <label htmlFor="reminder-time" className="block text-sm font-medium text-text-light dark:text-gray-300 mb-1">Reminder Time</label>
                      <input id="reminder-time" type="time" value={reminder.daily.time} onChange={(e) => handleInputChange('daily', 'time', e.target.value)} className="w-full p-2 rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-primary dark:focus:ring-primary-dark outline-none transition" />
                  </div>
                  <div>
                      <label htmlFor="reminder-message" className="block text-sm font-medium text-text-light dark:text-gray-300 mb-1">Reminder Message</label>
                      <input id="reminder-message" type="text" value={reminder.daily.message} maxLength={100} onChange={(e) => handleInputChange('daily', 'message', e.target.value)} className="w-full p-2 rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-primary dark:focus:ring-primary-dark outline-none transition" />
                  </div>
                  <Button onClick={() => handleSendTest('daily')} variant="secondary" size="sm">Send Test</Button>
              </div>
            )}
          </div>

          {/* Daily Inspiration */}
          <div className="space-y-4 mt-6">
            <h3 className="font-semibold text-lg text-text-light dark:text-text-dark border-b border-gray-200 dark:border-gray-700 pb-2">Daily Inspiration from Aura</h3>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-text-light dark:text-text-dark">Morning Boost</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">A motivational quote at 8:00 AM.</p>
              </div>
              <Toggle isEnabled={reminder.morningBoost.isEnabled} onToggle={() => handleToggle('morningBoost')} />
            </div>
            {reminder.morningBoost.isEnabled && <Button onClick={() => handleSendTest('morning')} variant="secondary" size="sm">Send Test Quote</Button>}

            <div className="flex justify-between items-start">
              <div>
                <p className="text-text-light dark:text-text-dark">Evening Reflection</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">A gentle reflection prompt at 9:00 PM.</p>
              </div>
              <Toggle isEnabled={reminder.eveningReflection.isEnabled} onToggle={() => handleToggle('eveningReflection')} />
            </div>
            {reminder.eveningReflection.isEnabled && <Button onClick={() => handleSendTest('evening')} variant="secondary" size="sm">Send Test Prompt</Button>}
          </div>
          
          {/* Intelligent Check-in */}
          <div className="space-y-2 mt-6">
            <h3 className="font-semibold text-lg text-text-light dark:text-text-dark border-b border-gray-200 dark:border-gray-700 pb-2">Intelligent Check-in</h3>
             <div className="flex justify-between items-start">
               <div>
                 <p className="text-text-light dark:text-text-dark">Mood-Adaptive Alerts</p>
                 <p className="text-sm text-gray-500 dark:text-gray-400">Get a gentle check-in if you seem down for a few days.</p>
               </div>
               <Toggle isEnabled={reminder.intelligentCheckIn.isEnabled} onToggle={() => handleToggle('intelligentCheckIn')} />
            </div>
             {reminder.intelligentCheckIn.isEnabled && <p className="text-sm text-primary dark:text-primary-dark">ℹ️ Based on recent entries, Aura {hasRecentNegativeStreak ? 'would have' : 'would not have'} checked in.</p>}
          </div>

          <div className="flex justify-end mt-8">
              {saveStatus && <span className="text-sm text-success font-semibold mr-4 self-center transition-opacity duration-300">{saveStatus}</span>}
              <Button onClick={handleSave}>Save All Settings</Button>
          </div>
          <style>{`
            @keyframes fade-in { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }
            .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
          `}</style>
      </Card>

      <Card>
        <h2 className="text-2xl font-semibold mb-4 text-text-light dark:text-text-dark">Music & Mood</h2>
        <div className="space-y-4">
          <p className="text-gray-500 dark:text-gray-400">Connect your favorite music services to get playlist suggestions based on your mood.</p>
          {MUSIC_SERVICES.map(service => (
            <div key={service.name} className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <service.icon className="h-8 w-8" style={{color: service.color}}/>
                <span className="font-semibold text-text-light dark:text-text-dark">{service.name}</span>
              </div>
              <Button variant="secondary">Connect</Button>
            </div>
          ))}
        </div>
      </Card>
      
      <Card>
        <h2 className="text-2xl font-semibold mb-4 text-text-light dark:text-text-dark">Wearable Integration</h2>
        <div className="space-y-4">
            <p className="text-gray-500 dark:text-gray-400">Sync with your smartwatch to get deeper insights by correlating mood with heart rate, sleep, and activity levels. (Coming Soon)</p>
            {[
                { name: 'Google Fit', icon: GoogleFitIcon, color: '#4285F4' },
                { name: 'Apple Health', icon: AppleHealthIcon, color: '#FF2D55' }
            ].map(service => (
                <div key={service.name} className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-3">
                        <service.icon className="h-8 w-8" style={{ color: service.color }} />
                        <span className="font-semibold text-text-light dark:text-text-dark">{service.name}</span>
                    </div>
                    <Button variant="secondary" onClick={() => alert(`${service.name} integration is coming soon!`)}>Connect</Button>
                </div>
            ))}
        </div>
      </Card>
      
      <Card>
        <h2 className="text-2xl font-semibold mb-4 text-text-light dark:text-text-dark">Therapist Integration</h2>
        <div className="space-y-4">
            <p className="text-gray-500 dark:text-gray-400">
                Sharing your mood journal can be a valuable tool in therapy. You can export your data as a CSV file or print a visual summary from the Analytics page to share with a professional.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button onClick={exportToCSV} variant="secondary">Export All Data to CSV</Button>
                <Button onClick={() => setCurrentPage('analytics')} variant="secondary">View Analytics to Print</Button>
            </div>
        </div>
      </Card>

      <Card>
        <h2 className="text-2xl font-semibold mb-4 text-text-light dark:text-text-dark">Data Management</h2>
        <div className="space-y-4">
            <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-danger">Permanently delete all your mood entries.</p>
                <Button onClick={handleDeleteData} variant="danger">Delete Data</Button>
            </div>
        </div>
      </Card>

      <SafetyNetModal
        isOpen={isSafetyModalOpen}
        onClose={() => setIsSafetyModalOpen(false)}
        title="Immediate Support Resources"
      />

      <ConfirmationDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Confirm Deletion"
        description="Are you absolutely sure you want to delete all your mood data? This action is permanent and cannot be undone."
      />
    </div>
  );
};

export default Settings;