



import React, { useState, useEffect } from 'react';
import Card from './ui/Card';
import Button from './ui/Button';
import { getAICopingTip, getAIDreamAnalysis } from '../services/geminiService';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

// --- Sub-components for Tools Page ---

const BreathingExercise = () => {
    const [duration, setDuration] = useState(60);
    const [timeLeft, setTimeLeft] = useState(duration);
    const [isActive, setIsActive] = useState(false);
    const [phase, setPhase] = useState<'in' | 'hold' | 'out'>('in');
  
    useEffect(() => {
        setTimeLeft(duration);
    }, [duration]);

    useEffect(() => {
      if (!isActive) return;
  
      const phases = {
        in: { duration: 4, next: 'hold' as const, instruction: 'Breathe In...' },
        hold: { duration: 4, next: 'out' as const, instruction: 'Breathe Out...' },
        out: { duration: 6, next: 'in' as const, instruction: 'Breathe In...' },
      };
      
      let phaseTimer = 0;
      // FIX: Explicitly type `currentPhase` to match the state's union type.
      let currentPhase: 'in' | 'hold' | 'out' = 'in';
      setPhase('in');

      const interval = setInterval(() => {
        setTimeLeft(prev => {
            if (prev <= 1) {
                setIsActive(false);
                return 0;
            }
            return prev - 1;
        });

        phaseTimer++;
        if (phaseTimer >= phases[currentPhase].duration) {
            phaseTimer = 0;
            currentPhase = phases[currentPhase].next;
            setPhase(currentPhase);
        }
      }, 1000);
  
      return () => clearInterval(interval);
    }, [isActive]);

    const phaseInstructions = {
        in: 'Breathe In...',
        hold: 'Hold...',
        out: 'Breathe Out...',
    };
  
    const toggleActive = () => {
      if (isActive) {
        setIsActive(false);
        setTimeLeft(duration);
      } else {
        setIsActive(true);
      }
    };
  
    const formatTime = (seconds: number) => {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    };
  
    return (
      <Card>
        <h3 className="text-xl font-semibold mb-4 text-text-light dark:text-text-dark">Guided Breathing</h3>
        <div className="flex flex-col items-center justify-center space-y-6 h-80">
          <div className="relative w-48 h-48 flex items-center justify-center">
            <div className={`absolute w-full h-full bg-primary/20 dark:bg-primary-dark/20 rounded-full transition-transform duration-[3000ms] ease-in-out ${isActive && phase === 'in' ? 'scale-100' : 'scale-50'} ${isActive && phase === 'out' ? 'scale-50' : ''}`}/>
            <div className={`w-32 h-32 bg-primary dark:bg-primary-dark rounded-full flex items-center justify-center transition-transform duration-[3000ms] ease-in-out ${isActive && phase === 'in' ? 'scale-100' : 'scale-75'} ${isActive && phase === 'out' ? 'scale-75' : ''}`}>
                 <span className="text-white font-bold text-2xl">{formatTime(timeLeft)}</span>
            </div>
          </div>
          <p className="text-lg font-semibold text-text-light dark:text-gray-300 h-6">
            {isActive ? phaseInstructions[phase] : 'Ready?'}
          </p>
        </div>
        <div className="flex justify-between items-center mt-4">
            <div className="flex space-x-2">
                <Button variant={duration === 60 ? 'primary' : 'secondary'} onClick={() => setDuration(60)} disabled={isActive}>1 Min</Button>
                <Button variant={duration === 180 ? 'primary' : 'secondary'} onClick={() => setDuration(180)} disabled={isActive}>3 Min</Button>
            </div>
          <Button onClick={toggleActive} className="w-24">{isActive ? 'Stop' : 'Start'}</Button>
        </div>
      </Card>
    );
};

const MeditationTimer = () => {
    const [duration] = useState(25 * 60); // 25 minutes
    const [timeLeft, setTimeLeft] = useState(duration);
    const [isActive, setIsActive] = useState(false);

    useEffect(() => {
        // FIX: Replaced `NodeJS.Timeout` with `ReturnType<typeof setInterval>` for browser compatibility.
        let interval: ReturnType<typeof setInterval> | null = null;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft(time => time - 1);
            }, 1000);
        } else if (!isActive && timeLeft !== 0) {
            if(interval) clearInterval(interval);
        } else if (timeLeft === 0) {
            setIsActive(false);
            // Optionally play a sound here
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isActive, timeLeft]);
    
    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes < 10 ? '0' : ''}${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    };

    const handleReset = () => {
        setIsActive(false);
        setTimeLeft(duration);
    };

    return (
        <Card>
            <h3 className="text-xl font-semibold mb-4 text-text-light dark:text-text-dark">Meditation & Focus Timer</h3>
            <div className="flex flex-col items-center justify-center space-y-6 h-48">
                <p className="text-7xl font-bold font-mono text-primary dark:text-primary-dark tracking-wider">
                    {formatTime(timeLeft)}
                </p>
                 <p className="text-gray-500 dark:text-gray-400">25-minute focus session (Pomodoro)</p>
            </div>
            <div className="flex justify-center space-x-4 mt-4">
                <Button onClick={() => setIsActive(!isActive)} className="w-28">
                    {isActive ? 'Pause' : 'Start'}
                </Button>
                <Button onClick={handleReset} variant="secondary">Reset</Button>
            </div>
        </Card>
    )
}

