
import React, { useState, useEffect } from 'react';
import Card from './ui/Card';
import Button from './ui/Button';
import { COMMUNITY_CHALLENGES } from '../constants';

const ANONYMOUS_MOODS = [
    "Someone feels anxious today.",
    "Someone is feeling a bit down.",
    "Someone is celebrating a small win!",
    "Someone is feeling overwhelmed with work.",
    "Someone feels hopeful about the future."
];

const Community: React.FC = () => {
    const [activeMood, setActiveMood] = useState('');
    const [loveSent, setLoveSent] = useState(false);
    
    useEffect(() => {
        // Pick a random mood when the component loads
        setActiveMood(ANONYMOUS_MOODS[Math.floor(Math.random() * ANONYMOUS_MOODS.length)]);
    }, []);

    const handleSendLove = () => {
        setLoveSent(true);
        setTimeout(() => {
            setLoveSent(false);
            // Optional: change the mood after sending love
            setActiveMood(ANONYMOUS_MOODS[Math.floor(Math.random() * ANONYMOUS_MOODS.length)]);
        }, 2000); // Reset after 2 seconds
    }
    
    const handleJoinChallenge = (challengeName: string) => {
        alert(`You've joined the "${challengeName}" challenge! Good luck!`);
    }

    return (
        <div className="p-4 sm:p-6 md:p-8 space-y-8">
            <header>
                <h1 className="text-4xl font-bold text-text-light dark:text-text-dark">Community Hub</h1>
                <p className="text-lg text-gray-500 dark:text-gray-400 mt-1">
                    Connect, share, and grow with others. You are not alone.
                </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                
                {/* Support Circles Card */}
                <Card>
                    <h2 className="text-2xl font-semibold mb-3 text-text-light dark:text-text-dark">Support Circles</h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                        Create private groups with 3-5 friends to share your moods and send encouragement. A safe space for those you trust most.
                    </p>
                    <div className="text-center p-6 bg-gray-100 dark:bg-gray-800/50 rounded-lg">
                        <p className="font-bold text-lg text-primary dark:text-primary-dark">Coming Soon!</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">This feature is currently under development.</p>
                    </div>
                     <Button className="w-full mt-6" disabled>Create a Circle</Button>
                </Card>

                {/* Anonymous Support Room Card */}
                <Card className="relative overflow-hidden">
                    <h2 className="text-2xl font-semibold mb-3 text-text-light dark:text-text-dark">Anonymous Support Room</h2>
                     <div className="text-center p-6 my-4 bg-primary/10 dark:bg-primary-dark/20 rounded-lg">
                        <p className="text-lg font-medium text-text-light dark:text-text-dark">
                            {activeMood}
                        </p>
                    </div>
                    <p className="text-center text-gray-500 dark:text-gray-400 mb-4">Send some love and encouragement.</p>
                    <div className="flex justify-center space-x-3">
                        {['❤️', '💪', '🌸', '💛'].map(emoji => (
                            <button
                                key={emoji}
                                onClick={handleSendLove}
                                disabled={loveSent}
                                className="p-3 text-3xl rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-transform transform hover:scale-110 disabled:opacity-50"
                            >
                                {emoji}
                            </button>
                        ))}
                    </div>
                    {loveSent && (
                        <div className="absolute inset-0 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-sm flex items-center justify-center animate-fade-in-out">
                            <p className="text-2xl font-bold text-success">Love sent!</p>
                        </div>
                    )}
                </Card>

                {/* Mood Challenges Card */}
                <Card className="lg:col-span-2">
                    <h2 className="text-2xl font-semibold mb-4 text-text-light dark:text-text-dark">This Week's Mood Challenges</h2>
                    <div className="space-y-4">
                        {COMMUNITY_CHALLENGES.map(challenge => (
                            <div key={challenge.name} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                                <div className="flex items-center space-x-4">
                                    <span className="text-3xl">{challenge.emoji}</span>
                                    <div>
                                        <h4 className="font-semibold text-text-light dark:text-text-dark">{challenge.name}</h4>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{challenge.description}</p>
                                    </div>
                                </div>
                                <Button variant="secondary" onClick={() => handleJoinChallenge(challenge.name)}>Join</Button>
                            </div>
                        ))}
                    </div>
                </Card>

            </div>
             <style>{`
                @keyframes fade-in-out {
                    0% { opacity: 0; }
                    20% { opacity: 1; }
                    80% { opacity: 1; }
                    100% { opacity: 0; }
                }
                .animate-fade-in-out {
                    animation: fade-in-out 2s ease-in-out forwards;
                }
            `}</style>
        </div>
    );
};

export default Community;
