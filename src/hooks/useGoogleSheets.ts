
import { useState, useEffect, useCallback } from 'react';
import googleSheetsService from '@/utils/googleSheetsService';
import { useToast } from '@/hooks/use-toast';

interface UseGoogleSheetsProps {
  autoInit?: boolean;
}

interface SheetRow {
  [key: string]: any;
}

function useGoogleSheets({ autoInit = true }: UseGoogleSheetsProps = {}) {
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const { toast } = useToast();

  const initialize = useCallback(async () => {
    if (isInitialized) return true;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await googleSheetsService.initialize();
      setIsInitialized(result);
      setIsAuthenticated(googleSheetsService.isSignedIn());
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize Google Sheets';
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Google Sheets Initialization Failed",
        description: errorMessage,
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isInitialized, toast]);

  const signIn = async (): Promise<boolean> => {
    if (!isInitialized) {
      const initialized = await initialize();
      if (!initialized) return false;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await googleSheetsService.signIn();
      setIsAuthenticated(result);
      
      if (result) {
        toast({
          title: "Google Sign-In Successful",
          description: "You are now connected to Google Sheets",
        });
      }
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sign in with Google';
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Google Sign-In Failed",
        description: errorMessage,
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    setIsLoading(true);
    
    try {
      await googleSheetsService.signOut();
      setIsAuthenticated(false);
      toast({
        title: "Signed Out",
        description: "You have been signed out from Google",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sign out from Google';
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Sign Out Failed",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTasks = async (): Promise<SheetRow[]> => {
    if (!isInitialized) {
      const initialized = await initialize();
      if (!initialized) return [];
    }

    if (!isAuthenticated) {
      const signedIn = await signIn();
      if (!signedIn) return [];
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const tasks = await googleSheetsService.fetchTasks();
      return tasks;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch tasks from Google Sheets';
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Failed to Fetch Tasks",
        description: errorMessage,
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDocuments = async (): Promise<SheetRow[]> => {
    if (!isInitialized) {
      const initialized = await initialize();
      if (!initialized) return [];
    }

    if (!isAuthenticated) {
      const signedIn = await signIn();
      if (!signedIn) return [];
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const documents = await googleSheetsService.fetchDocuments();
      return documents;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch documents from Google Sheets';
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Failed to Fetch Documents",
        description: errorMessage,
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTableaux = async (): Promise<SheetRow[]> => {
    if (!isInitialized) {
      const initialized = await initialize();
      if (!initialized) return [];
    }

    if (!isAuthenticated) {
      const signedIn = await signIn();
      if (!signedIn) return [];
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const tableaux = await googleSheetsService.fetchTableaux();
      return tableaux;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch tableaux from Google Sheets';
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Failed to Fetch Tableaux",
        description: errorMessage,
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize on mount if autoInit is true
  useEffect(() => {
    if (autoInit) {
      initialize();
    }
  }, [autoInit, initialize]);

  return {
    isInitialized,
    isLoading,
    error,
    isAuthenticated,
    initialize,
    signIn,
    signOut,
    fetchTasks,
    fetchDocuments,
    fetchTableaux,
  };
}

export default useGoogleSheets;
