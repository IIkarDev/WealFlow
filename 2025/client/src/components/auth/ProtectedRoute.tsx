import React, { useEffect } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {Loader2} from 'lucide-react'; // Using a consistent loader

const ProtectedRoute: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/auth', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <Loader2 className="animate-spin h-12 w-12 text-primary-500" />
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : null; 
  // Return null if not authenticated and not loading to prevent brief flashes of content or layout shifts.
  // The navigate call handles redirection.
};

export default ProtectedRoute;
