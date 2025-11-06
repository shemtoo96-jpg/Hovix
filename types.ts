import type { ReactElement, SVGProps } from 'react';

export interface Mood {
  name: string;
  emoji: string;
  color: string;
  value: number; // For charting
}

export interface MoodEntry {
  id: string;
  mood: Mood;
  journal: string;
  tags: string[];
  date: string; // ISO string
  aiFeedback?: string;
  needsAiFeedback?: boolean; // For offline sync
}

export interface Achievement {
  name: string;
  description: string;
  // FIX: Updated icon props to accept all SVG props, including `style`.
  icon: (props: SVGProps<SVGSVGElement>) => ReactElement;
  streak: number;
}

export interface ReminderSettings {
  daily: {
    isEnabled: boolean;
    time: string;
    message: string;
  };
  morningBoost: {
    isEnabled: boolean;
    time: string;
  };
  eveningReflection: {
    isEnabled: boolean;
    time: string;
  };
  intelligentCheckIn: {
    isEnabled: boolean;
  };
}


export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export interface CommunityChallenge {
  name: string;
  description: string;
  emoji: string;
}

export interface User {
  name: string;
  email: string;
  photo?: string;
}