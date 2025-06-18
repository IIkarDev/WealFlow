import React, {useEffect, useState} from 'react';
import {motion, Variants} from 'framer-motion';
import {Mail, Lock, LogIn} from 'lucide-react';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import {useAuth} from '@/context/AuthContext';
import {useAuth0} from "@auth0/auth0-react";

interface LoginFormProps {
    onToggleForm: () => void;
}

const fetchAndSendToken = async (getIdTokenClaims: () => Promise<any>) => {
    try {
        const claims = await getIdTokenClaims();
        const idToken = claims?.__raw;


        if (!idToken) return;

        const res = await fetch("http://localhost:5000/auth/google", {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: idToken }),
        });

        if (!res.ok) {
            console.error("Failed to authenticate with backend");
        }
    } catch (err) {
        console.error("Error sending token to backend:", err);
    }
};
const LoginWithGoogle = () => {

    const {loginWithRedirect, getIdTokenClaims} = useAuth0();

    return (
        <button
            onClick={async () => {
                await loginWithRedirect();
                await fetchAndSendToken(getIdTokenClaims);
            }}
            className="
            mt-4 w-full flex items-center justify-center gap-2 rounded-md
            bg-blue-600
            hover:bg-blue-700
            focus:outline-none focus:ring-4
            focus:ring-blue-300
            text-white font-semibold py-3 transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Sign in with Auth0" >

            <LogIn size={20} />
            Sign in with Google
        </button>
    );
};


const LoginForm: React.FC<LoginFormProps> = ({onToggleForm}) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const {login, isLoading} = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            await login(email, password);

        } catch (err: any) {
            setError(err.message || 'Invalid email or password. Please try again.');
        }
    };

    const formVariants: Variants = {
        hidden: {opacity: 0, y: 20},
        visible: {opacity: 1, y: 0, transition: {duration: 0.4, ease: "easeOut" as const}},
        exit: {opacity: 0, y: -20, transition: {duration: 0.3, ease: "easeIn" as const}}
    };

    return (
        <motion.div
            variants={formVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
        >
            <div className="mb-6 text-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome Back!</h2>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Sign in to continue to WealFlow.</p>
            </div>

            {error && (
                <motion.div
                    initial={{opacity: 0, y: -10}} animate={{opacity: 1, y: 0}}
                    className="mb-4 p-3 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-200 rounded-lg text-sm"
                >
                    {error}
                </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                    label="Email Address"
                    type="email"
                    id="login-email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    icon={<Mail/>}
                    disabled={isLoading}
                />

                <Input
                    label="Password"
                    type="password"
                    id="login-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    icon={<Lock/>}
                    disabled={isLoading}
                />

                <div className="flex items-center justify-between text-sm">
                    <label htmlFor="remember-me" className="flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            id="remember-me"
                            className="h-4 w-4 text-primary-500 rounded border-gray-300 dark:border-gray-600 focus:ring-primary-500 dark:bg-gray-700"
                        />
                        <span className="ml-2 text-gray-700 dark:text-gray-300">Remember me</span>
                    </label>
                    <a href="#"
                       className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300">
                        Forgot password?
                    </a>
                </div>

                <Button
                    type="submit"
                    variant="primary"
                    className="w-full py-3 text-md"
                    isLoading={isLoading}
                    icon={isLoading ? undefined : <LogIn size={18}/>} // Show icon only when not loading
                    iconPosition="left"
                >
                    {isLoading ? 'Signing In...' : 'Sign In'}
                </Button>
                <LoginWithGoogle/>
            </form>
            <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
                Don't have an account?{' '}
                <button
                    onClick={onToggleForm}
                    className="text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 focus:outline-none"
                    disabled={isLoading}
                >
                    Sign up
                </button>
            </p>

        </motion.div>
    );
};

export default LoginForm;