import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import MainLayout from './layouts/MainLayout';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import TransactionsPage from './pages/TransactionsPage';
import StatisticsPage from './pages/StatisticsPage';
import SettingsPage from './pages/SettingsPage';
import WelcomeOverlay from './components/dashboard/WelcomeOverlay';

// For Vite, environment variables must be prefixed with VITE_
// Example: VITE_API_URL=http://localhost:5000/api/transactions in your .env file
export const BASE_URL =  "http://localhost:5000/api/transactions";

// import.meta.env.VITE_API_URL ||
function App() {
    const [showWelcome, setShowWelcome] = useState(false);

    useEffect(() => {
        const hasVisitedBefore = localStorage.getItem('hasVisitedBefore');
        if (!hasVisitedBefore) {
            setShowWelcome(true);
            // localStorage.setItem('hasVisitedBefore', 'true'); // Comment out to always show for demo
        }
    }, []);

    return (
        <ThemeProvider>
            <AuthProvider>
                <Router>
                    <Routes>
                        <Route path="/auth" element={<AuthPage />} />
                        <Route element={<MainLayout />}>
                            <Route path="/" element={
                                <ProtectedRoute>
                                    <DashboardPage />
                                    {showWelcome && <WelcomeOverlay onClose={() => setShowWelcome(false)} />}
                                </ProtectedRoute>
                            } />
                            <Route path="/transactions" element={
                                <ProtectedRoute>
                                    <TransactionsPage />
                                </ProtectedRoute>
                            } />
                            <Route path="/statistics" element={
                                <ProtectedRoute>
                                    <StatisticsPage />
                                </ProtectedRoute>
                            } />
                            <Route path="/settings" element={
                                <ProtectedRoute>
                                    <SettingsPage />
                                </ProtectedRoute>
                            } />
                        </Route>
                    </Routes>
                </Router>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;