
import React from 'react';
import { Calendar, CheckCircle, CircleDashed, Clock, AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import config from '@/config';

interface DashboardStatsProps {
  onFilterClick: (status: string | null) => void;
  activeFilter: string | null;
}

interface StatData {
  totalTasks: number;
  completedTasks: number;
  remainingTasks: number;
  overdueTasks: number;
  nextDeadline: string;
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ onFilterClick, activeFilter }) => {
  // In a real application, this data would come from Google Sheets
  // calculateStats function will be replaced when the Google Sheets integration is added
  const calculateStats = (): StatData => {
    // This function will be updated to pull data from Google Sheets
    return {
      totalTasks: 12,
      completedTasks: 8,
      remainingTasks: 4,
      overdueTasks: 1,
      nextDeadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR'),
    };
  };

  const stats = calculateStats();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
      <Card 
        className={cn(
          "border shadow-sm transition-all duration-200 hover:shadow",
          activeFilter === 'all' && "ring-1 ring-primary"
        )}
        onClick={() => onFilterClick(activeFilter === 'all' ? null : 'all')}
      >
        <CardContent className="p-4 flex flex-col items-center cursor-pointer">
          <div className="inline-flex items-center justify-center rounded-full p-1.5 bg-primary/10 mb-2">
            <CircleDashed className={cn(
              "h-5 w-5 text-primary transition-all",
              activeFilter === 'all' && "animate-spin"
            )} />
          </div>
          <h3 className="text-2xl font-semibold">{stats.totalTasks}</h3>
          <p className="text-muted-foreground text-xs">{config.dashboard.statistics.totalTasks}</p>
        </CardContent>
      </Card>
      
      <Card 
        className={cn(
          "border shadow-sm transition-all duration-200 hover:shadow",
          activeFilter === 'completed' && "ring-1 ring-green-500"
        )}
        onClick={() => onFilterClick(activeFilter === 'completed' ? null : 'completed')}
      >
        <CardContent className="p-4 flex flex-col items-center cursor-pointer">
          <div className="inline-flex items-center justify-center rounded-full p-1.5 bg-green-500/10 mb-2">
            <CheckCircle className={cn(
              "h-5 w-5 text-green-500 transition-all",
              activeFilter === 'completed' && "animate-pulse"
            )} />
          </div>
          <h3 className="text-2xl font-semibold">{stats.completedTasks}</h3>
          <p className="text-muted-foreground text-xs">{config.dashboard.statistics.completedTasks}</p>
        </CardContent>
      </Card>
      
      <Card 
        className={cn(
          "border shadow-sm transition-all duration-200 hover:shadow",
          activeFilter === 'in_progress' && "ring-1 ring-blue-500"
        )}
        onClick={() => onFilterClick(activeFilter === 'in_progress' ? null : 'in_progress')}
      >
        <CardContent className="p-4 flex flex-col items-center cursor-pointer">
          <div className="inline-flex items-center justify-center rounded-full p-1.5 bg-blue-500/10 mb-2">
            <Clock className={cn(
              "h-5 w-5 text-blue-500 transition-all",
              activeFilter === 'in_progress' && "animate-pulse"
            )} />
          </div>
          <h3 className="text-2xl font-semibold">{stats.remainingTasks}</h3>
          <p className="text-muted-foreground text-xs">{config.dashboard.statistics.remainingTasks}</p>
        </CardContent>
      </Card>
      
      <Card 
        className={cn(
          "border shadow-sm transition-all duration-200 hover:shadow",
          activeFilter === 'pending' && "ring-1 ring-orange-500"
        )}
        onClick={() => onFilterClick(activeFilter === 'pending' ? null : 'pending')}
      >
        <CardContent className="p-4 flex flex-col items-center cursor-pointer">
          {stats.overdueTasks > 0 ? (
            <div className="inline-flex items-center justify-center rounded-full p-1.5 bg-red-500/10 mb-2">
              <AlertTriangle className={cn(
                "h-5 w-5 text-red-500 transition-all",
                activeFilter === 'pending' && "animate-pulse"
              )} />
            </div>
          ) : (
            <div className="inline-flex items-center justify-center rounded-full p-1.5 bg-orange-500/10 mb-2">
              <Calendar className={cn(
                "h-5 w-5 text-orange-500 transition-all",
                activeFilter === 'pending' && "animate-pulse"
              )} />
            </div>
          )}
          {stats.overdueTasks > 0 ? (
            <>
              <h3 className="text-2xl font-semibold">{stats.overdueTasks}</h3>
              <p className="text-muted-foreground text-xs">{config.dashboard.statistics.overdueTasks}</p>
            </>
          ) : (
            <>
              <h3 className="text-base font-semibold">{stats.nextDeadline}</h3>
              <p className="text-muted-foreground text-xs">{config.dashboard.statistics.nextDeadline}</p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardStats;
