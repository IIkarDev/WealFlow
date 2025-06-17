import React, {createContext, useContext, useState, useEffect, ReactNode, useCallback} from 'react';
import type {User, AuthState} from '@/types';

interface AuthContextType extends AuthState {
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({children}) => {
    const [authState, setAuthState] = useState<AuthState>({
        user: null,
        isAuthenticated: false,
        isLoading: true, // true, пока сессия не проверена
    });

    // Центральная функция: получает данные пользователя, обновляет localStorage и состояние
    const validateUser = useCallback(async () => {
        try {
            const response = await fetch("/auth/user", {
                method: "GET",
                credentials: 'include', // Критично для сессий на основе cookie
                headers: {"Accept": "application/json"}
            });

            if (response.ok) {
                const currentUser: User = await response.json();
                localStorage.setItem('user', JSON.stringify(currentUser));
                setAuthState({user: currentUser, isAuthenticated: true, isLoading: false});
            } else {
                localStorage.removeItem('user');
                setAuthState({user: null, isAuthenticated: false, isLoading: false});
            }
        } catch (error) {
            console.error("Ошибка API в validateUser:", error);
            localStorage.removeItem('user');
            setAuthState({user: null, isAuthenticated: false, isLoading: false});
        }
    }, []);

    useEffect(() => {
        let isMounted = true; // Предотвращает обновление состояния на размонтированном компоненте

        const checkUserSession = async () => {
            if (!isMounted) return;
            setAuthState(prev => ({ ...prev, isLoading: true }));

            // Оптимистичная загрузка из localStorage для быстрого UI
            const savedUser = localStorage.getItem('user');
            if (savedUser) {
                try {
                    const user: User = JSON.parse(savedUser);
                    if (isMounted) setAuthState(prev => ({...prev, user, isAuthenticated: true}));
                } catch (error) {
                    if (isMounted) {
                        localStorage.removeItem('user');
                        setAuthState(prev => ({ ...prev, user: null, isAuthenticated: false }));
                    }
                }
            } else {
                if (isMounted) setAuthState(prev => ({ ...prev, user: null, isAuthenticated: false }));
            }

            // Всегда валидируем сессию с API
            if (isMounted) await validateUser();
        };

        checkUserSession();

        return () => { isMounted = false; };
    }, [validateUser]);

    const login = async (email: string, password: string) => {
        setAuthState(prev => ({...prev, isLoading: true, user: null, isAuthenticated: false }));
        try {
            const response = await fetch("/auth/login", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                credentials: 'include',
                body: JSON.stringify({email, password}),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Ошибка входа: ${response.statusText}`);
            }
            // После успешного входа, получаем полные данные пользователя
            await validateUser();
        } catch (error: any) {
            setAuthState(prev => ({...prev, user: null, isAuthenticated: false, isLoading: false}));
            throw error;
        }
    };

    const register = async (name: string, email: string, password: string) => {
        setAuthState(prev => ({...prev, isLoading: true, user: null, isAuthenticated: false }));
        try {
            const response = await fetch("/auth/register", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                credentials: 'include',
                body: JSON.stringify({name, email, password}),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Ошибка регистрации: ${response.statusText}`);
            }
            // После успешной регистрации, получаем данные пользователя (если происходит авто-логин)
            await validateUser();
        } catch (error: any) {
            setAuthState(prev => ({...prev, user: null, isAuthenticated: false, isLoading: false}));
            throw error;
        }
    };

    const logout = async () => {
        localStorage.removeItem('user');
        setAuthState({user: null, isAuthenticated: false, isLoading: false});

        try {
            // Инвалидируем сессию на сервере
            await fetch("/auth/logout", {
                method: "POST",
                credentials: 'include',
            });
        } catch (error) {
            console.error("Ошибка выхода на сервере:", error);
        }
    };

    return (
        <AuthContext.Provider value={{...authState, login, register, logout}}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth должен использоваться внутри AuthProvider');
    }
    return context;
};