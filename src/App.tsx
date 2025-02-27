
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from '@/context/AuthContext';
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import Diagrammes from "./pages/Diagrammes";
import Documents from "./pages/Documents";
import Tableaux from "./pages/Tableaux";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter basename={process.env.NODE_ENV === "production" ? "/tgli-cbe4" : "/"}>
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
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
