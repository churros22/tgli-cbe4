
import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import Logo from '@/components/Logo';

const LoginForm: React.FC = () => {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
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
    <div className="w-full max-w-md mx-auto p-8 rounded-2xl glassmorphism animate-scale-in">
      <div className="flex flex-col items-center space-y-8">
        <div className="animate-slide-in-down">
          <Logo className="mb-4" />
          <h2 className="text-2xl font-medium text-center">CBE#4-Process Validation</h2>
          <p className="text-muted-foreground text-center mt-2">
            Please enter the password to access the dashboard
          </p>
        </div>

        <form onSubmit={handleSubmit} className="w-full space-y-6 animate-fade-in" style={{ animationDelay: '200ms' }}>
          <div className="space-y-2">
            <div className="relative">
              <Input
                ref={inputRef}
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`h-12 px-4 rounded-xl transition-all duration-200 ${
                  isError ? 'border-destructive ring-1 ring-destructive' : ''
                }`}
                disabled={isLoading}
              />
            </div>
            {isError && (
              <p className="text-sm text-destructive animate-fade-in">
                Incorrect password. Please try again.
              </p>
            )}
          </div>

          <Button 
            type="submit" 
            className="w-full h-12 rounded-xl font-medium transition-all duration-300 hover:shadow-md"
            disabled={!password || isLoading}
          >
            {isLoading ? 'Verifying...' : 'Access Dashboard'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