const CopingTips = () => {
    const [tip, setTip] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const isOnline = useOnlineStatus();

    const fetchTip = async () => {
        setIsLoading(true);
        const newTip = await getAICopingTip();
        setTip(newTip);
        setIsLoading(false);
    };
    
    useEffect(() => {
        if (!isOnline) {
            setTip("Coping tips are unavailable while you're offline.");
        } else {
            setTip(""); // Clear offline message when back online
        }
    }, [isOnline]);

    return (
        <Card>
            <h3 className="text-xl font-semibold mb-4 text-text-light dark:text-text-dark">Coping Tips Library</h3>
            <div className="min-h-[100px] p-4 rounded-lg bg-gray-100 dark:bg-gray-700/50 flex items-center justify-center text-center">
                {isLoading ? (
                    <p className="animate-pulse">Aura is thinking...</p>
                ) : (
                    <p className="text-text-light dark:text-gray-300">{tip || "Get a quick, actionable tip from Aura to help you navigate your feelings."}</p>
                )}
            </div>
            <div className="mt-4 text-center">
                <Button onClick={fetchTip} disabled={isLoading || !isOnline}>
                    {isLoading ? 'Generating...' : 'Get a Quick Tip'}
                </Button>
            </div>
        </Card>
    )
}

const DreamAnalyzer = () => {
    const [dream, setDream] = useState('');
    const [analysis, setAnalysis] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const isOnline = useOnlineStatus();

    const handleAnalyze = async () => {
        if (!dream) return;
        setIsLoading(true);
        const result = await getAIDreamAnalysis(dream);
        setAnalysis(result);
        setIsLoading(false);
    };

    return (
        <Card>
            <h3 className="text-xl font-semibold mb-4 text-text-light dark:text-text-dark">AI Dream Analyzer</h3>
            <div className="space-y-4">
                <textarea
                    value={dream}
                    onChange={(e) => setDream(e.target.value)}
                    placeholder="Describe your dream here... The more detail, the better."
                    className="w-full h-28 p-3 rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-primary dark:focus:ring-primary-dark outline-none transition"
                    disabled={isLoading || !isOnline}
                />
                <Button onClick={handleAnalyze} disabled={isLoading || !dream.trim() || !isOnline}>
                    {isLoading ? 'Aura is Interpreting...' : 'Analyze My Dream'}
                </Button>
                {!isOnline && <p className="text-sm text-center text-gray-500 dark:text-gray-400">Dream Analyzer requires an internet connection.</p>}
                {analysis && (
                    <div className="mt-4 p-4 rounded-lg bg-primary/10 dark:bg-primary-dark/20 border-l-4 border-primary dark:border-primary-dark animate-fade-in">
                        <p className="font-semibold text-primary dark:text-primary-dark mb-1">Aura's Interpretation</p>
                        <p className="text-sm text-text-light dark:text-gray-200">{analysis}</p>
                    </div>
                )}
            </div>
             <style>{`
              @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
              .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
            `}</style>
        </Card>
    );
}

const MoodReset = () => {
    const activities = [
        { name: 'Watch a funny video', link: 'https://www.youtube.com/results?search_query=funny+short+videos' },
        { name: 'Stretch for 30 seconds', action: () => alert("Time to stretch! Reach for the sky, then touch your toes.") },
        { name: 'Smile Challenge 😊', action: () => alert("Hold a smile for 15 seconds, even if it feels forced. Notice how you feel after!") },
    ];

    return (
        <Card>
            <h3 className="text-xl font-semibold mb-4 text-text-light dark:text-text-dark">Mood Reset Button</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">Need a quick boost? Try one of these.</p>
            <div className="flex flex-col sm:flex-row gap-2">
                {activities.map(activity => (
                    <a 
                        key={activity.name}
                        href={activity.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex-1"
                        onClick={(e) => {
                            if (activity.action) {
                                e.preventDefault();
                                activity.action();
                            }
                        }}
                    >
                        <Button variant="secondary" className="w-full">{activity.name}</Button>
                    </a>
                ))}
            </div>
        </Card>
    );
};


const Tools: React.FC = () => {
  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-8">
      <header>
        <h1 className="text-4xl font-bold text-text-light dark:text-text-dark">Emotional Toolkit</h1>
        <p className="text-lg text-gray-500 dark:text-gray-400 mt-1">
          Active resources to help you regulate and reflect.
        </p>
      </header>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <BreathingExercise />
        <MeditationTimer />
        <CopingTips />
        <MoodReset />
        <div className="lg:col-span-2">
            <DreamAnalyzer />
        </div>
      </div>
    </div>
  );
};

export default Tools;