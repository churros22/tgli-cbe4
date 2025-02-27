
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Navigation from '@/components/Navigation';
import ProgressChart from '@/components/ProgressChart';
import TaskList from '@/components/TaskList';
import DashboardStats from '@/components/DashboardStats';
import config from '@/config';

const Dashboard: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 pt-24 pb-16">
        <div className="max-w-5xl mx-auto">
          {/* Page Header */}
          <div className="mb-8 animate-fade-in">
            <h1 className="text-3xl font-medium">{config.appName}</h1>
            <p className="text-muted-foreground mt-2">
              {config.dashboard.welcome}
            </p>
          </div>
          
          {/* Dashboard Statistics */}
          <section className="mb-8 animate-slide-in-up" style={{ animationDelay: '50ms' }}>
            <DashboardStats />
          </section>
          
          {/* Progress Section */}
          <section className="mb-12 animate-slide-in-up" style={{ animationDelay: '100ms' }}>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-2">
              <h2 className="text-2xl font-medium">{config.dashboard.progressSection}</h2>
              <div className="text-sm px-3 py-1 rounded-full bg-secondary text-muted-foreground">
                {config.dashboard.overallProgress}: 95%
              </div>
            </div>
            
            <div className="bg-card rounded-xl p-4 shadow-sm border">
              <ProgressChart />
            </div>
          </section>
          
          {/* Tasks Section */}
          <section className="animate-slide-in-up" style={{ animationDelay: '200ms' }}>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-2">
              <h2 className="text-2xl font-medium">{config.dashboard.tasksSection}</h2>
              <div className="text-sm px-3 py-1 rounded-full bg-secondary text-muted-foreground">
                {config.dashboard.tasksRemaining}: 4
              </div>
            </div>
            
            <div className="bg-card rounded-xl p-4 shadow-sm border">
              <TaskList />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
