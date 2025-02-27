
import React from 'react';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ className }) => {
  return (
    <div className={cn('flex items-center justify-center', className)}>
      {/* Placeholder for the logo - replace with your actual logo later */}
      <div className="w-16 h-16 bg-gradient-to-br from-secondary to-accent rounded-xl flex items-center justify-center overflow-hidden shadow-sm">
        <span className="text-2xl font-bold text-primary">CBE</span>
      </div>
    </div>
  );
};

export default Logo;
