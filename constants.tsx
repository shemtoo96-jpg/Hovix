import React from 'react';
import type { Mood, Achievement, CommunityChallenge } from './types';

export const MOODS: Mood[] = [
  { name: 'Happy', emoji: '😊', color: '#FFD166', value: 5 },
  { name: 'Excited', emoji: '🤩', color: '#FF9F43', value: 5 },
  { name: 'Calm', emoji: '😌', color: '#06D6A0', value: 4 },
  { name: 'Sad', emoji: '😢', color: '#118AB2', value: 2 },
  { name: 'Angry', emoji: '😠', color: '#FF6B6B', value: 1 },
  { name: 'Anxious', emoji: '😟', color: '#A06CD5', value: 2 },
];

// FIX: Updated icon components to accept and spread all SVG props.
const MedalIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 15-2.939 1.545.561-3.272-2.376-2.318 3.285-.478L12 9.25l1.47 2.972 3.285.478-2.376 2.318.561 3.272L12 17zm0-11a3 3 0 1 1 0 6 3 3 0 0 1 0-6z"/></svg>
);

// FIX: Updated icon components to accept and spread all SVG props.
const DiamondIcon = (props: React.SVGProps<SVGSVGElement>) => (
 <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .5l4.243 4.243L21.5 12l-5.257 7.257L12 23.5l-4.243-4.243L2.5 12l5.257-7.257L12 .5zm0 3.328L9.828 6.172 6.172 9.828l-2.829 2.172 2.829 2.172 3.656 3.656L12 20.172l2.172-2.172 3.656-3.656 2.829-2.172-2.829-2.172-3.656-3.656L12 3.828z"/></svg>
);

// FIX: Updated icon components to accept and spread all SVG props.
const MoonIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 1 0 10 10A10.011 10.011 0 0 0 12 2zM12 20a8 8 0 0 1-8-8c0-3.309 2.925-6.075 5-7.182A7.994 7.994 0 0 1 12 4a8 8 0 0 1 8 8 8 8 0 0 1-8 8z"/></svg>
);


export const ACHIEVEMENTS: Achievement[] = [
  { name: 'Calm Mind', description: '7 consecutive days', icon: MedalIcon, streak: 7 },
  { name: 'Mood Master', description: '30 consecutive days', icon: DiamondIcon, streak: 30 },
  { name: 'Reflective Soul', description: '60 consecutive days', icon: MoonIcon, streak: 60 },
];


// SVG Icons for Music Services
export const SpotifyIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm4.111 13.111c-.138.238-.424.318-.662.181-2.137-1.229-4.822-1.503-8.012-.822-.279.056-.525-.119-.582-.397s.119-.525.397-.582c3.468-.727 6.438-.421 8.802 1.025.238.137.318.424.181.662zm.613-2.484c-.164.282-.504.382-.786.22-2.384-1.373-6.002-1.768-9.336-.963-.322.08-.638-.109-.718-.43s.109-.638.43-.718c3.682-.87 7.625-.421 10.323 1.121.282.163.382.504.22.786zm.13-2.673c-2.83-1.631-7.484-1.785-10.432-0.982-.375.101-.76-.098-.861-.473s.098-.76.473-.861c3.296-.882 8.356-.708 11.554 1.116.341.196.45.65.254 1.002s-.65.45-1.002.254z"></path></svg>
);

export const YouTubeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} viewBox="0 0 24 24" fill="currentColor"><path d="M21.582 7.243c-.244-.914-.984-1.654-1.898-1.898C18.226 5 12 5 12 5s-6.226 0-7.684.345c-.914.244-1.654.984-1.898 1.898C2 8.701 2 12 2 12s0 3.299.318 4.757c.244.914.984 1.654 1.898 1.898C5.774 19 12 19 12 19s6.226 0 7.684-.345c.914-.244-1.654.984-1.898-1.898C22 15.299 22 12 22 12s0-3.299-.418-4.757zM9.75 15.155V8.845l5.518 3.155-5.518 3.155z"></path></svg>
);

export const BoomplayIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm-1.07 14.545l-4-2.5a1 1 0 010-1.732l4-2.5a1 1 0 011.57.866v5a1 1 0 01-1.57.866zM15 12.5a1 1 0 01-1 1h-2a1 1 0 010-2h2a1 1 0 011 1zm3.07-1.545a1 1 0 01-1.57-.866v-5a1 1 0 011.57-.866l4 2.5a1 1 0 010 1.732l-4 2.5z"></path></svg>
);

export const MUSIC_SERVICES = [
  { name: 'Spotify', icon: SpotifyIcon, color: '#1DB954', searchUrl: 'https://open.spotify.com/search/' },
  { name: 'YouTube Music', icon: YouTubeIcon, color: '#FF0000', searchUrl: 'https://music.youtube.com/search?q=' },
  { name: 'Boomplay', icon: BoomplayIcon, color: '#FF7A00', searchUrl: 'https://www.boomplay.com/search/playlist/' },
];

export const COMMUNITY_CHALLENGES: CommunityChallenge[] = [
    { name: '7 Days of Gratitude', description: 'Log one thing you\'re grateful for each day.', emoji: '🙏' },
    { name: 'Positivity Challenge', description: 'Focus on logging only positive moods for a week.', emoji: '✨' },
    { name: 'Mindful Moments', description: 'Use a tool from the Emotional Toolkit daily.', emoji: '🧘' },
];

// SVG Icons for Movie Services
export const NetflixIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="currentColor"><path d="M8.45 6.47L14.33 20h1.5l-5.88-13.53V6.47H8.45zm-2.12 0L12.21 20h1.5L7.83 6.47H6.33z"/></svg>
);
export const PrimeVideoIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.32 14.86c-1.89.76-3.79.76-5.68 0-1.89-.76-2.84-2.28-2.84-4.57s.95-3.81 2.84-4.57c1.89-.76 3.79-.76 5.68 0 1.89.76 2.84 2.28 2.84 4.57s-.95 3.81-2.84 4.57z"/></svg>
);
export const HuluIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="currentColor"><path d="M8 3v18h2V14.5h4V18h2V3h-2v5.5H10V3H8z"/></svg>
);
export const MovieBoxIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-8 12.5v-9l6 4.5-6 4.5z"/></svg>
);

export const MOVIE_SERVICES = [
    { name: 'Netflix', icon: NetflixIcon, color: '#E50914', searchUrl: 'https://www.netflix.com/search?q=' },
    { name: 'Prime Video', icon: PrimeVideoIcon, color: '#00A8E1', searchUrl: 'https://www.primevideo.com/search/ref=atv_nb_sr?phrase=' },
    { name: 'Hulu', icon: HuluIcon, color: '#1CE783', searchUrl: 'https://www.hulu.com/search?q=' },
    { name: 'MovieBox', icon: MovieBoxIcon, color: '#007BFF', searchUrl: 'https://www.moviebox.com/search?q=' },
];
