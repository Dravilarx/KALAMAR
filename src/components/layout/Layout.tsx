import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
    Home,
    Calendar,
    DollarSign,
    Package,
    CheckSquare,
    FileText,
    ShoppingCart,
    LogOut,
    User,
    Settings,
    HelpCircle,
    Search,
    Moon,
    Sun,
} from 'lucide-react';

const Layout: React.FC = () => {
    const { userProfile, logout } = useAuth();
    const navigate = useNavigate();
    const [darkMode, setDarkMode] = React.useState(true); // Default to dark mode

    React.useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.remove('light-theme');
        } else {
            document.documentElement.classList.add('light-theme');
        }
    }, [darkMode]);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const menuItems = [
        { path: '/', icon: Home, label: 'Overview' },
        { path: '/calendar', icon: Calendar, label: 'Calendar' },
        { path: '/tasks', icon: CheckSquare, label: 'To do list', disabled: true },
    ];

    const bottomMenuItems = [
        { icon: Settings, label: 'Settings', disabled: true },
        { icon: HelpCircle, label: 'Help center', disabled: true },
    ];

    return (
        <div className="min-h-screen flex bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-300">
            {/* Sidebar - Datewise Style */}
            <aside className="w-64 bg-[var(--bg-secondary)] border-r border-[var(--border-subtle)] flex flex-col glass">
                {/* Logo */}
                <div className="p-6 border-b border-[var(--border-subtle)]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform">
                            <Home size={22} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">KALAMAR</h1>
                            <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest font-semibold">Home Hub</p>
                        </div>
                    </div>
                </div>

                {/* Search */}
                <div className="px-4 py-4">
                    <div className="relative group">
                        <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--primary)] transition-colors" />
                        <input
                            type="text"
                            placeholder="Search everything..."
                            className="input pl-10"
                        />
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 overflow-y-auto py-2">
                    <ul className="space-y-1.5">
                        {menuItems.map((item) => (
                            <li key={item.path || item.label}>
                                {item.disabled ? (
                                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-[var(--text-muted)] opacity-50 cursor-not-allowed">
                                        <item.icon size={20} />
                                        <span className="text-sm font-medium">{item.label}</span>
                                    </div>
                                ) : (
                                    <NavLink
                                        to={item.path}
                                        end={item.path === '/'}
                                        className={({ isActive }) =>
                                            `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                                                ? 'bg-[var(--primary)] text-white shadow-md shadow-blue-500/20'
                                                : 'text-[var(--text-secondary)] hover:bg-[var(--glass-white-5)] hover:text-[var(--text-primary)]'
                                            }`
                                        }
                                    >
                                        <item.icon size={20} className="group-hover:scale-110 transition-transform" />
                                        <span className="text-sm font-medium">{item.label}</span>
                                    </NavLink>
                                )}
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* Theme Selector */}
                <div className="px-4 py-4 border-t border-[var(--border-subtle)] bg-[var(--glass-white-5)]">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Accent</span>
                        <div className="flex gap-1.5">
                            {[
                                { color: '#6366f1' },
                                { color: '#10b981' },
                                { color: '#f59e0b' },
                                { color: '#ef4444' },
                                { color: '#ec4899' },
                            ].map((theme, i) => (
                                <button
                                    key={i}
                                    className={`w-4 h-4 rounded-full transition-transform hover:scale-125 ${i === 0 ? 'ring-2 ring-offset-2 ring-offset-[var(--bg-secondary)] ring-blue-500' : ''
                                        }`}
                                    style={{ backgroundColor: theme.color }}
                                />
                            ))}
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Dark mode</span>
                        <button
                            onClick={() => setDarkMode(!darkMode)}
                            className={`relative w-12 h-6 rounded-full transition-all duration-300 ${darkMode ? 'bg-[var(--primary)]' : 'bg-gray-300'
                                }`}
                        >
                            <span
                                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-lg transition-transform duration-300 flex items-center justify-center ${darkMode ? 'translate-x-6' : ''
                                    }`}
                            >
                                {darkMode ? <Moon size={12} className="text-[var(--primary)]" /> : <Sun size={12} className="text-orange-400" />}
                            </span>
                        </button>
                    </div>
                </div>

                {/* Bottom Menu */}
                <div className="px-3 py-2 border-t border-gray-100">
                    <ul className="space-y-1">
                        {bottomMenuItems.map((item) => (
                            <li key={item.label}>
                                <button
                                    disabled={item.disabled}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <item.icon size={18} />
                                    <span className="text-sm font-medium">{item.label}</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* User Profile */}
                <div className="p-4 border-t border-gray-100">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <User size={18} className="text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">
                                {userProfile?.displayName || 'Usuario'}
                            </p>
                            <p className="text-xs text-gray-500 truncate">{userProfile?.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <LogOut size={16} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Page content */}
                <main className="flex-1 overflow-y-auto bg-[var(--bg-primary)]">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;
