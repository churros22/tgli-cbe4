
import React, { useState, useEffect } from 'react';
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

interface Task {
  id: string;
  title: string;
  status: string;
  dueDate: string;
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ onFilterClick, activeFilter }) => {
  const [stats, setStats] = useState<StatData>({
    totalTasks: 0,
    completedTasks: 0,
    remainingTasks: 0,
    overdueTasks: 0,
    nextDeadline: '',
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [retryCount, setRetryCount] = useState<number>(0);

  useEffect(() => {
    const fetchTasksFromGoogleSheets = async () => {
      try {
        setLoading(true);
        // Construct the Google Sheets API URL with your API key and spreadsheet ID
        const apiKey = config.googleSheets.apiKey;
        const sheetId = config.googleSheets.tasksSheet.spreadsheetId;
        const range = config.googleSheets.tasksSheet.range;
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${apiKey}`;

        const response = await fetch(url);
        
        if (!response.ok) {
          if (response.status === 429 && retryCount < 3) {
            // If rate limited, try again with exponential backoff
            console.warn('Limite de requêtes atteinte. Nouvelle tentative dans quelques instants...');
            setRetryCount(prev => prev + 1);
            setTimeout(() => {
              fetchTasksFromGoogleSheets();
            }, Math.pow(2, retryCount) * 1000);
            return;
          }
          throw new Error('Échec de récupération des données depuis Google Sheets');
        }
        
        const data = await response.json();
        
        // Process the data from Google Sheets
        if (data && data.values && data.values.length > 0) {
          // Reset retry count on success
          setRetryCount(0);
          
          // Skip the header row (first row)
          const rows = data.values.slice(1);
          
          const allTasks: Task[] = rows.map((row: string[]) => ({
            id: row[0] || '',
            title: row[1] || '',
            status: row[3] || '',
            dueDate: row[4] || '',
          }));
          
          // Filter to only include leaf tasks (tasks that don't have subtasks)
          const leafTasks = allTasks.filter(task => 
            // A leaf task has no child tasks
            !allTasks.some(t => t.id !== task.id && t.id.startsWith(task.id + '.'))
          );
          
          // Calculate statistics based on leaf tasks only
          const totalTasks = leafTasks.length;
          const completedTasks = leafTasks.filter(task => task.status === 'completed').length;
          const remainingTasks = totalTasks - completedTasks;
          
          // Calculate overdue tasks
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          const overdueTasks = leafTasks.filter(task => {
            if (task.status === 'completed') return false;
            if (!task.dueDate) return false;
            
            try {
              const dueDate = new Date(task.dueDate);
              return !isNaN(dueDate.getTime()) && dueDate < today;
            } catch (e) {
              return false;
            }
          }).length;
          
          // Find next deadline
          const incompleteTasks = leafTasks.filter(task => 
            task.status !== 'completed' && 
            task.dueDate && 
            !isNaN(new Date(task.dueDate).getTime())
          );
          
          let nextDeadline = '';
          
          if (incompleteTasks.length > 0) {
            incompleteTasks.sort((a, b) => {
              const dateA = new Date(a.dueDate);
              const dateB = new Date(b.dueDate);
              return dateA.getTime() - dateB.getTime();
            });
            
            try {
              const nextDueDate = new Date(incompleteTasks[0].dueDate);
              if (!isNaN(nextDueDate.getTime())) {
                nextDeadline = nextDueDate.toLocaleDateString('fr-FR');
              } else {
                nextDeadline = 'Aucune';
              }
            } catch (e) {
              nextDeadline = 'Aucune';
            }
          } else {
            nextDeadline = 'Aucune';
          }
          
          setStats({
            totalTasks,
            completedTasks,
            remainingTasks,
            overdueTasks,
            nextDeadline,
          });
        } else {
          // If no data is returned, set default values
          setStats({
            totalTasks: 0,
            completedTasks: 0,
            remainingTasks: 0,
            overdueTasks: 0,
            nextDeadline: 'Aucune',
          });
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des données depuis Google Sheets:', error);
        // Fallback to mock data in case of error
        setStats({
          totalTasks: 0,
          completedTasks: 0,
          remainingTasks: 0,
          overdueTasks: 0,
          nextDeadline: 'Aucune',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTasksFromGoogleSheets();
    
    // Set up polling for real-time updates
    const interval = setInterval(fetchTasksFromGoogleSheets, 60000); // Refresh every minute
    
    return () => clearInterval(interval);
  }, [retryCount]);

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
              activeFilter === 'all' && "animate-pulse"
            )} />
          </div>
          <h3 className="text-2xl font-semibold">{loading ? '...' : stats.totalTasks}</h3>
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
          <h3 className="text-2xl font-semibold">{loading ? '...' : stats.completedTasks}</h3>
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
          <h3 className="text-2xl font-semibold">{loading ? '...' : stats.remainingTasks}</h3>
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
              <h3 className="text-2xl font-semibold">{loading ? '...' : stats.overdueTasks}</h3>
              <p className="text-muted-foreground text-xs">{config.dashboard.statistics.overdueTasks}</p>
            </>
          ) : (
            <>
              <h3 className="text-base font-semibold">{loading ? '...' : stats.nextDeadline}</h3>
              <p className="text-muted-foreground text-xs">{config.dashboard.statistics.nextDeadline}</p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardStats;
