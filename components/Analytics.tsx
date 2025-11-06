import React, { useState, useEffect } from 'react';
import type { MoodEntry } from '../types';
import { MOODS } from '../constants';
import Card from './ui/Card';
// FIX: Corrected the imported function name to match the fix in geminiService.ts.
import { getAIMoodInsights } from '../services/geminiService';
import { useOnlineStatus } from '../hooks/useOnlineStatus';


// Recharts is loaded from CDN and available on the window object
// FIX: Add type definition for window.Recharts to fix TypeScript error.
declare global {
  interface Window {
    Recharts: any;
  }
}

interface AnalyticsProps {
  moodEntries: MoodEntry[];
  isDarkMode: boolean;
}

const Analytics: React.FC<AnalyticsProps> = ({ moodEntries, isDarkMode }) => {
  const [aiInsight, setAiInsight] = useState('');
  const [isLoadingInsight, setIsLoadingInsight] = useState(false);
  const isOnline = useOnlineStatus();

  useEffect(() => {
    const fetchInsight = async () => {
      setIsLoadingInsight(true);
      // FIX: Corrected function name to match the fix in geminiService.ts.
      const insight = await getAIMoodInsights(moodEntries);
      setAiInsight(insight);
      setIsLoadingInsight(false);
    };
    if(moodEntries.length > 0) {
        fetchInsight();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moodEntries, isOnline]);


  // Wait for Recharts to be available from the CDN. Check for a specific component to ensure it's fully loaded.
  if (!window.Recharts || !window.Recharts.ResponsiveContainer) {
    return (
      <div className="flex items-center justify-center h-full p-8 text-center">
        <Card>
          <h2 className="text-2xl font-bold text-text-light dark:text-text-dark">Loading Charts...</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Please wait a moment while we load the charting library.</p>
        </Card>
      </div>
    );
  }

  const { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } = window.Recharts;
  
  const customTooltipStyle = {
    backgroundColor: isDarkMode ? 'rgba(30, 41, 59, 0.7)' : 'rgba(255, 255, 255, 0.7)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    color: isDarkMode ? '#e5e7eb' : '#1f2937',
    padding: '8px 12px',
    boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
  };

  const processTrendData = () => {
    const last30Days = new Map<string, { totalValue: number; count: number }>();
    moodEntries
      .filter(entry => {
        const entryDate = new Date(entry.date);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return entryDate > thirtyDaysAgo;
      })
      .forEach(entry => {
        const day = new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        if (!last30Days.has(day)) {
          last30Days.set(day, { totalValue: 0, count: 0 });
        }
        const current = last30Days.get(day)!;
        current.totalValue += entry.mood.value;
        current.count += 1;
      });

    return Array.from(last30Days.entries())
      .map(([name, data]) => ({ name, moodScore: data.totalValue / data.count }))
      .reverse();
  };

  const processFrequencyData = () => {
    const moodCounts = MOODS.map(mood => ({ name: mood.name, value: 0, color: mood.color }));
    moodEntries.forEach(entry => {
      const moodData = moodCounts.find(m => m.name === entry.mood.name);
      if (moodData) {
        moodData.value += 1;
      }
    });
    return moodCounts.filter(m => m.value > 0);
  };

  const trendData = processTrendData();
  const frequencyData = processFrequencyData();

  if (moodEntries.length === 0) {
    return (
      <div className="flex items-center justify-center h-full p-8 text-center">
        <Card>
          <h2 className="text-2xl font-bold text-text-light dark:text-text-dark">No Data Yet</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Start logging your moods to see your analytics and unlock insights!</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-8">
      <header>
        <h1 className="text-4xl font-bold text-text-light dark:text-text-dark">Your Analytics</h1>
        <p className="text-lg text-gray-500 dark:text-gray-400 mt-1">Discover patterns in your emotional landscape.</p>
      </header>

      <Card>
        <h3 className="text-xl font-semibold mb-3 text-text-light dark:text-text-dark">AI Insight from Aura</h3>
        {isLoadingInsight ? (
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
        ) : (
            <p className="text-primary dark:text-primary-dark font-medium">{aiInsight}</p>
        )}
      </Card>

      <div className="grid lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2">
          <h3 className="text-xl font-semibold mb-6 text-text-light dark:text-text-dark">Mood Trend (Last 30 Days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
              <XAxis dataKey="name" stroke="currentColor" className="text-xs" />
              <YAxis domain={[1, 5]} stroke="currentColor" />
              <Tooltip contentStyle={customTooltipStyle} />
              <Legend />
              <Line type="monotone" dataKey="moodScore" stroke="#6C63FF" strokeWidth={3} dot={{ r: 5 }} activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
        
        <Card>
          <h3 className="text-xl font-semibold mb-6 text-text-light dark:text-text-dark">Mood Frequency</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={frequencyData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
              >
                {frequencyData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={customTooltipStyle} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;