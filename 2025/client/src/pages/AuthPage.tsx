import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import LoginForm from '../components/auth/LoginForm';
import RegisterForm from '../components/auth/RegisterForm';
import { useAuth } from '../context/AuthContext';
import { DollarSign } from 'lucide-react'; // Example icon

const AuthPage: React.FC = () => {
  const [showRegister, setShowRegister] = useState(false);
  const { isAuthenticated, isLoading } = useAuth(); // Use isLoading from useAuth
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/home', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const toggleForm = () => {
    setShowRegister(!showRegister);
  };

  // If initial auth check is loading, show a loader or nothing to prevent layout shifts
  if (isLoading && !isAuthenticated) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-dark">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary-500"></div>
          </div>
      );
  }


  return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-500/10 via-secondary-500/10 to-accent-500/10 dark:from-primary-900/30 dark:via-secondary-900/30 dark:to-accent-900/30 p-4">
        <div className="relative w-full max-w-4xl lg:grid lg:grid-cols-2 bg-white dark:bg-gray-800 shadow-2xl rounded-xl overflow-hidden">
          {/* Decorative side (visible on larger screens) */}
          <div className="hidden lg:flex flex-col justify-center items-center p-12 bg-gradient-to-br from-primary-500 to-accent-500 text-white relative overflow-hidden">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="z-10 text-center"
            >
              <DollarSign size={64} className="mx-auto mb-6 text-white opacity-80" />
              <h1 className="text-3xl font-bold mb-4">WealFlow</h1>
              <p className="text-lg opacity-90">
                Take control of your finances. Achieve your financial goals.
              </p>
            </motion.div>
            {/* Background decorative elements */}
            <div className="absolute -top-10 -left-10 w-48 h-48 bg-white/10 rounded-full animate-pulse-slow"></div>
            <div className="absolute -bottom-16 -right-5 w-64 h-64 bg-white/5 rounded-full animate-pulse-slow animation-delay-2000"></div>
          </div>

          {/* Form side */}
          <div className="p-8 sm:p-12 flex flex-col justify-center">
            <div className="w-full max-w-md mx-auto">
              <div className="mb-8 text-center lg:hidden">
                <DollarSign size={48} className="mx-auto mb-4 text-primary-500" />
                <h1 className="text-3xl font-bold text-primary-500">WealFlow</h1>
              </div>

              <AnimatePresence mode="wait">
                {showRegister ? (
                    <RegisterForm key="register" onToggleForm={toggleForm} />
                ) : (
                    <LoginForm key="login" onToggleForm={toggleForm} />
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
  );
};

export default AuthPage;
