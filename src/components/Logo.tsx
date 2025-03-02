
import React from 'react';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ className }) => {
  return (
    <div className={cn('flex items-center justify-center', className)}>
      <div className="w-16 h-16 flex items-center justify-center overflow-hidden">
        <img src="/logo.png" alt="Application Logo" className="w-full h-full object-contain" />
      </div>
      <div className="ml-2 text-xl font-bold text-primary">
        CBE<span className="text-sm align-super">#4</span>
      </div>
    </div>
  );
};

export default Logo;
