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

  useEffect(() => {
    const fetchTasksFromGoogleSheets = async () => {
      try {
        setLoading(true);
        // Construct the Google Sheets API URL with your API key and spreadsheet ID
        const apiKey = config.googleSheets.apiKey;
        const sheetId = config.googleSheets.sheets.tasks;
        const range = 'A2:H100'; // Adjust based on your sheet structure
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${apiKey}`;

        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error('Failed to fetch data from Google Sheets');
        }
        
        const data = await response.json();
        
        // Process the data from Google Sheets
        if (data && data.values && data.values.length > 0) {
          const tasks: Task[] = data.values.map((row: string[]) => ({
            id: row[0] || '',
            title: row[1] || '',
            status: row[2] || '',
            dueDate: row[3] || '',
          }));
          
          // Calculate stats from tasks
          const calculatedStats = calculateStats(tasks);
          setStats(calculatedStats);
        }
      } catch (error) {
        console.error('Error fetching data from Google Sheets:', error);
        // Fallback to mock data if there's an error
        setStats({
          totalTasks: 12,
          completedTasks: 8,
          remainingTasks: 4,
          overdueTasks: 1,
          nextDeadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR'),
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTasksFromGoogleSheets();
  }, []);

  const calculateStats = (tasks: Task[]): StatData => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const completedTasks = tasks.filter(task => task.status === 'completed').length;
    const totalTasks = tasks.length;
    const remainingTasks = totalTasks - completedTasks;
    
    // Calculate overdue tasks
    const overdueTasks = tasks.filter(task => {
      if (task.status === 'completed') return false;
      
      const dueDate = new Date(task.dueDate);
      return dueDate < today;
    }).length;
    
    // Find next deadline
    let nextDeadline = '';
    const futureTasks = tasks
      .filter(task => task.status !== 'completed' && task.dueDate)
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    
    if (futureTasks.length > 0) {
      const nextDueDate = new Date(futureTasks[0].dueDate);
      nextDeadline = nextDueDate.toLocaleDateString('fr-FR');
    }
    
    return {
      totalTasks,
      completedTasks,
      remainingTasks,
      overdueTasks,
      nextDeadline,
    };
  };

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
