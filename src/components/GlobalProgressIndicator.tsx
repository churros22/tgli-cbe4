import React from 'react';
import { TrendingUp, CheckCircle, Clock, CircleDashed } from 'lucide-react';
import { cn } from '@/lib/utils';
interface GlobalProgressIndicatorProps {
  progress: number;
}
const GlobalProgressIndicator: React.FC<GlobalProgressIndicatorProps> = ({
  progress
}) => {
  // Calculate which icon to show based on progress
  const getProgressIcon = () => {
    if (progress >= 75) return <CheckCircle className="h-6 w-6 text-green-500" />;
    if (progress >= 50) return <TrendingUp className="h-6 w-6 text-blue-500" />;
    if (progress >= 25) return <Clock className="h-6 w-6 text-orange-500" />;
    return <CircleDashed className="h-6 w-6 text-primary" />;
  };
  return <div className="w-full bg-card rounded-lg p-4 border shadow-sm mb-6 overflow-hidden">
      <div className="flex flex-col md:flex-row justify-between items-center mb-3">
        <div className="flex items-center gap-2 mb-2 md:mb-0">
          <div className="p-1.5 rounded-full bg-primary/5">
            {getProgressIcon()}
          </div>
          <div>
            <h3 className="text-lg font-medium">Progression Globale</h3>
            <p className="text-muted-foreground text-xs">Vision d'ensemble du projet</p>
          </div>
        </div>
        <div className="text-2xl font-semibold">{progress}%</div>
      </div>
      
      {/* Progress bar */}
      <div className="relative h-3 bg-secondary rounded-full overflow-hidden">
        <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-400 to-green-400 rounded-full transition-all duration-700 ease-in-out" style={{
        width: `${progress}%`
      }} />
        
        {/* Progress markers */}
        
      </div>
      
      {/* Progress stages */}
      <div className="flex justify-between mt-1 text-xs text-muted-foreground">
        <span>Démarrage</span>
        <span>En cours</span>
        <span>Avancé</span>
        <span>Finalisé</span>
      </div>
    </div>;
};
export default GlobalProgressIndicator;