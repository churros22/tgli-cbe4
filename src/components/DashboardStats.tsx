
import React from 'react';
import { Calendar, CheckCircle, CircleDashed, Clock, AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import config from '@/config';

const DashboardStats: React.FC = () => {
  // In a real application, this data would come from a real data source
  // For now we're using mock data
  const stats = {
    totalTasks: 12,
    completedTasks: 8,
    remainingTasks: 4,
    overdueTasks: 1,
    nextDeadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR'),
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="border shadow-sm">
        <CardContent className="p-6 flex flex-col items-center">
          <div className="inline-flex items-center justify-center rounded-full p-2 bg-primary/10 mb-4">
            <CircleDashed className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-3xl font-semibold">{stats.totalTasks}</h3>
          <p className="text-muted-foreground text-sm">{config.dashboard.statistics.totalTasks}</p>
        </CardContent>
      </Card>
      
      <Card className="border shadow-sm">
        <CardContent className="p-6 flex flex-col items-center">
          <div className="inline-flex items-center justify-center rounded-full p-2 bg-green-500/10 mb-4">
            <CheckCircle className="h-6 w-6 text-green-500" />
          </div>
          <h3 className="text-3xl font-semibold">{stats.completedTasks}</h3>
          <p className="text-muted-foreground text-sm">{config.dashboard.statistics.completedTasks}</p>
        </CardContent>
      </Card>
      
      <Card className="border shadow-sm">
        <CardContent className="p-6 flex flex-col items-center">
          <div className="inline-flex items-center justify-center rounded-full p-2 bg-blue-500/10 mb-4">
            <Clock className="h-6 w-6 text-blue-500" />
          </div>
          <h3 className="text-3xl font-semibold">{stats.remainingTasks}</h3>
          <p className="text-muted-foreground text-sm">{config.dashboard.statistics.remainingTasks}</p>
        </CardContent>
      </Card>
      
      <Card className="border shadow-sm">
        <CardContent className="p-6 flex flex-col items-center">
          {stats.overdueTasks > 0 ? (
            <div className="inline-flex items-center justify-center rounded-full p-2 bg-red-500/10 mb-4">
              <AlertTriangle className="h-6 w-6 text-red-500" />
            </div>
          ) : (
            <div className="inline-flex items-center justify-center rounded-full p-2 bg-orange-500/10 mb-4">
              <Calendar className="h-6 w-6 text-orange-500" />
            </div>
          )}
          {stats.overdueTasks > 0 ? (
            <>
              <h3 className="text-3xl font-semibold">{stats.overdueTasks}</h3>
              <p className="text-muted-foreground text-sm">{config.dashboard.statistics.overdueTasks}</p>
            </>
          ) : (
            <>
              <h3 className="text-lg font-semibold">{stats.nextDeadline}</h3>
              <p className="text-muted-foreground text-sm">{config.dashboard.statistics.nextDeadline}</p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardStats;
