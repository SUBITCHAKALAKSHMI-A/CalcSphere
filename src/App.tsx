import { useState, useEffect } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Index from './pages/Index';
import Login from './pages/Login';
import NotFound from './pages/NotFound';

const queryClient = new QueryClient();

interface UserData {
  name: string;
  email: string;
  isAuthenticated: boolean;
}

const App = () => {
  const [user, setUser] = useState<UserData>(() => {
    // Check if user data exists in localStorage
    const savedUser = localStorage.getItem('calculator_user');
    return savedUser 
      ? JSON.parse(savedUser) 
      : { name: '', email: '', isAuthenticated: false };
  });

  // Save user to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('calculator_user', JSON.stringify(user));
  }, [user]);

  const handleLogin = (userData: { name: string; email: string }) => {
    setUser({
      ...userData,
      isAuthenticated: true
    });
  };

  const handleLogout = () => {
    setUser({ name: '', email: '', isAuthenticated: false });
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter>
          <Routes>
            <Route 
              path="/" 
              element={
                user.isAuthenticated ? (
                  <Index user={user} onLogout={handleLogout} />
                ) : (
                  <Navigate to="/login" replace />
                )
              } 
            />
            <Route 
              path="/login" 
              element={
                user.isAuthenticated ? (
                  <Navigate to="/" replace />
                ) : (
                  <Login onLogin={handleLogin} />
                )
              } 
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;