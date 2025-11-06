import React, { useState, useRef, useEffect } from 'react';
import Card from './ui/Card';
import Button from './ui/Button';
import { getEmotionFromImage, EmotionScanResult } from '../services/geminiService';
import { MOODS } from '../constants';
import type { Mood } from '../types';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

type Sensitivity = 'accuracy' | 'realtime';

const Vision: React.FC = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [scanResult, setScanResult] = useState<EmotionScanResult | null>(null);
    const [detectedMood, setDetectedMood] = useState<Mood | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const isOnline = useOnlineStatus();

    const [sensitivity, setSensitivity] = useState<Sensitivity>('accuracy');
    const [isRealtimeScanning, setIsRealtimeScanning] = useState(false);
    const realtimeIntervalRef = useRef<number | null>(null);

    const startCamera = async () => {
        setError(null);
        setScanResult(null);
        setDetectedMood(null);
        try {
            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
                setStream(mediaStream);
                if (videoRef.current) {
                    videoRef.current.srcObject = mediaStream;
                }
            } else {
                setError("Your browser does not support camera access.");
            }
        } catch (err) {
            console.error(err);
            setError("Could not access the camera. Please ensure you have given permission.");
        }
    };
    
    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    };

    const performScan = async (jpegQuality: number) => {
        if (!videoRef.current || !canvasRef.current || !isOnline) {
            if (!isOnline) setError("AI scanning requires an internet connection.");
            return;
        }

        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const context = canvas.getContext('2d');
        if (!context) {
            setError("Could not get canvas context.");
            return;
        }
        
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = canvas.toDataURL('image/jpeg', jpegQuality).split(',')[1];
        
        const result = await getEmotionFromImage(imageData);
        
        if (result) {
            setScanResult(result);
            const mood = MOODS.find(m => m.name.toLowerCase() === result.emotion.toLowerCase()) || null;
            setDetectedMood(mood);
            setError(null); 
        } else {
            if (sensitivity === 'accuracy') {
                setError("Aura is having a little trouble reading the emotion. Could you try getting closer to the camera with good, even lighting? A clear view helps! ✨");
            }
            setScanResult(null);
            setDetectedMood(null);
        }
    };

    const handleAccuracyScan = async () => {
        setIsLoading(true);
        setError(null);
        setScanResult(null);
        setDetectedMood(null);
        await performScan(0.95); 
        setIsLoading(false);
    };

    const toggleRealtimeScan = () => {
        if (isRealtimeScanning) {
            if (realtimeIntervalRef.current) {
                clearInterval(realtimeIntervalRef.current);
            }
            setIsRealtimeScanning(false);
            setIsLoading(false);
        } else {
            setError(null);
            setIsRealtimeScanning(true);
            setIsLoading(true);
            performScan(0.7);
            realtimeIntervalRef.current = window.setInterval(() => {
                performScan(0.7);
            }, 2500);
        }
    };

    useEffect(() => {
        return () => {
            if (realtimeIntervalRef.current) {
                clearInterval(realtimeIntervalRef.current);
            }
            stopCamera();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (isRealtimeScanning) {
            toggleRealtimeScan();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [stream, sensitivity]);

    // Scale intensity (0.1 to 1.0) to opacity (0.2 to 0.8) for the aura effect
    const auraOpacity = scanResult && scanResult.intensity ? 0.2 + ((scanResult.intensity - 0.1) * (0.6 / 0.9)) : 0;


    return (
        <div className="p-4 sm:p-6 md:p-8 space-y-8">
            <header>
                <h1 className="text-4xl font-bold text-text-light dark:text-text-dark">Vision Lab</h1>
                <p className="text-lg text-gray-500 dark:text-gray-400 mt-1">
                    Explore your emotions with AI-powered face analysis and AR.
                </p>
            </header>

            <Card>
                <h2 className="text-2xl font-semibold mb-4 text-text-light dark:text-text-dark">AI Emotion Scanner</h2>
                <div className="mb-6">
                    <p className="font-semibold text-text-light dark:text-gray-200 mb-2">Scanner Sensitivity</p>
                    <div className="flex rounded-lg p-1 bg-gray-200 dark:bg-gray-700 max-w-sm">
                        <button 
                            onClick={() => setSensitivity('accuracy')} 
                            disabled={isRealtimeScanning || isLoading}
                            className={`flex-1 p-2 rounded-md text-sm font-semibold transition-colors ${sensitivity === 'accuracy' ? 'bg-white dark:bg-gray-800 text-primary dark:text-primary-dark shadow' : 'text-gray-600 dark:text-gray-400'}`}
                        >
                            High Accuracy (Slower)
                        </button>
                        <button 
                            onClick={() => setSensitivity('realtime')} 
                            disabled={isRealtimeScanning || isLoading}
                            className={`flex-1 p-2 rounded-md text-sm font-semibold transition-colors ${sensitivity === 'realtime' ? 'bg-white dark:bg-gray-800 text-primary dark:text-primary-dark shadow' : 'text-gray-600 dark:text-gray-400'}`}
                        >
                            Real-time (Faster)
                        </button>
                    </div>
                </div>

                {!isOnline && <p className="text-sm text-center text-gray-500 dark:text-gray-400 mb-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">The AI Emotion Scanner is unavailable while offline.</p>}
                <div className="flex flex-col lg:flex-row gap-8">
                    <div className="flex-1 space-y-4">
                        <div className="relative w-full aspect-video bg-gray-200 dark:bg-gray-800 rounded-lg overflow-hidden flex items-center justify-center">
                            <video ref={videoRef} autoPlay playsInline muted className={`w-full h-full object-cover ${!stream && 'hidden'}`}></video>
                            {!stream && <p className="text-gray-500">Camera is off</p>}
                             {detectedMood && scanResult && (
                                // FIX: Cast style object to `React.CSSProperties` to allow custom CSS properties.
                                <div 
                                    className="absolute inset-0 z-10 pointer-events-none animate-aura-pulse"
                                    style={{
                                        background: `radial-gradient(circle, transparent 40%, ${detectedMood.color} 100%)`,
                                        '--aura-opacity': auraOpacity,
                                    } as React.CSSProperties}
                                />
                            )}
                        </div>
                        <canvas ref={canvasRef} className="hidden"></canvas>
                        <div className="flex gap-4">
                            {!stream ? (
                                <Button onClick={startCamera} disabled={!isOnline}>Start Camera</Button>
                            ) : (
                                <>
                                    {sensitivity === 'accuracy' ? (
                                        <Button onClick={handleAccuracyScan} disabled={isLoading || !isOnline}>
                                            {isLoading ? "Scanning..." : "Scan My Emotion"}
                                        </Button>
                                    ) : (
                                        <Button onClick={toggleRealtimeScan} disabled={!isOnline} variant={isRealtimeScanning ? 'danger' : 'primary'}>
                                            {isRealtimeScanning ? "Stop Real-time Scan" : "Start Real-time Scan"}
                                        </Button>
                                    )}
                                    <Button onClick={stopCamera} variant="secondary" disabled={isRealtimeScanning}>Stop Camera</Button>
                                </>
                            )}
                        </div>
                    </div>
                    <div className="flex-1">
                        <h3 className="text-xl font-semibold mb-3">Aura's Analysis</h3>
                        {(isLoading && !isRealtimeScanning) && (
                            <div className="flex flex-col items-center justify-center text-center p-4 space-y-3">
                                <svg className="animate-spin h-12 w-12 text-primary dark:text-primary-dark" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <p className="font-semibold text-text-light dark:text-text-dark">Aura is analyzing...</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Finding the feeling in your expression.</p>
                              </div>
                        )}
                        {error && <p className="text-danger p-3 bg-danger/10 rounded-lg">{error}</p>}
                        {scanResult && detectedMood && (
                             <div className="space-y-4 p-4 rounded-lg bg-primary/5 dark:bg-primary-dark/10">
                                <div className="flex items-center space-x-3">
                                    <span className="text-5xl">{detectedMood.emoji}</span>
                                    <div>
                                        <p className="text-sm text-gray-500">Aura sees:</p>
                                        <p className="text-2xl font-bold" style={{color: detectedMood.color}}>{detectedMood.name}</p>
                                    </div>
                                </div>
                                <div>
                                    <p className="font-semibold text-text-light dark:text-gray-200 mb-1">Detected Intensity:</p>
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                                        <div
                                            className="h-2.5 rounded-full"
                                            style={{
                                                width: `${scanResult.intensity * 100}%`,
                                                backgroundColor: detectedMood.color,
                                                transition: 'width 0.5s ease-in-out'
                                            }}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <p className="font-semibold text-text-light dark:text-gray-200 mb-1">A gentle suggestion:</p>
                                    <p className="text-text-light dark:text-gray-300">{scanResult.suggestion}</p>
                                </div>
                                 <div>
                                    <p className="font-semibold text-text-light dark:text-gray-200 mb-1">AR Mood Mirror:</p>
                                    <p className="text-text-light dark:text-gray-300">An emotional aura, pulsing gently, is now active on your camera feed. Its brightness reflects the intensity of your detected mood.</p>
                                 </div>
                             </div>
                        )}
                        {!isLoading && !scanResult && !error && (
                            <p className="text-gray-500">
                                {sensitivity === 'realtime' 
                                ? "Start the real-time scan to get continuous feedback from Aura." 
                                : "Start your camera and scan to see Aura's analysis."}
                            </p>
                        )}
                         {(isRealtimeScanning && !scanResult && !error) && (
                            <p className="text-gray-500 animate-pulse">Aura is actively scanning...</p>
                        )}
                    </div>
                </div>
            </Card>
            <style>{`
                @keyframes aura-pulse {
                    0% { opacity: var(--aura-opacity, 0.5); }
                    50% { opacity: calc(var(--aura-opacity, 0.5) + 0.15); }
                    100% { opacity: var(--aura-opacity, 0.5); }
                }
                .animate-aura-pulse {
                    animation: aura-pulse 3s infinite ease-in-out;
                }
            `}</style>
        </div>
    );
};

export default Vision;