
import React from 'react';
import { TrendingUp, CheckCircle, Clock, CircleDashed } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GlobalProgressIndicatorProps {
  progress: number;
}

const GlobalProgressIndicator: React.FC<GlobalProgressIndicatorProps> = ({ progress }) => {
  // Calculate which icon to show based on progress
  const getProgressIcon = () => {
    if (progress >= 75) return <CheckCircle className="h-8 w-8 text-green-500 animate-pulse" />;
    if (progress >= 50) return <TrendingUp className="h-8 w-8 text-blue-500" />;
    if (progress >= 25) return <Clock className="h-8 w-8 text-orange-500" />;
    return <CircleDashed className="h-8 w-8 text-primary" />;
  };

  return (
    <div className="w-full bg-card rounded-xl p-5 border shadow-sm mb-8 overflow-hidden">
      <div className="flex flex-col md:flex-row justify-between items-center mb-4">
        <div className="flex items-center gap-3 mb-3 md:mb-0">
          <div className="p-2 rounded-full bg-primary/10 animate-scale-in">
            {getProgressIcon()}
          </div>
          <div>
            <h3 className="text-xl font-medium">Progression Globale</h3>
            <p className="text-muted-foreground text-sm">Vision d'ensemble du projet</p>
          </div>
        </div>
        <div className="text-3xl font-semibold animate-fade-in">{progress}%</div>
      </div>
      
      {/* Progress bar */}
      <div className="relative h-4 bg-secondary rounded-full overflow-hidden">
        <div 
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-400 to-green-400 rounded-full transition-all duration-1000 ease-in-out animate-pulse"
          style={{ width: `${progress}%` }}
        />
        
        {/* Progress markers */}
        <div className="absolute top-0 left-0 w-full h-full flex justify-between px-1">
          {[25, 50, 75].map((marker) => (
            <div 
              key={marker}
              className={cn(
                "h-full w-0.5 bg-background/50",
                progress >= marker && "bg-background/80"
              )}
              style={{ left: `${marker}%` }}
            />
          ))}
        </div>
      </div>
      
      {/* Progress stages */}
      <div className="flex justify-between mt-2 text-xs text-muted-foreground">
        <span>Démarrage</span>
        <span>En cours</span>
        <span>Avancé</span>
        <span>Finalisé</span>
      </div>
    </div>
  );
};

export default GlobalProgressIndicator;
