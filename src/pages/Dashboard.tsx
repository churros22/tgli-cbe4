
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
  const [globalProgress, setGlobalProgress] = useState(95);

  // Function to calculate global progress (will be replaced with Google Sheets data)
  const calculateGlobalProgress = () => {
    // This will be updated when Google Sheets integration is added
    // For now, we'll simulate the calculation
    return 95;
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    }
    
    // Calculate global progress on load
    setGlobalProgress(calculateGlobalProgress());
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 pt-16 pb-16">
        <div className="max-w-5xl mx-auto">
          {/* Page Header */}
          <div className="mb-5 pt-4">
            <h1 className="text-2xl font-medium">{config.appName}</h1>
            <p className="text-muted-foreground text-sm mt-1">
              {config.dashboard.welcome}
            </p>
          </div>
          
          {/* Global Progress Indicator */}
          <section className="mb-6">
            <GlobalProgressIndicator progress={globalProgress} />
          </section>
          
          {/* Dashboard Statistics */}
          <section className="mb-6">
            <DashboardStats onFilterClick={setStatusFilter} activeFilter={statusFilter} />
          </section>
          
          {/* Tasks Section */}
          <section>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-3 gap-2">
              <h2 className="text-xl font-medium">{config.dashboard.tasksSection}</h2>
              <div className="text-xs px-2 py-1 rounded-full bg-secondary text-muted-foreground">
                {statusFilter ? (
                  <button onClick={() => setStatusFilter(null)} className="flex items-center gap-1">
                    <span>Filtre actif: {statusFilter}</span>
                    <span className="text-xs ml-1">&times;</span>
                  </button>
                ) : (
                  `${config.dashboard.tasksRemaining}: 4`
                )}
              </div>
            </div>
            
            <div className="bg-card rounded-xl p-4 shadow-sm border">
              <TaskList statusFilter={statusFilter} />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
