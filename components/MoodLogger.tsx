
import React, { useState, useRef, useEffect } from 'react';
import { MOODS } from '../constants';
import type { MoodEntry, Mood } from '../types';
import Button from './ui/Button';
import { getAIEmoCoachFeedback } from '../services/geminiService';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { checkSafetyKeywords } from '../utils/safetyNet';
import SafetyNetModal from './ui/SafetyNetModal';

// Extend the window object for the SpeechRecognition API
declare global {
  interface Window {
    webkitSpeechRecognition: any;
  }
}

interface MoodLoggerProps {
  onSave: (entry: MoodEntry) => void;
  isSaving: boolean;
}

// FIX: Refactored EditorButton to use a standard React.FC component with an explicit props interface. This can resolve subtle type inference issues that may cause "children is missing" errors.
interface EditorButtonProps {
  onClick: () => void;
  children: React.ReactNode;
}
const EditorButton: React.FC<EditorButtonProps> = ({ onClick, children }) => (
    <button type="button" onMouseDown={e => e.preventDefault()} onClick={onClick} className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-text-light dark:text-text-dark">
        {children}
    </button>
);

const BoldIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="currentColor"><path d="M15.6 10.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4.5-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10 6.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z"></path></svg>
);
const ItalicIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="currentColor"><path d="M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4z"></path></svg>
);
const ListIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="currentColor"><path d="M4 18h4v-2H4v2zm0-5h4v-2H4v2zm0-5h4V6H4v2zm6 10h12v-2H10v2zm0-5h12v-2H10v2zm0-7v2h12V6H10z"></path></svg>
);
const MicIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m12 0v-1.5a6 6 0 00-6-6v0a6 6 0 00-6 6v1.5m6 12.75v-1.5" />
    </svg>
);

const MoodLogger: React.FC<MoodLoggerProps> = ({ onSave, isSaving }) => {
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [journal, setJournal] = useState('');
  const [tags, setTags] = useState('');
  const [showSafetyModal, setShowSafetyModal] = useState(false);
  const isOnline = useOnlineStatus();
  const editorRef = useRef<HTMLDivElement>(null);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window)) {
      console.warn("Voice input is not supported in this browser.");
      return;
    }

    const SpeechRecognition = window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    const recognition = recognitionRef.current;
    
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
    };

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }

      if (finalTranscript && editorRef.current) {
        const currentContent = editorRef.current.innerHTML.replace(/<br\s*\/?>/gi, '');
        const separator = currentContent.length > 0 && !currentContent.endsWith(' ') ? ' ' : '';
        editorRef.current.innerHTML += separator + finalTranscript;
        setJournal(editorRef.current.innerHTML);

        const range = document.createRange();
        const sel = window.getSelection();
        if (sel) {
          range.selectNodeContents(editorRef.current);
          range.collapse(false);
          sel.removeAllRanges();
          sel.addRange(range);
        }
      }
    };

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const handleToggleListening = () => {
    if (!recognitionRef.current) {
      alert("Voice input is not supported on your browser.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      editorRef.current?.focus();
      recognitionRef.current.start();
    }
  };

  const handleSave = async () => {
    if (!selectedMood) {
      alert("Please select a mood.");
      return;
    }

    if (checkSafetyKeywords(journal)) {
      setShowSafetyModal(true);
    }
    
    let aiFeedback: string | null = null;
    let needsAiFeedback = false;

    if (isOnline) {
      aiFeedback = await getAIEmoCoachFeedback(selectedMood, journal);
    } else {
      needsAiFeedback = true;
    }

    const newEntry: MoodEntry = {
      id: new Date().toISOString(),
      mood: selectedMood,
      journal,
      tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
      date: new Date().toISOString(),
      aiFeedback: aiFeedback ?? undefined,
      needsAiFeedback,
    };

    onSave(newEntry);
    setSelectedMood(null);
    setJournal('');
    setTags('');
    if (editorRef.current) {
        editorRef.current.innerHTML = '';
    }
  };

  const formatDoc = (command: string) => {
    document.execCommand(command, false);
    editorRef.current?.focus();
  };

  return (
    <div className="bg-white/30 dark:bg-gray-800/50 p-6 rounded-2xl shadow-lg backdrop-blur-sm">
       <SafetyNetModal isOpen={showSafetyModal} onClose={() => setShowSafetyModal(false)} />
      <h2 className="text-2xl font-bold text-text-light dark:text-text-dark mb-4">How are you feeling today?</h2>
      
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-4">
        {MOODS.map(mood => (
          <button
            key={mood.name}
            onClick={() => setSelectedMood(mood)}
            className={`p-3 rounded-lg flex flex-col items-center justify-center transition-all duration-200 border-2 ${
              selectedMood?.name === mood.name
                ? 'border-primary dark:border-primary-dark shadow-lg scale-105'
                : 'border-transparent hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            style={{ backgroundColor: selectedMood?.name === mood.name ? `${mood.color}20` : '' }}
          >
            <span className="text-3xl">{mood.emoji}</span>
            <span className="text-sm font-medium text-text-light dark:text-gray-300 mt-1">{mood.name}</span>
          </button>
        ))}
      </div>

      {selectedMood && (
        <div className="space-y-4 animate-fade-in">
            <div>
              <div className="bg-gray-100 dark:bg-gray-800/50 rounded-t-lg border border-gray-200 dark:border-gray-600 border-b-0 flex items-center space-x-1 p-1">
                <EditorButton onClick={() => formatDoc('bold')}>
                  <BoldIcon className="h-5 w-5" />
                </EditorButton>
                <EditorButton onClick={() => formatDoc('italic')}>
                  <ItalicIcon className="h-5 w-5" />
                </EditorButton>
                <EditorButton onClick={() => formatDoc('insertUnorderedList')}>
                  <ListIcon className="h-5 w-5" />
                </EditorButton>
                <EditorButton onClick={handleToggleListening}>
                  <MicIcon className={`h-5 w-5 transition-colors ${isListening ? 'text-danger animate-pulse' : ''}`} />
                </EditorButton>
              </div>
              <div
                ref={editorRef}
                contentEditable="true"
                onInput={(e) => setJournal(e.currentTarget.innerHTML)}
                data-placeholder={`What's making you feel ${selectedMood.name.toLowerCase()}?`}
                className="relative w-full min-h-[6rem] p-3 rounded-b-lg bg-white dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-primary dark:focus:ring-primary-dark outline-none transition editor-placeholder"
              />
            </div>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="Add tags (e.g., #work, #family)"
            className="w-full p-3 rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-primary dark:focus:ring-primary-dark outline-none transition"
          />
          {!isOnline && <p className="text-sm text-center text-gray-500 dark:text-gray-400">You are offline. AI feedback will sync when you reconnect.</p>}
          <Button onClick={handleSave} disabled={isSaving || !selectedMood} className="w-full">
            {isSaving ? 'Thinking...' : (isOnline ? 'Save & Get Feedback' : 'Save Entry')}
          </Button>
        </div>
      )}
      <style>{`
        @keyframes fade-in {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
            animation: fade-in 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default MoodLogger;