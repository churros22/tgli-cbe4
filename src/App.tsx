
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { useEffect } from "react";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import Diagrammes from "./pages/Diagrammes";
import Documents from "./pages/Documents";
import Tableaux from "./pages/Tableaux";
import NotFound from "./pages/NotFound";
import config from "./config";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchInterval: 30000, // Refetch data every 30 seconds for real-time updates
      staleTime: 10000,       // Consider data stale after 10 seconds
    },
  },
});

// Get the base URL from the import.meta.env
const baseUrl = import.meta.env.BASE_URL || '/';

// Set up favicon and document title
const AppSetup = () => {
  useEffect(() => {
    // Set the default document title
    document.title = config.appName;
    
    // Set favicon
    const link = document.querySelector("link[rel='icon']") || document.createElement('link');
    link.setAttribute('rel', 'icon');
    link.setAttribute('href', '/logo.png');
    document.head.appendChild(link);
  }, []);
  
  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ThemeProvider>
        <TooltipProvider>
          <AppSetup />
          <Toaster />
          <Sonner />
          <BrowserRouter basename={baseUrl}>
            <Routes>
              <Route path="/" element={<LoginPage />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/diagrammes" element={<Diagrammes />} />
              <Route path="/documents" element={<Documents />} />
              <Route path="/tableaux" element={<Tableaux />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
