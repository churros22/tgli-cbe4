
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { differenceInDays, differenceInHours, differenceInMinutes, parseISO, isValid } from 'date-fns';
import { AlarmClock, AlertTriangle } from 'lucide-react';
import Navigation from '@/components/Navigation';
import TaskList from '@/components/TaskList';
import DashboardStats from '@/components/DashboardStats';
import GlobalProgressIndicator from '@/components/GlobalProgressIndicator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import config from '@/config';

const Dashboard: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [globalProgress, setGlobalProgress] = useState<number | undefined>(undefined);
  const [nearestDeadline, setNearestDeadline] = useState<{task: any, timeRemaining: string} | null>(null);
  const [priorityTasks, setPriorityTasks] = useState<any[]>([]);
  const [view, setView] = useState<'list' | 'kanban' | 'calendar'>('list');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    }
    
    // Set the document title with the app name from config
    document.title = config.appName;
    
    // Set favicon to logo.png
    const link = document.querySelector("link[rel='icon']") || document.createElement('link');
    link.setAttribute('rel', 'icon');
    link.setAttribute('href', '/logo.png');
    document.head.appendChild(link);
  }, [isAuthenticated, navigate]);

  // Add a callback to receive progress updates from the TaskList component
  const handleProgressUpdate = (progress: number) => {
    setGlobalProgress(progress);
  };

  // Add a callback to receive task data for deadline calculations
  const handleTasksLoaded = (tasks: any[]) => {
    // Find nearest deadline
    const now = new Date();
    let nearest = null;
    let nearestDate = null;
    let minDiff = Infinity;

    // Find priority tasks (due within 72 hours)
    const urgentTasks = [];

    // Only consider leaf tasks (not parent tasks/phases)
    const leafTasks = tasks.filter(task => !task.id.includes('.') || !tasks.some(t => t.id.startsWith(task.id + '.')));

    for (const task of leafTasks) {
      if (task.dueDate && !task.completed) {
        try {
          const dueDate = parseISO(task.dueDate);
          
          if (isValid(dueDate)) {
            const diffDays = differenceInDays(dueDate, now);
            const diffHours = differenceInHours(dueDate, now);
            
            // Check if this is the nearest deadline
            if (diffDays >= 0 && diffDays < minDiff) {
              minDiff = diffDays;
              nearest = task;
              nearestDate = dueDate;
            }
            
            // Check if this is a priority task (due within 72 hours)
            if (diffHours >= 0 && diffHours <= 72) {
              urgentTasks.push({
                ...task,
                timeRemaining: diffHours <= 24 
                  ? `${differenceInHours(dueDate, now)}h` 
                  : `${diffDays}d ${differenceInHours(dueDate, now) % 24}h`
              });
            }
          }
        } catch (e) {
          console.error("Error parsing date", e);
        }
      }
    }

    // Format the time remaining for the nearest deadline
    if (nearest && nearestDate) {
      const days = differenceInDays(nearestDate, now);
      const hours = differenceInHours(nearestDate, now) % 24;
      const minutes = differenceInMinutes(nearestDate, now) % 60;
      
      const timeRemaining = days > 0 
        ? `${days}d ${hours}h ${minutes}m` 
        : `${hours}h ${minutes}m`;
      
      setNearestDeadline({
        task: nearest,
        timeRemaining
      });
    } else {
      setNearestDeadline(null);
    }

    // Sort priority tasks by due date (closest first)
    urgentTasks.sort((a, b) => {
      const dateA = parseISO(a.dueDate);
      const dateB = parseISO(b.dueDate);
      return dateA.getTime() - dateB.getTime();
    });

    setPriorityTasks(urgentTasks);
  };

  const handleFilterClick = (status: string | null) => {
    setStatusFilter(prev => prev === status ? null : status);
  };

  const handleViewChange = (newView: 'list' | 'kanban' | 'calendar') => {
    setView(newView);
  };

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">{config.dashboard.title}</h1>
        <p className="text-muted-foreground mb-8">{config.dashboard.welcome}</p>
        
        <GlobalProgressIndicator progress={globalProgress} />
        
        {/* Countdown Timer */}
        {nearestDeadline && (
          <Card className="mb-8 border-l-4 border-l-orange-500 animate-pulse">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlarmClock className="h-10 w-10 text-orange-500" />
                  <div>
                    <h3 className="text-xl font-medium">Next Deadline</h3>
                    <p className="text-muted-foreground">{nearestDeadline.task.title}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-orange-500">{nearestDeadline.timeRemaining}</div>
                  <p className="text-sm text-muted-foreground">remaining</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Current Priorities Section */}
        {priorityTasks.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                Current Priorities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {priorityTasks.map(task => (
                  <div 
                    key={task.id} 
                    className="p-3 border rounded-lg flex items-center justify-between hover:bg-accent/50 transition-colors"
                  >
                    <div>
                      <h4 className="font-medium">{task.title}</h4>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        {task.assignee && <span>Assigned to: {task.assignee}</span>}
                        <Badge variant={
                          task.timeRemaining.includes('h') && !task.timeRemaining.includes('d') 
                            ? "destructive" 
                            : "outline"
                        }>
                          Due in {task.timeRemaining}
                        </Badge>
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      onClick={() => {
                        // This would ideally open the task editor
                        console.log("Edit task", task.id);
                      }}
                    >
                      View
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* View Selector for Tasks */}
        <div className="flex justify-end mb-4 space-x-2">
          <Button 
            variant={view === 'list' ? "default" : "outline"} 
            size="sm"
            onClick={() => handleViewChange('list')}
          >
            List
          </Button>
          <Button 
            variant={view === 'kanban' ? "default" : "outline"} 
            size="sm"
            onClick={() => handleViewChange('kanban')}
          >
            Kanban
          </Button>
          <Button 
            variant={view === 'calendar' ? "default" : "outline"} 
            size="sm"
            onClick={() => handleViewChange('calendar')}
          >
            Calendar
          </Button>
        </div>

        <DashboardStats 
          onFilterClick={handleFilterClick} 
          activeFilter={statusFilter} 
        />
        
        <div className="mt-8">
          <TaskList 
            filter={statusFilter}
            onProgressUpdate={handleProgressUpdate}
            onTasksLoaded={handleTasksLoaded}
            view={view}
          />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
