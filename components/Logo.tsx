
import React from 'react';

const Logo = ({ className = "h-10 w-auto" }: { className?: string }) => (
  <div className="flex items-center space-x-2">
    <svg className={className} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#BB86FC' }} />
          <stop offset="100%" style={{ stopColor: '#6C63FF' }} />
        </linearGradient>
      </defs>
      <path
        fill="url(#logoGradient)"
        d="M50,5 C25.1,5,5,25.1,5,50s20.1,45,45,45s45-20.1,45-45S74.9,5,50,5z M50,85 C30.7,85,15,69.3,15,50 S30.7,15,50,15s35,15.7,35,35S69.3,85,50,85z"
      />
      <path
        fill="none"
        stroke="#FFD166"
        strokeWidth="4"
        strokeLinecap="round"
        d="M30,55 Q40,40,50,55 T70,55"
      />
    </svg>
    <span className="text-2xl font-bold text-primary dark:text-primary-dark">Hovix</span>
  </div>
);

export default Logo;