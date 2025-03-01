import React from 'react';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ className }) => {
  return (
    <div className={cn('flex items-center justify-center', className)}>
      <div className="w-16 h-16 flex items-center justify-center overflow-hidden">
        <svg 
          width="64" 
          height="64" 
          viewBox="0 0 64 64" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <rect width="64" height="64" rx="12" fill="url(#paint0_linear)" />
          <path 
            d="M14 20.5C14 18.0147 16.0147 16 18.5 16H45.5C47.9853 16 50 18.0147 50 20.5V43.5C50 45.9853 47.9853 48 45.5 48H18.5C16.0147 48 14 45.9853 14 43.5V20.5Z" 
            fill="white" 
            fillOpacity="0.9" 
          />
          <path 
            d="M20.5 24C20.5 23.4477 20.9477 23 21.5 23H42.5C43.0523 23 43.5 23.4477 43.5 24V25C43.5 25.5523 43.0523 26 42.5 26H21.5C20.9477 26 20.5 25.5523 20.5 25V24Z" 
            fill="#6366F1" 
          />
          <path 
            d="M20.5 30C20.5 29.4477 20.9477 29 21.5 29H38.5C39.0523 29 39.5 29.4477 39.5 30V31C39.5 31.5523 39.0523 32 38.5 32H21.5C20.9477 32 20.5 31.5523 20.5 31V30Z" 
            fill="#6366F1" 
          />
          <path 
            d="M20.5 36C20.5 35.4477 20.9477 35 21.5 35H34.5C35.0523 35 35.5 35.4477 35.5 36V37C35.5 37.5523 35.0523 38 34.5 38H21.5C20.9477 38 20.5 37.5523 20.5 37V36Z" 
            fill="#6366F1" 
          />
          <path 
            d="M20.5 42C20.5 41.4477 20.9477 41 21.5 41H30.5C31.0523 41 31.5 41.4477 31.5 42V43C31.5 43.5523 31.0523 44 30.5 44H21.5C20.9477 44 20.5 43.5523 20.5 43V42Z" 
            fill="#6366F1" 
          />
          <defs>
            <linearGradient 
              id="paint0_linear" 
              x1="0" 
              y1="0" 
              x2="64" 
              y2="64" 
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#818CF8" />
              <stop offset="1" stopColor="#4F46E5" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="ml-2 text-xl font-bold text-primary">
        CBE<span className="text-sm align-super">#4</span>
      </div>
    </div>
  );
};

export default Logo;
