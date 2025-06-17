import React, { useState } from 'react';
import { motion, Variants } from 'framer-motion';
import { UserPlus, Mail, Lock, User } from 'lucide-react';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import { useAuth } from '@/context/AuthContext';

interface RegisterFormProps {
  onToggleForm: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onToggleForm }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { register, isLoading } = useAuth();

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Full name is required';
    if (!email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Email address is invalid';
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({}); // Clear previous global errors
    if (!validate()) return;
    
    try {
      await register(name, email, password);
      // Navigation will be handled by AuthPage useEffect or ProtectedRoute
    } catch (error: any) {
      setErrors({ form: error.message || 'Registration failed. Please try again.' });
    }
  };

  const formVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3, ease: "easeIn" as const } }
  };

  return (
    <motion.div
      variants={formVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create Your Account</h2>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Join WealFlow today!</p>
      </div>
      
      {errors.form && (
         <motion.div 
          initial={{opacity:0, y: -10}} animate={{opacity:1, y:0}}
          className="mb-4 p-3 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-200 rounded-lg text-sm"
        >
          {errors.form}
        </motion.div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Full Name"
          type="text"
          id="register-name"
          placeholder="John Doe"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
          icon={<User />}
          disabled={isLoading}
        />
        
        <Input
          label="Email Address"
          type="email"
          id="register-email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          icon={<Mail />}
          disabled={isLoading}
        />
        
        <Input
          label="Password"
          type="password"
          id="register-password"
          placeholder="Minimum 6 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          icon={<Lock />}
          disabled={isLoading}
        />
        
        <Input
          label="Confirm Password"
          type="password"
          id="confirmPassword"
          placeholder="Re-enter your password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={errors.confirmPassword}
          icon={<Lock />}
          disabled={isLoading}
        />
        
        <Button
          type="submit"
          variant="primary"
          className="w-full"
          isLoading={isLoading}
          icon={isLoading ? undefined : <UserPlus size={18}/>}
          iconPosition="left"
        >
         {isLoading ? 'Creating Account...' : 'Create Account'}
        </Button>
      </form>
      
      <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
        Already have an account?{' '}
        <button
          onClick={onToggleForm}
          className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 focus:outline-none"
          disabled={isLoading}
        >
          Sign in
        </button>
      </p>
    </motion.div>
  );
};

export default RegisterForm;