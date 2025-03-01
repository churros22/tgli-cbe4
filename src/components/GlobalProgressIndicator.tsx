import React, { useState, useEffect } from 'react';
import { TrendingUp, CheckCircle, Clock, CircleDashed } from 'lucide-react';
import { cn } from '@/lib/utils';
import config from '@/config';

interface GlobalProgressIndicatorProps {
  progress?: number;
}

const GlobalProgressIndicator: React.FC<GlobalProgressIndicatorProps> = ({
  progress: externalProgress
}) => {
  const [progress, setProgress] = useState(externalProgress || 0);
  const [loading, setLoading] = useState(externalProgress === undefined);

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
        setLoading(true);
        // Construct the Google Sheets API URL with your API key and spreadsheet ID
        const apiKey = config.googleSheets.apiKey;
        const sheetId = config.googleSheets.tasksSheet.spreadsheetId;
        const range = 'Tasks!A2:H100'; // Adjust based on your sheet structure
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${apiKey}`;

        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error('Failed to fetch tasks from Google Sheets');
        }
        
        const data = await response.json();
        
        // Process the data from Google Sheets
        if (data && data.values && data.values.length > 0) {
          // Calculate overall progress based on task progress values
          const totalTasks = data.values.length;
          let progressSum = 0;
          
          data.values.forEach((row: string[]) => {
            const taskProgress = parseInt(row[6] || '0', 10);
            progressSum += taskProgress;
          });
          
          const calculatedProgress = Math.round(progressSum / totalTasks);
          setProgress(calculatedProgress);
        } else {
          // Default progress if no data
          setProgress(0);
        }
      } catch (error) {
        console.error('Error calculating progress:', error);
        // Fallback to a default value
        setProgress(0);
      } finally {
        setLoading(false);
      }
    };

    calculateProgressFromTasks();
  }, [externalProgress]);

  // Calculate which icon to show based on progress
  const getProgressIcon = () => {
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
          {loading ? '...' : `${progress}%`}
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="relative h-3 bg-secondary rounded-full overflow-hidden">
        <div 
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-400 to-green-400 rounded-full transition-all duration-700 ease-in-out" 
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