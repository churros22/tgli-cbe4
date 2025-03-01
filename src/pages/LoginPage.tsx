
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import LoginForm from '@/components/LoginForm';

const LoginPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-secondary/20 via-background to-background overflow-hidden relative">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-10 left-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 left-1/4 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl"></div>
        
        {/* Decorative floating orbs */}
        <div className="absolute top-1/4 left-1/4 w-6 h-6 bg-blue-400/30 rounded-full animate-pulse-soft"></div>
        <div className="absolute top-1/3 right-1/4 w-8 h-8 bg-purple-400/30 rounded-full animate-pulse-soft" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-1/4 left-1/3 w-4 h-4 bg-pink-400/30 rounded-full animate-pulse-soft" style={{ animationDelay: '2s' }}></div>
      </div>
      
      {/* Login form container */}
      <div className="w-full max-w-md z-10">
        <LoginForm />
      </div>
    </div>
  );
};

export default LoginPage;
