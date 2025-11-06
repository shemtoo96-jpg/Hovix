
import React, { useState } from 'react';
import type { MoodEntry } from '../types';
import Modal from './ui/Modal';
import Card from './ui/Card';

interface CalendarProps {
  moodEntries: MoodEntry[];
}

const Calendar: React.FC<CalendarProps> = ({ moodEntries }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEntry, setSelectedEntry] = useState<MoodEntry | null>(null);

  const startDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();

  const entriesByDate = new Map<string, MoodEntry>();
  moodEntries.forEach(entry => {
    const dateStr = new Date(entry.date).toDateString();
    if (!entriesByDate.has(dateStr)) {
      entriesByDate.set(dateStr, entry);
    }
  });

  const changeMonth = (offset: number) => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
  };

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <header className="mb-6">
        <h1 className="text-4xl font-bold text-text-light dark:text-text-dark">Mood Calendar</h1>
        <p className="text-lg text-gray-500 dark:text-gray-400 mt-1">A visual journey of your emotions.</p>
      </header>

      <Card>
        <div className="flex justify-between items-center mb-4">
          <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
            &lt;
          </button>
          <h2 className="text-xl font-semibold text-text-light dark:text-text-dark">
            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </h2>
          <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
            &gt;
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center font-semibold text-gray-500 dark:text-gray-400 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day}>{day}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: startDay }).map((_, i) => (
            <div key={`empty-${i}`}></div>
          ))}
          {Array.from({ length: daysInMonth }).map((_, day) => {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day + 1);
            const dateString = date.toDateString();
            const entry = entriesByDate.get(dateString);

            return (
              <div 
                key={day} 
                className={`relative h-16 flex items-center justify-center rounded-lg cursor-pointer transition-colors ${entry ? 'hover:bg-gray-100 dark:hover:bg-gray-800' : ''}`}
                onClick={() => entry && setSelectedEntry(entry)}
              >
                <span>{day + 1}</span>
                {entry && (
                  <span
                    className="absolute bottom-2 h-2 w-2 rounded-full"
                    style={{ backgroundColor: entry.mood.color }}
                  ></span>
                )}
              </div>
            );
          })}
        </div>
      </Card>
      
      <Modal isOpen={!!selectedEntry} onClose={() => setSelectedEntry(null)} title="Mood Details">
        {selectedEntry && (
             <div className="space-y-4">
               <div className="flex items-center space-x-4">
                <span className="text-5xl">{selectedEntry.mood.emoji}</span>
                 <div>
                  <p className="text-lg font-medium" style={{color: selectedEntry.mood.color}}>You felt {selectedEntry.mood.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{new Date(selectedEntry.date).toLocaleString()}</p>
                </div>
              </div>
              {selectedEntry.journal && <div className="text-text-light dark:text-gray-300 bg-gray-100 dark:bg-gray-700/50 p-3 rounded-lg journal-content" dangerouslySetInnerHTML={{ __html: selectedEntry.journal }} />}
              {selectedEntry.aiFeedback && (
                 <div className="mt-4 p-4 rounded-lg bg-primary/10 dark:bg-primary-dark/20 border-l-4 border-primary dark:border-primary-dark">
                    <p className="font-semibold text-primary dark:text-primary-dark mb-1">Aura's Note</p>
                    <p className="text-sm text-text-light dark:text-gray-200">{selectedEntry.aiFeedback}</p>
                 </div>
              )}
             </div>
        )}
      </Modal>

    </div>
  );
};

export default Calendar;