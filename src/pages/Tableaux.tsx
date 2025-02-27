
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Navigation from '@/components/Navigation';
import TableauxList from '@/components/TableauxList';

const Tableaux: React.FC = () => {
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
            <h1 className="text-3xl font-medium">Tableaux</h1>
            <p className="text-muted-foreground mt-2">
              Access all project spreadsheets and tables
            </p>
          </div>
          
          {/* Tableaux Section */}
          <section className="animate-slide-in-up" style={{ animationDelay: '100ms' }}>
            <TableauxList />
          </section>
        </div>
      </main>
    </div>
  );
};

export default Tableaux;
