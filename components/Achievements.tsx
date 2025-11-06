import React from 'react';
import type { MoodEntry } from '../types';
import { ACHIEVEMENTS } from '../constants';
import Card from './ui/Card';

interface AchievementsProps {
  moodEntries: MoodEntry[];
}

const Achievements: React.FC<AchievementsProps> = ({ moodEntries }) => {
  // Copied from Dashboard.tsx for consistency
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

  const streak = calculateStreak();

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-8">
      <header>
        <h1 className="text-4xl font-bold text-text-light dark:text-text-dark">Your Achievements</h1>
        <p className="text-lg text-gray-500 dark:text-gray-400 mt-1">
          Track your progress and celebrate your consistency.
        </p>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {ACHIEVEMENTS.map(achievement => {
          const isEarned = streak >= achievement.streak;
          const progress = Math.min((streak / achievement.streak) * 100, 100);

          return (
            <Card key={achievement.name} className={`transition-all duration-300 ${isEarned ? 'border-2 border-accent/50 bg-accent/5 dark:bg-accent/10' : 'opacity-80 hover:opacity-100'}`}>
              <div className="flex flex-col h-full">
                <div className="flex items-center space-x-4">
                  <achievement.icon 
                    className={`h-16 w-16 p-3 rounded-lg transition-all duration-300 ${isEarned ? 'text-accent bg-accent/10' : 'text-gray-400 bg-gray-200 dark:bg-gray-700'}`}
                  />
                  <div>
                    <h3 className="text-xl font-bold text-text-light dark:text-text-dark">{achievement.name}</h3>
                    <p className="text-gray-500 dark:text-gray-400">{achievement.description}</p>
                  </div>
                </div>

                <div className="mt-auto pt-4">
                  <p className="text-sm font-semibold text-text-light dark:text-gray-300 mb-2">
                    {isEarned ? 'Unlocked!' : 'Progress'}
                  </p>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full transition-all duration-500 ${isEarned ? 'bg-success' : 'bg-accent'}`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-right text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {Math.min(streak, achievement.streak)} / {achievement.streak} days
                  </p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default Achievements;
