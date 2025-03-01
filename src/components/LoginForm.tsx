
import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import Logo from '@/components/Logo';
import { Lock, Unlock, ArrowRight } from 'lucide-react';

const LoginForm: React.FC = () => {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Focus the input field when component mounts
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setIsError(false);

    // Simulate a slight delay for better UX
    setTimeout(() => {
      const success = login(password);
      
      if (!success) {
        setIsError(true);
        toast({
          variant: "destructive",
          title: "Authentication failed",
          description: "The password you entered is incorrect.",
        });
      }
      
      setIsLoading(false);
    }, 600);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="relative overflow-hidden p-8 rounded-2xl glassmorphism animate-scale-in backdrop-blur-xl bg-white/30 dark:bg-black/30 border border-white/20 shadow-xl">
        <div className="absolute -top-24 -right-24 w-40 h-40 bg-gradient-to-br from-primary/20 to-secondary/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-gradient-to-tr from-blue-500/20 to-purple-500/30 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 flex flex-col items-center space-y-8">
          <div className="animate-slide-in-down">
            <Logo className="mb-4 h-14 w-14 mx-auto" />
            <h2 className="text-2xl font-medium text-center bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              CBE#4-Process Validation
            </h2>
            <p className="text-muted-foreground text-center mt-2">
              Please enter the password to access the dashboard
            </p>
          </div>

          <form onSubmit={handleSubmit} className="w-full space-y-6 animate-fade-in" style={{ animationDelay: '200ms' }}>
            <div className="space-y-2">
              <div className="relative group">
                <Input
                  ref={inputRef}
                  type={isRevealed ? "text" : "password"}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`h-12 px-4 pr-12 rounded-xl backdrop-blur-sm transition-all duration-200 bg-white/50 dark:bg-black/50 border-white/30 dark:border-white/10 focus:ring-2 focus:ring-primary/50 ${
                    isError ? 'border-destructive ring-1 ring-destructive' : ''
                  }`}
                  disabled={isLoading}
                />
                <button 
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                  onClick={() => setIsRevealed(!isRevealed)}
                >
                  {isRevealed ? <Lock size={18} /> : <Unlock size={18} />}
                </button>
              </div>
              {isError && (
                <p className="text-sm text-destructive animate-fade-in">
                  Incorrect password. Please try again.
                </p>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 rounded-xl font-medium transition-all duration-300 hover:shadow-md group relative overflow-hidden"
              disabled={!password || isLoading}
            >
              <span className="relative z-10 flex items-center justify-center gap-2 group-hover:gap-3 transition-all">
                {isLoading ? 'Verifying...' : 'Access Dashboard'}
                <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
              </span>
              <span className="absolute inset-0 bg-gradient-to-r from-primary to-purple-600 opacity-90 group-hover:opacity-100 transition-opacity"></span>
            </Button>
          </form>
          
          <p className="text-xs text-muted-foreground text-center animate-fade-in" style={{ animationDelay: '400ms' }}>
            Password protected area for authorized personnel only
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
