
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Navigation from '@/components/Navigation';
import TaskList from '@/components/TaskList';
import DashboardStats from '@/components/DashboardStats';
import GlobalProgressIndicator from '@/components/GlobalProgressIndicator';
import config from '@/config';

const Dashboard: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [globalProgress, setGlobalProgress] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    }
    
    // Set the document title with the app name from config
    document.title = config.appName;
  }, [isAuthenticated, navigate]);

  // Add a callback to receive progress updates from the TaskList component
  const handleProgressUpdate = (progress: number) => {
    setGlobalProgress(progress);
  };

  const handleFilterClick = (status: string | null) => {
    setStatusFilter(prev => prev === status ? null : status);
  };

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">{config.dashboard.title}</h1>
        <p className="text-muted-foreground mb-8">{config.dashboard.welcome}</p>
        
        <GlobalProgressIndicator progress={globalProgress} />
        
        <DashboardStats 
          onFilterClick={handleFilterClick} 
          activeFilter={statusFilter} 
        />
        
        <div className="mt-8">
          <TaskList 
            filter={statusFilter}
            onProgressUpdate={handleProgressUpdate}
          />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
