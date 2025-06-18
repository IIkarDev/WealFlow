import React, {useState, useEffect} from 'react';
import {Link, useLocation} from 'react-router-dom';
import {motion, AnimatePresence, Variants} from 'framer-motion';
import {
    LayoutGrid, // Changed from Home for a more generic dashboard icon
    DollarSign,
    BarChart3, // Changed for a different bar chart icon
    Settings,
    Menu,
    X,
    LogOut,
    Sun,
    Moon,
    ChevronsLeft,
    ChevronsRight
} from 'lucide-react';
import {useAuth} from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext'; // For theme toggle in sidebar potentially

interface SidebarProps {
    className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({className = ''}) => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const location = useLocation();
    const {logout, user} = useAuth();
    const { theme, toggleTheme } = useTheme();

    useEffect(() => {
        // Close mobile sidebar on route change
        if (isMobileOpen) {
            setIsMobileOpen(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.pathname]);

    const navItems = [
        {path: '/home', icon: <LayoutGrid size={28}/>, label: 'Dashboard'},
        {path: '/transactions', icon: <DollarSign size={28}/>, label: 'Transactions'},
        {path: '/statistics', icon: <BarChart3 size={28}/>, label: 'Statistics'},
        {path: '/settings', icon: <Settings size={28}/>, label: 'Settings'}
    ];

    const isActive = (path: string) => location.pathname === path || (path === '/' && location.pathname.startsWith('/dashboard')); // More robust active check for dashboard

    const toggleSidebar = () => setIsCollapsed(!isCollapsed);
    const toggleMobileSidebar = () => setIsMobileOpen(!isMobileOpen);

    const sidebarVariants: Variants = {
        expanded: {width: '240px', transition: { type: "spring" as const, stiffness: 300, damping: 30 }},
        collapsed: {width: '80px', transition: { type: "spring" as const, stiffness: 300, damping: 30 }}
    };

    const navItemVariants: Variants = {
        expanded: { opacity: 1, x: 0, transition: { duration: 0.2, delay: 0.1 } },
        collapsed: { opacity: 0, x: -10, transition: { duration: 0.1 }}
    };

    const SidebarContent = () => (
        <div className="flex flex-col h-full">
            {/* Logo and Desktop Toggle */}
            <div className={`flex items-center p-4 border-b border-gray-200 dark:border-gray-700 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
                 <Link to="/" className="flex items-center overflow-hidden">
                    <div className="flex-shrink-0 flex items-center justify-center w-10 h-10
                     rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 text-white font-bold text-xl shadow-md">
                        W
                    </div>
                    {!isCollapsed && (
                        <motion.span 
                            initial={{opacity:0, x: -10}} animate={{opacity:1, x:0}} transition={{delay: 0.1}}
                            className="ml-3 text-xl font-semibold text-gray-800 dark:text-white whitespace-nowrap">WealFlow</motion.span>
                    )}
                </Link>
                {!isCollapsed && (
                    <button
                        className="hidden md:block
                         p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
                        onClick={toggleSidebar}
                        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                    >
                        <ChevronsRight size={24}/>
                    </button>
                )}
            </div>
             {isCollapsed && (
                 <div className="flex justify-center py-2 border-b border-gray-200 dark:border-gray-700 md:border-b-0">
                    <button
                        className="hidden md:block p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
                        onClick={toggleSidebar}
                        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                    >
                        <ChevronsLeft size={24}/>
                    </button>
                 </div>
             )}

            {/* Nav items */}
            <nav className="flex-1 px-3 py-2 space-y-3 overflow-y-auto">
                {navItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center p-3 rounded-lg transition-colors duration-200 group
                            ${ isActive(item.path)
                                ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400 dark:bg-primary-500/20 font-medium'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                            }
                            ${isCollapsed ? 'justify-center' : ''}`}
                        title={isCollapsed ? item.label : undefined}
                    >
                        <div className="flex-shrink-0 w-7 h-7 flex items-center justify-center">
                            {item.icon}
                        </div>
                        {!isCollapsed && (
                            <motion.span variants={navItemVariants} initial="collapsed" animate="expanded" className="ml-3 whitespace-nowrap">
                                {item.label}
                            </motion.span>
                        )}
                    </Link>
                ))}
            </nav>

            {/* Bottom Section */}
            <div className="p-3 border-t border-gray-200 dark:border-gray-700 space-y-2">
                 {/* Theme Toggle */}
                 <button
                    onClick={toggleTheme}
                    className={`flex items-center w-full p-3 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors duration-200 ${isCollapsed ? 'justify-center' : ''}`}
                    title={isCollapsed ? (theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme') : undefined}
                >
                    {theme === 'dark' ? <Sun size={28}/> : <Moon size={28}/>}
                    {!isCollapsed && (
                        <motion.span variants={navItemVariants} initial="collapsed" animate="expanded" className="ml-3 whitespace-nowrap">
                            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                        </motion.span>
                    )}
                </button>
                {/* Logout button */}
                <button
                    onClick={logout}
                    className={`flex items-center w-full p-3 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-500/20 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-200 group ${isCollapsed ? 'justify-center' : ''}`}
                    title={isCollapsed ? "Logout" : undefined}
                >
                    <LogOut size={28} className="group-hover:text-red-500 dark:group-hover:text-red-400"/>
                    {!isCollapsed && (
                        <motion.span variants={navItemVariants} initial="collapsed" animate="expanded" className="ml-3 whitespace-nowrap">
                            Logout
                        </motion.span>
                    )}
                </button>
            </div>
        </div>
    );

    return (
        <>
            {/* Mobile toggle button */}
            <button
                className="fixed top-4 left-4 z-50 md:hidden bg-white dark:bg-gray-800 p-2 rounded-lg shadow-md text-gray-700 dark:text-gray-300"
                onClick={toggleMobileSidebar}
                aria-label={isMobileOpen ? "Close sidebar" : "Open sidebar"}
            >
                {isMobileOpen ? <X size={24}/> : <Menu size={24}/>}
            </button>

            {/* Mobile sidebar */}
            <AnimatePresence>
                {isMobileOpen && (
                    <>
                        <motion.div
                            initial={{opacity: 0}}
                            animate={{opacity: 0.6}}
                            exit={{opacity: 0}}
                            className="fixed inset-0 bg-black z-30 md:hidden"
                            onClick={toggleMobileSidebar}
                        />
                        <motion.div
                            className={`fixed top-0 left-0 h-full bg-white dark:bg-gray-900 shadow-xl z-40 w-64 ${className}`}
                            initial={{x: '-100%'}}
                            animate={{x: '0%'}}
                            exit={{x: '-100%'}}
                            transition={{type: 'tween', ease: 'easeInOut', duration: 0.3}}
                        >
                           <SidebarContent/>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Desktop Sidebar */}
            <motion.div
                className={`hidden md:flex md:flex-shrink-0 bg-white dark:bg-gray-900 shadow-lg ${className} h-screen sticky top-0`}
                variants={sidebarVariants}
                initial={false} // Don't animate on initial load for desktop
                animate={isCollapsed ? 'collapsed' : 'expanded'}
            >
                <SidebarContent />
            </motion.div>
        </>
    );
};

export default Sidebar;