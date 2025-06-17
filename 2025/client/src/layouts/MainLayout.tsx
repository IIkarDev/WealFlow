import React from 'react';
import {Outlet, Link} from 'react-router-dom';
import Sidebar from '@/components/common/Sidebar';
import {Bell, ChevronDown} from 'lucide-react';
import {useTheme} from '@/context/ThemeContext';
import {useAuth} from '@/context/AuthContext';
import {AnimatePresence, motion} from 'framer-motion';

const MainLayout: React.FC = () => {
    const {user} = useAuth();
    const [dropdownOpen, setDropdownOpen] = React.useState(false);


    return (
        <div className="flex h-screen bg-gray-100 dark:bg-dark w-screen overflow-hidden">
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="bg-white dark:bg-gray-800 shadow-sm print:hidden">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-end h-16">
                            <div className="flex items-center space-x-3 sm:space-x-4">
                                <button
                                    aria-label="Notifications"
                                    className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-200 transition-colors duration-200 relative">
                                    <Bell size={20}/>
                                    <span
                                        className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-primary-500 ring-2 ring-white dark:ring-gray-800"/>
                                </button>

                                <div className="relative">
                                    <button
                                        onClick={() => setDropdownOpen(!dropdownOpen)}
                                        className="flex items-center space-x-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none transition-colors duration-200">
                                        <div
                                            className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden flex items-center justify-center">
                                            {user?.avatar ? (
                                                <img
                                                    src={user.avatar}
                                                    alt={user.name || 'User Avatar'}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                                {user?.name?.charAt(0).toUpperCase() || 'U'}
                            </span>
                                            )}
                                        </div>
                                        <span
                                            className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:block">
                            {user?.name || 'User'}
                        </span>
                                        <ChevronDown size={16}
                                                     className={`text-gray-500 dark:text-gray-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}/>
                                    </button>
                                    <AnimatePresence>
                                        {dropdownOpen && (
                                            <motion.div
                                                initial={{opacity: 0, y: -10}}
                                                animate={{opacity: 1, y: 0}}
                                                exit={{opacity: 0, y: -10}}
                                                className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 z-20"
                                            >
                                                <Link to="/settings"
                                                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                                                    Settings
                                                </Link>
                                                {/* More dropdown items can be added here */}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main content */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 lg:p-8">
                    <Outlet/>
                </main>
            </div>
            <Sidebar/>
        </div>
    );
};

export default MainLayout;
