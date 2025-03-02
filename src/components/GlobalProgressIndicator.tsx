
import React, { useState, useEffect } from 'react';
import { TrendingUp, CheckCircle, Clock, CircleDashed, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import config from '@/config';
import { useToast } from "@/hooks/use-toast";

interface GlobalProgressIndicatorProps {
  progress?: number;
}

const GlobalProgressIndicator: React.FC<GlobalProgressIndicatorProps> = ({
  progress: externalProgress
}) => {
  const [progress, setProgress] = useState(externalProgress || 0);
  const [loading, setLoading] = useState(externalProgress === undefined);
  const [lastFetchTime, setLastFetchTime] = useState<number | null>(null);
  const [error, setError] = useState<boolean>(false);
  const { toast } = useToast();

  useEffect(() => {
    // If progress is provided externally, use it
    if (externalProgress !== undefined) {
      setProgress(externalProgress);
      setLoading(false);
      return;
    }

    // Otherwise, calculate it from tasks in Google Sheets
    const calculateProgressFromTasks = async () => {
      try {
        // Check if we should throttle requests (no more than once per minute)
        const now = Date.now();
        if (lastFetchTime && now - lastFetchTime < 60000) {
          console.log('Limitation des requêtes API pour l\'indicateur de progression');
          return;
        }

        setLoading(true);
        setLastFetchTime(now);

        // Construct the Google Sheets API URL with your API key and spreadsheet ID
        const apiKey = config.googleSheets.apiKey;
        const sheetId = config.googleSheets.tasksSheet.spreadsheetId;
        const range = config.googleSheets.tasksSheet.range;
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${apiKey}`;

        const response = await fetch(url);
        
        if (!response.ok) {
          if (response.status === 429) {
            console.warn('Limite de requêtes atteinte lors de la récupération des tâches. Utilisation de la progression en cache.');
            // Don't change the progress, just stop loading
            setLoading(false);
            return;
          }
          throw new Error('Échec de la récupération des tâches depuis Google Sheets');
        }
        
        const data = await response.json();
        
        // Process the data from Google Sheets
        if (data && data.values && data.values.length > 0) {
          // Skip the header row (first row)
          const rows = data.values.slice(1);
          
          // Filter to only include leaf tasks (tasks that don't have subtasks)
          const allTasks = rows.map((row: string[]) => ({
            id: row[0] || '',
            status: row[3] || ''
          }));
          
          const leafTasks = allTasks.filter(task => 
            !allTasks.some(t => t.id !== task.id && t.id.startsWith(task.id + '.'))
          );
          
          // Calculate overall progress based on completed tasks
          const totalTasks = leafTasks.length;
          const completedTasks = leafTasks.filter(task => task.status === 'completed').length;
          const inProgressTasks = leafTasks.filter(task => task.status === 'in_progress').length;
          
          // Calculate a weighted progress: completed tasks count as 100%, in progress as 50%
          const progressValue = totalTasks > 0 
            ? ((completedTasks * 100) + (inProgressTasks * 50)) / totalTasks
            : 0;
          
          setProgress(Math.round(progressValue));
          setError(false);
        } else {
          // Default progress if no data
          setProgress(0);
          throw new Error('Pas de données de tâches disponibles');
        }
      } catch (error) {
        console.error('Erreur lors du calcul de la progression:', error);
        setError(true);
        // Fallback to a default value but don't show toast to avoid too many notifications
        if (!lastFetchTime) {
          toast({
            title: "Problème de chargement",
            description: "Impossible de charger les tâches. La progression peut être inexacte.",
            variant: "destructive"
          });
        }
      } finally {
        setLoading(false);
      }
    };

    calculateProgressFromTasks();
    
    // Set up interval to refresh the progress every 2 minutes
    const intervalId = setInterval(calculateProgressFromTasks, 120000);
    
    return () => clearInterval(intervalId);
  }, [externalProgress, lastFetchTime, toast]);

  // Calculate which icon to show based on progress
  const getProgressIcon = () => {
    if (error) return <AlertTriangle className="h-6 w-6 text-destructive" />;
    if (progress >= 75) return <CheckCircle className="h-6 w-6 text-green-500" />;
    if (progress >= 50) return <TrendingUp className="h-6 w-6 text-blue-500" />;
    if (progress >= 25) return <Clock className="h-6 w-6 text-orange-500" />;
    return <CircleDashed className="h-6 w-6 text-primary" />;
  };

  return (
    <div className="w-full bg-card rounded-lg p-4 border shadow-sm mb-6 overflow-hidden">
      <div className="flex flex-col md:flex-row justify-between items-center mb-3">
        <div className="flex items-center gap-2 mb-2 md:mb-0">
          <div className="p-1.5 rounded-full bg-primary/5">
            {getProgressIcon()}
          </div>
          <div>
            <h3 className="text-lg font-medium">{config.dashboard.overallProgress}</h3>
            <p className="text-muted-foreground text-xs">Vision d'ensemble du projet</p>
          </div>
        </div>
        <div className="text-2xl font-semibold">
          {loading ? '...' : (error ? 'Erreur' : `${progress}%`)}
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="relative h-3 bg-secondary rounded-full overflow-hidden">
        <div 
          className={cn(
            "absolute top-0 left-0 h-full rounded-full transition-all duration-700 ease-in-out",
            error 
              ? "bg-destructive/50 animate-pulse" 
              : "bg-gradient-to-r from-blue-400 to-green-400"
          )}
          style={{
            width: `${loading ? 0 : progress}%`,
            opacity: loading ? 0.5 : 1
          }} 
        />
      </div>
      
      {/* Progress stages */}
      <div className="flex justify-between mt-1 text-xs text-muted-foreground">
        <span>Démarrage</span>
        <span>En cours</span>
        <span>Avancé</span>
        <span>Finalisé</span>
      </div>
    </div>
  );
};

export default GlobalProgressIndicator;
