import React, { useState, useEffect, useRef } from 'react';
import type { MoodEntry, User } from '../types';
import MoodLogger from './MoodLogger';
import Card from './ui/Card';
import Button from './ui/Button';
import { ACHIEVEMENTS, MUSIC_SERVICES } from '../constants';
import { getAIMoodForecast, getAIPlaylistSuggestions, getAIDailyAffirmation } from '../services/geminiService';
import type { PlaylistSuggestion } from '../services/geminiService';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

interface DashboardProps {
  moodEntries: MoodEntry[];
  addMoodEntry: (entry: MoodEntry) => void;
  isSaving: boolean;
  currentUser: User;
}

const ShareIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.195.025.39.042.583.042h6.42a2.25 2.25 0 010 4.5H7.8a2.25 2.25 0 01-2.25-2.25 2.25 2.25 0 012.25-2.25c.193 0 .388.017.583.042zM12 18a2.25 2.25 0 002.25-2.25V6.31a2.25 2.25 0 00-2.25-2.25H7.8a2.25 2.25 0 00-2.25 2.25v2.25a2.25 2.25 0 002.25 2.25h4.2a2.25 2.25 0 002.25-2.25v-2.25" />
    </svg>
);


const Dashboard: React.FC<DashboardProps> = ({ moodEntries, addMoodEntry, isSaving, currentUser }) => {
  const today = new Date().toDateString();
  const todaysEntry = moodEntries.find(entry => new Date(entry.date).toDateString() === today);
  const [forecast, setForecast] = useState('');
  const [isLoadingForecast, setIsLoadingForecast] = useState(false);
  const [playlistSuggestions, setPlaylistSuggestions] = useState<PlaylistSuggestion[]>([]);
  const [isLoadingPlaylists, setIsLoadingPlaylists] = useState(false);
  const [affirmation, setAffirmation] = useState('');
  const [isLoadingAffirmation, setIsLoadingAffirmation] = useState(false);
  const isOnline = useOnlineStatus();
  const prevTodaysEntryRef = useRef<MoodEntry | undefined>();

  useEffect(() => {
    prevTodaysEntryRef.current = todaysEntry;
  }, [todaysEntry]);

  const prevTodaysEntry = prevTodaysEntryRef.current;
  const wasJustAdded = !!todaysEntry && !prevTodaysEntry;


  useEffect(() => {
    const fetchForecast = async () => {
      if (moodEntries.length > 0 && isOnline) {
        setIsLoadingForecast(true);
        const forecastText = await getAIMoodForecast(moodEntries);
        setForecast(forecastText);
        setIsLoadingForecast(false);
      } else if (!isOnline) {
        setForecast("AI forecast is unavailable while you're offline.");
      } else {
        setForecast("Log your mood for a week to unlock your first forecast!");
      }
    };

    fetchForecast();
  }, [moodEntries, isOnline]);

  useEffect(() => {
    const fetchAffirmation = async () => {
      if (isOnline) {
        setIsLoadingAffirmation(true);
        const affirmationText = await getAIDailyAffirmation();
        setAffirmation(affirmationText);
        setIsLoadingAffirmation(false);
      } else {
        setAffirmation("You are capable of amazing things.");
      }
    };
    fetchAffirmation();
  }, [isOnline]);

  useEffect(() => {
    const fetchPlaylists = async () => {
        if (todaysEntry && isOnline) {
            setIsLoadingPlaylists(true);
            const suggestions = await getAIPlaylistSuggestions(todaysEntry.mood);
            setPlaylistSuggestions(suggestions);
            setIsLoadingPlaylists(false);
        } else {
            setPlaylistSuggestions([]);
        }
    };
    fetchPlaylists();
  }, [todaysEntry, isOnline]);


  const calculateStreak = () => {
    if (moodEntries.length === 0) return 0;
    let streak = 0;
    const sortedEntries = [...moodEntries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    const uniqueDates = [...new Set(sortedEntries.map(e => new Date(e.date).toDateString()))];

    if(uniqueDates.length === 0) return 0;
    
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (uniqueDates[0] !== today.toDateString() && uniqueDates[0] !== yesterday.toDateString()){
        return 0;
    }
    
    streak = 1;
    if(uniqueDates[0] === yesterday.toDateString() && uniqueDates.length === 1) return 1;


    for (let i = 0; i < uniqueDates.length - 1; i++) {
        const currentDate = new Date(uniqueDates[i]);
        const previousDate = new Date(uniqueDates[i+1]);
        const diffTime = currentDate.getTime() - previousDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
            streak++;
        } else {
            break;
        }
    }
    return streak;
  };

  const handleShare = async () => {
    if (!todaysEntry) return;

    const shareText = `Feeling ${todaysEntry.mood.name} ${todaysEntry.mood.emoji} today.${todaysEntry.journal ? `\n\nMy reflection: "${todaysEntry.journal}"` : ''}\n\nTracked with #Hovix`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "My Mood Today",
          text: shareText,
          url: window.location.href, // You can change this to a link to your app
        });
      } catch (error) {
        console.error("Share failed:", error);
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareText);
        alert("Reflection copied to clipboard!");
      } catch (error) {
        console.error("Failed to copy:", error);
        alert("Could not copy to clipboard.");
      }
    }
  };

  const streak = calculateStreak();

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-8">
      <header>
        <h1 className="text-4xl font-bold text-text-light dark:text-text-dark">Welcome back, {currentUser.name.split(' ')[0]}!</h1>
        <p className="text-lg text-gray-500 dark:text-gray-400 mt-1">Ready to reflect on your day?</p>
      </header>

      <Card>
          <h3 className="text-xl font-semibold mb-4 text-text-light dark:text-text-dark">Today's Affirmation</h3>
          {isLoadingAffirmation && isOnline ? (
            <div className="flex items-center space-x-4 text-text-light dark:text-text-dark">
                <span className="text-3xl animate-pulse">✨</span>
                <div className="flex-1">
                  <p className="font-semibold">Aura is preparing a positive thought for you...</p>
                </div>
            </div>
          ) : (
            <div className="flex items-start space-x-4">
              <div className="text-3xl mt-1">✨</div>
              <p className="text-lg italic text-text-light dark:text-gray-300">"{affirmation}"</p>
            </div>
          )}
      </Card>
      
      {!todaysEntry && <MoodLogger onSave={addMoodEntry} isSaving={isSaving} />}
      
      {todaysEntry && (
        <Card className={wasJustAdded ? 'animate-entry-complete' : ''}>
          <h3 className="text-xl font-semibold mb-3 text-text-light dark:text-text-dark">Today's Reflection</h3>
          <div className="flex items-center space-x-4 mb-4">
            <span className="text-5xl">{todaysEntry.mood.emoji}</span>
            <div>
              <p className="text-lg font-medium" style={{color: todaysEntry.mood.color}}>You felt {todaysEntry.mood.name}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{new Date(todaysEntry.date).toLocaleTimeString()}</p>
            </div>
          </div>
          {todaysEntry.journal && <div className="text-text-light dark:text-gray-300 bg-gray-100 dark:bg-gray-700/50 p-3 rounded-lg journal-content" dangerouslySetInnerHTML={{ __html: todaysEntry.journal }} />}
          
          {todaysEntry.aiFeedback === undefined && todaysEntry.needsAiFeedback && (
              <div className="mt-4 p-4 rounded-lg bg-gray-100 dark:bg-gray-700/50">
                  <p className="text-sm text-text-light dark:text-gray-200">You were offline. Aura's note will appear here once you reconnect.</p>
              </div>
          )}
          
          {todaysEntry.aiFeedback && (
             <div className="mt-4 p-4 rounded-lg bg-primary/10 dark:bg-primary-dark/20 border-l-4 border-primary dark:border-primary-dark">
                <p className="font-semibold text-primary dark:text-primary-dark mb-1">Aura's Note</p>
                <p className="text-sm text-text-light dark:text-gray-200">{todaysEntry.aiFeedback}</p>
             </div>
          )}
           <div className="mt-6 flex justify-end">
            <Button variant="secondary" onClick={handleShare} className="flex items-center space-x-2">
              <ShareIcon className="h-5 w-5" />
              <span>Share</span>
            </Button>
          </div>
        </Card>
      )}

      {todaysEntry && (
        <Card>
          <h3 className="text-xl font-semibold mb-3 text-text-light dark:text-text-dark">
              Music for Your Mood: <span style={{color: todaysEntry.mood.color}}>{todaysEntry.mood.name} {todaysEntry.mood.emoji}</span>
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">Here are some playlist ideas from Aura to match your vibe.</p>
          
          {isLoadingPlaylists ? (
              <div className="space-y-4 animate-pulse">
                  {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex justify-between items-center p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                          <div className="flex items-center space-x-3">
                              <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                              <div className="space-y-1">
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                              </div>
                          </div>
                          <div className="h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                      </div>
                  ))}
              </div>
          ) : !isOnline ? (
             <p className="text-center text-sm text-gray-500 dark:text-gray-400">Playlist suggestions are unavailable while offline.</p>
          ) : (
              <div className="space-y-4">
                  {MUSIC_SERVICES.map((service, index) => {
                      const suggestion = playlistSuggestions[index] || { title: `Music for a ${todaysEntry.mood.name} day`, description: 'A mix to match your feelings.' };
                      const searchLink = `${service.searchUrl}${encodeURIComponent(suggestion.title)}`;
                      
                      return (
                          <div key={service.name} className="flex justify-between items-center p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                              <div className="flex items-center space-x-3 overflow-hidden">
                                  <service.icon className="h-8 w-8 flex-shrink-0" style={{color: service.color}}/>
                                  <div className="overflow-hidden">
                                    <p className="font-semibold text-text-light dark:text-text-dark truncate">{suggestion.title}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{suggestion.description}</p>
                                  </div>
                              </div>
                              <a href={searchLink} target="_blank" rel="noopener noreferrer" className="flex-shrink-0 ml-2">
                                  <Button variant="secondary">Find</Button>
                              </a>
                          </div>
                      );
                  })}
              </div>
          )}
        </Card>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="bg-gradient-to-br from-indigo-50 to-yellow-50 dark:from-gray-800/60 dark:to-purple-900/30">
          <h3 className="text-xl font-semibold mb-4 text-text-light dark:text-text-dark">Aura's Forecast</h3>
          {isLoadingForecast && isOnline ? (
            <div className="flex items-center space-x-4 text-text-light dark:text-text-dark">
              <span className="text-3xl animate-pulse">🔮</span>
              <div className="flex-1">
                <p className="font-semibold">Analyzing mood patterns...</p>
              </div>
            </div>
          ) : (
            <div className="flex items-start space-x-4">
              <div className="text-3xl mt-1">🔮</div>
              <p className="text-text-light dark:text-gray-300">{forecast}</p>
            </div>
          )}
        </Card>

        <Card>
          <h3 className="text-xl font-semibold mb-3 text-text-light dark:text-text-dark">Your Streak</h3>
          <div className="flex items-center space-x-4">
            <div className="text-5xl">🔥</div>
            <div>
              <p className="text-2xl font-bold text-primary dark:text-primary-dark">{streak} Day{streak !== 1 ? 's' : ''}</p>
              <p className="text-gray-500 dark:text-gray-400">Keep it up!</p>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="text-xl font-semibold mb-4 text-text-light dark:text-text-dark">Your Achievements</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          {ACHIEVEMENTS.map(achievement => {
            const isEarned = streak >= achievement.streak;
            return (
              <div 
                key={achievement.name} 
                className={`p-4 rounded-xl transition-all duration-300 ${isEarned ? 'bg-accent/10 dark:bg-accent/20 shadow-md' : 'bg-gray-100 dark:bg-gray-800/50 opacity-60'}`}
              >
                <achievement.icon 
                  className={`h-16 w-16 mx-auto mb-3 transition-all duration-300 ${isEarned ? 'text-accent' : 'text-gray-400 dark:text-gray-500'}`}
                  style={{ filter: isEarned ? 'none' : 'grayscale(100%)' }}
                />
                <p className={`font-bold text-lg ${isEarned ? 'text-text-light dark:text-text-dark' : 'text-gray-600 dark:text-gray-400'}`}>
                  {achievement.name}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{achievement.description}</p>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;