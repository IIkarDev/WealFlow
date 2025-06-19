import {BrowserRouter as Router, Routes, Route, Navigate} from 'react-router-dom';
import React, {useState, useEffect} from 'react';
import {AuthProvider} from './context/AuthContext';
import {ThemeProvider} from './context/ThemeContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import MainLayout from './layouts/MainLayout';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import TransactionsPage from './pages/TransactionsPage';
import StatisticsPage from './pages/StatisticsPage';
import SettingsPage from './pages/SettingsPage';
import WelcomeOverlay from './components/dashboard/WelcomeOverlay';
import {Auth0Provider} from "@auth0/auth0-react";
import {useQueryClient} from "@tanstack/react-query";


function App() {
    const [showWelcome, setShowWelcome] = useState(false);

    useEffect(() => {
        const hasVisitedBefore = localStorage.getItem('hasVisitedBefore');
        if (!hasVisitedBefore) {
            setShowWelcome(true);
            localStorage.setItem('hasVisitedBefore', 'true');
        }
    }, []);

    return (
        <ThemeProvider>
            <AuthProvider>
                <Auth0Provider domain={import.meta.env.VITE_AUTH0_DOMAIN}
                               clientId={import.meta.env.VITE_AUTH0_CLIENT_ID}
                               authorizationParams={{
                                   redirect_uri: import.meta.env.VITE_AUTH0_REDIRECT_URI,
                                   connection: 'google-oauth2'
                               }}>
                    <Router>
                        <Routes>
                            <Route path="/auth" element={<AuthPage/>}/>
                            <Route path="/" element={<Navigate to="/auth" replace />} />
                            <Route element={<MainLayout/>}>
                                <Route path="/home" element={
                                    <ProtectedRoute>
                                        <DashboardPage/>
                                        {showWelcome && <WelcomeOverlay onClose={() => setShowWelcome(false)}/>}
                                    </ProtectedRoute>
                                }/>
                                <Route path="/transactions" element={
                                    <ProtectedRoute>
                                        <TransactionsPage/>
                                    </ProtectedRoute>
                                }/>
                                <Route path="/statistics" element={
                                    <ProtectedRoute>
                                        <StatisticsPage/>
                                    </ProtectedRoute>
                                }/>
                                <Route path="/settings" element={
                                    <ProtectedRoute>
                                        <SettingsPage/>
                                    </ProtectedRoute>
                                }/>
                            </Route>
                        </Routes>
                    </Router>
                </Auth0Provider>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;