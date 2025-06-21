import React, {useState} from 'react';
import {User, Lock, Palette, Bell, CreditCard, ShieldCheck} from 'lucide-react';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Card from '../components/common/Card';
import {useTheme} from '../context/ThemeContext';
import {useAuth} from '../context/AuthContext';

type ActiveTab = 'profile' | 'password' | 'appearance' | 'notifications' | 'billing';

const SettingsPage: React.FC = () => {
    const {theme, toggleTheme, setTheme} = useTheme();
    const {user, update, changePassword, logout} = useAuth();

    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [currency, setCurrency] = useState('USD');
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [pushNotifications, setPushNotifications] = useState(false);

    const [activeTab, setActiveTab] = useState<ActiveTab>('profile');
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    const showFeedback = (type: 'success' | 'error', message: string) => {
        setFeedback({type, message});
        setTimeout(() => setFeedback(null), 3000);
    };

    const handleProfileSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await update(name, email);
            showFeedback('success', 'Profile updated successfully!');
        } catch (error: any) {
            showFeedback('error', error.message || 'Failed to update profile.');
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            showFeedback('error', 'New passwords do not match.');
            return;
        }
        if (newPassword.length < 6) {
            showFeedback('error', 'New password must be at least 6 characters.');
            return;
        }
        try {
            await changePassword(currentPassword, newPassword);
            showFeedback('success', 'Password changed successfully!');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error: any) {
            showFeedback('error', error.message || 'Failed to change password.');
        }
    };

    const handlePreferencesSave = (e: React.FormEvent) => {
        e.preventDefault();
        showFeedback('success', 'Preferences saved!');
    };

    const handleNotificationSave = (e: React.FormEvent) => {
        e.preventDefault();
        showFeedback('success', 'Notification settings updated!');
    };


    const tabs = (user?.provider == "common") ? [
            {id: 'profile', label: 'Profile', icon: <User size={18}/>},
            {id: 'password', label: 'Security', icon: <ShieldCheck size={18}/>},
            {id: 'appearance', label: 'Appearance', icon: <Palette size={18}/>},
            {id: 'notifications', label: 'Notifications', icon: <Bell size={18}/>},
            {id: 'billing', label: 'Billing', icon: <CreditCard size={18}/>},
        ] : [
            {id: 'profile', label: 'Profile', icon: <User size={18}/>},
            {id: 'appearance', label: 'Appearance', icon: <Palette size={18}/>},
            {id: 'notifications', label: 'Notifications', icon: <Bell size={18}/>},
            {id: 'billing', label: 'Billing', icon: <CreditCard size={18}/>},
        ]
    ;


    const renderFeedback = () => {
        if (!feedback) return null;
        return (
            <div
                className={`my-4 p-3 rounded text-sm ${feedback.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {feedback.message}
            </div>
        );
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'profile':
                return (
                    <Card>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Profile Settings</h2>
                        <div className="flex items-center mb-8 space-x-4">
                            <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 ring-2 ring-primary-500 ring-offset-2 dark:ring-offset-gray-800">
                                {user?.avatar ? (
                                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-primary-500 text-white text-3xl font-bold">
                                        {user?.name?.charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </div>
                            <div>
                                <Button variant="outline" size="sm">Change Photo</Button>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">JPG, GIF or PNG. 1MB max.</p>
                            </div>
                        </div>
                        <form onSubmit={handleProfileSave} className="space-y-4">
                            <Input label="Full Name" type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} />
                            <Input label="Email Address" type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                            <div className="flex justify-end pt-2">
                                {user?.provider == "common" && <Button variant="primary" type="submit">Save Changes</Button>}
                            </div>
                        </form>
                        {user?.provider != "common" && <Button variant="primary" type="submit" onClick={logout}>Logout</Button>}
                    </Card>
                );
            case 'password':
                return (
                    <Card>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Change Password</h2>
                        {renderFeedback()}
                        <form onSubmit={handlePasswordChange} className="space-y-4">
                            <Input label="Current Password" type="password" value={currentPassword}
                                   onChange={(e) => setCurrentPassword(e.target.value)}/>
                            <Input label="New Password" type="password" value={newPassword}
                                   onChange={(e) => setNewPassword(e.target.value)}/>
                            <Input label="Confirm New Password" type="password" value={confirmPassword}
                                   onChange={(e) => setConfirmPassword(e.target.value)}/>
                            <div className="flex justify-end pt-2">
                                <Button variant="primary" type="submit">Update Password</Button>
                            </div>
                        </form>
                    </Card>
                );
            case 'appearance':
                return (
                    <Card>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Appearance Settings</h2>
                        <form onSubmit={handlePreferencesSave} className="space-y-6">
                            <div>
                                <label className="label-text mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Theme</label>
                                <div className="flex space-x-2 rounded-lg bg-gray-100 dark:bg-gray-700 p-1">
                                    {(['light', 'dark', 'system'] as const).map(th => (
                                        <button
                                            type="button"
                                            key={th}
                                            onClick={() => {
                                                if (th === 'system') {
                                                    // For 'system', you might remove localStorage theme and let OS decide
                                                    localStorage.removeItem('theme');
                                                    setTheme(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
                                                } else {
                                                    setTheme(th);
                                                }
                                            }}
                                            className={`w-full py-2 px-3 rounded-md text-sm font-medium transition-colors
                                    ${(theme === th || (th === 'system' && !localStorage.getItem('theme')))
                                                ? 'bg-white dark:bg-primary-600 text-primary-700 dark:text-white shadow'
                                                : 'hover:bg-gray-200 dark:hover:bg-gray-600/50 text-gray-600 dark:text-gray-400'}`}
                                        >
                                            {th.charAt(0).toUpperCase() + th.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="label-text mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="currency">Currency</label>
                                <select id="currency" className="input w-full" value={currency} onChange={(e) => setCurrency(e.target.value)}>
                                    {['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD'].map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div className="flex justify-end pt-2">
                                <Button variant="primary" type="submit">Save Appearance</Button>
                            </div>
                        </form>
                    </Card>
                );
            case 'notifications':
                return (
                    <Card>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Notification Settings</h2>
                        <form onSubmit={handleNotificationSave} className="space-y-6">
                            <div className="flex items-center justify-between p-3 rounded-lg border dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                                <div>
                                    <h3 className="font-medium text-gray-800 dark:text-gray-200">Email Notifications</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Receive important updates via email.</p>
                                </div>
                                <label htmlFor="emailNotificationsToggle" className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" id="emailNotificationsToggle" className="sr-only peer" checked={emailNotifications} onChange={() => setEmailNotifications(!emailNotifications)} />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                                </label>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-lg border dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                                <div>
                                    <h3 className="font-medium text-gray-800 dark:text-gray-200">Push Notifications</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Get real-time alerts on your device.</p>
                                </div>
                                <label htmlFor="pushNotificationsToggle" className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" id="pushNotificationsToggle" className="sr-only peer" checked={pushNotifications} onChange={() => setPushNotifications(!pushNotifications)} />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                                </label>
                            </div>
                            <div className="flex justify-end pt-2">
                                <Button variant="primary" type="submit">Save Notifications</Button>
                            </div>
                        </form>
                    </Card>
                );
            case 'billing':
                return (
                    <Card>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Billing Information</h2>
                        <div className="space-y-4 text-gray-700 dark:text-gray-300">
                            <p>Your current plan: <span className="font-medium text-primary-600 dark:text-primary-400">Pro Plan</span>.</p>
                            <p>Next billing date: <span className="font-medium">July 15, 2024</span>.</p>
                            <p>Payment method: <span className="font-medium">Visa ending in **** 4242</span>.</p>
                            <div className="pt-4 space-x-3">
                                <Button variant="primary">Upgrade Plan</Button>
                                <Button variant="outline">Update Payment Method</Button>
                            </div>
                            <a href="#" className="text-sm text-gray-500 dark:text-gray-400 hover:underline">View invoice history</a>
                        </div>
                    </Card>
                );
            default: return null;
        }
    };

    return (
        <div className="p-4 sm:p-8 max-w-4xl mx-auto">
            <div className="flex space-x-4 mb-6">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as ActiveTab)}
                        className={`flex items-center px-4 py-2 rounded-md text-sm font-medium ${
                            activeTab === tab.id ? 'bg-primary-100 text-primary-700 dark:bg-primary-700 dark:text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                    >
                        {tab.icon}
                        <span className="ml-2">{tab.label}</span>
                    </button>
                ))}
            </div>
            {renderContent()}
        </div>
    );
};

export default SettingsPage;

