

import React, { useState, useEffect, useRef, FormEvent } from 'react';
import { GoogleGenAI, Chat } from "@google/genai";
import type { ChatMessage } from '../types';
import Button from './ui/Button';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { checkSafetyKeywords } from '../utils/safetyNet';
import SafetyNetModal from './ui/SafetyNetModal';


// Extend the window object for the SpeechRecognition API
declare global {
  interface Window {
    webkitSpeechRecognition: any;
  }
}

const Chat: React.FC = () => {
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSafetyModal, setShowSafetyModal] = useState(false);
  const isOnline = useOnlineStatus();

  const chatRef = useRef<Chat | null>(null);
  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      if (!process.env.API_KEY) {
          throw new Error("API_KEY environment variable not set.");
      }
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      chatRef.current = ai.chats.create({
          model: 'gemini-2.5-flash',
          config: {
              systemInstruction: "You are Aura, an empathetic and supportive AI friend. Your goal is to chat with the user, understand their feelings, and provide kind, encouraging, and helpful responses. Keep your responses relatively short and conversational. If the user expresses a strong negative emotion, gently guide them towards a positive reframe or a simple coping mechanism. For example, you could say: 'It sounds like you’ve had a tough day. Want me to help you list what went right today?'",
          },
      });
      setChatHistory([{ role: 'model', content: "Hi there! I'm Aura, your AI companion. Feel free to share what's on your mind." }]);
    } catch (e: any) {
        console.error(e);
        setError("Could not initialize AI chat. Please ensure your API key is configured.");
    }

    // Setup Speech Recognition
    if ('webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.lang = 'en-US';
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setUserInput(transcript);
      };

      recognitionRef.current.onstart = () => setIsListening(true);
      recognitionRef.current.onend = () => setIsListening(false);
      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, isLoading]);

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    const message = userInput.trim();
    if (!message || isLoading || !chatRef.current) return;
    
    if (checkSafetyKeywords(message)) {
      setShowSafetyModal(true);
    }

    setChatHistory(prev => [...prev, { role: 'user', content: message }]);
    setUserInput('');
    setIsLoading(true);

    try {
      const response = await chatRef.current.sendMessage({ message });
      // FIX: The .text accessor from the response is a property, not a function.
      setChatHistory(prev => [...prev, { role: 'model', content: response.text }]);
    } catch (err) {
      console.error("Error sending message to Gemini:", err);
      setChatHistory(prev => [...prev, { role: 'model', content: "I'm sorry, I'm having a little trouble connecting right now. Please try again in a moment." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleListening = () => {
    if (!recognitionRef.current) {
      alert("Voice input is not supported on your browser.");
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  return (
    <div className="flex flex-col h-full p-4 sm:p-6 md:p-8">
      <SafetyNetModal isOpen={showSafetyModal} onClose={() => setShowSafetyModal(false)} />
      <header className="mb-6">
        <h1 className="text-4xl font-bold text-text-light dark:text-text-dark">Chat with Aura</h1>
        <p className="text-lg text-gray-500 dark:text-gray-400 mt-1">
          Your always-available AI friend for short, supportive talks.
        </p>
      </header>

      <div className="flex-1 flex flex-col bg-white/50 dark:bg-gray-900/50 backdrop-blur-lg border border-gray-200 dark:border-gray-800 rounded-2xl shadow-lg overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {chatHistory.map((msg, index) => (
            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-lg px-4 py-3 rounded-2xl ${msg.role === 'user' ? 'bg-primary dark:bg-primary-dark text-white' : 'bg-gray-200 dark:bg-gray-700 text-text-light dark:text-text-dark'}`}>
                <p style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-lg px-4 py-3 rounded-2xl bg-gray-200 dark:bg-gray-700 text-text-light dark:text-text-dark">
                <div className="flex items-center space-x-1">
                  <span className="h-2 w-2 bg-gray-500 rounded-full animate-pulse [animation-delay:-0.3s]"></span>
                  <span className="h-2 w-2 bg-gray-500 rounded-full animate-pulse [animation-delay:-0.15s]"></span>
                  <span className="h-2 w-2 bg-gray-500 rounded-full animate-pulse"></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {error ? (
          <div className="p-4 text-center text-danger bg-danger/10">{error}</div>
        ) : (
          <div className="p-4 bg-white/70 dark:bg-gray-900/70 border-t border-gray-200 dark:border-gray-700">
             {!isOnline ? (
                <p className="text-center text-sm text-gray-500 dark:text-gray-400">Chat with Aura is unavailable while offline.</p>
             ) : (
                <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="Type your message..."
                    disabled={isLoading}
                    className="flex-1 p-3 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-primary dark:focus:ring-primary-dark outline-none transition"
                />
                <Button type="button" onClick={handleToggleListening} variant="secondary" className="!p-3" aria-label={isListening ? 'Stop listening' : 'Start listening'}>
                    {isListening ? (
                        <MicOnIcon className="h-6 w-6 text-danger" />
                    ) : (
                        <MicOffIcon className="h-6 w-6" />
                    )}
                </Button>
                <Button type="submit" disabled={isLoading || !userInput.trim()} className="!p-3">
                    <SendIcon className="h-6 w-6" />
                </Button>
                </form>
             )}
          </div>
        )}
      </div>
    </div>
  );
};

const MicOffIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m12 0v-1.5a6 6 0 00-6-6v0a6 6 0 00-6 6v1.5m6 12.75v-1.5" />
    </svg>
);

const MicOnIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m12 0v-1.5a6 6 0 00-6-6v0a6 6 0 00-6 6v1.5m6 12.75v-1.5" />
        <path strokeLinecap="round" d="M12 12.75a3 3 0 013-3V6a3 3 0 00-3-3v0a3 3 0 00-3 3v3.75a3 3 0 013 3z" />
    </svg>
);


const SendIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
    </svg>
);

export default Chat;