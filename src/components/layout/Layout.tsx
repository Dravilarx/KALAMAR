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
    Menu,
    X,
} from 'lucide-react';

const Layout: React.FC = () => {
    const { userProfile, logout } = useAuth();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = React.useState(false);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const menuItems = [
        { path: '/', icon: Home, label: 'Inicio' },
        { path: '/calendar', icon: Calendar, label: 'Calendario' },
        { path: '/finances', icon: DollarSign, label: 'Finanzas', disabled: true },
        { path: '/inventory', icon: Package, label: 'Inventario', disabled: true },
        { path: '/tasks', icon: CheckSquare, label: 'Tareas', disabled: true },
        { path: '/documents', icon: FileText, label: 'Documentos', disabled: true },
        { path: '/shopping', icon: ShoppingCart, label: 'Compras', disabled: true },
    ];

    return (
        <div className="min-h-screen flex">
            {/* Sidebar */}
            <aside
                className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-bg-secondary border-r border-glass-white-5 transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                    }`}
            >
                <div className="h-full flex flex-col">
                    {/* Logo */}
                    <div className="p-6 border-b border-glass-white-5">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 gradient-primary rounded-lg flex items-center justify-center glow-primary">
                                <Home size={20} color="white" />
                            </div>
                            <h1 className="text-xl font-bold">KALAMAR</h1>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4 overflow-y-auto">
                        <ul className="space-y-2">
                            {menuItems.map((item) => (
                                <li key={item.path}>
                                    {item.disabled ? (
                                        <div className="flex items-center gap-3 px-4 py-3 rounded-lg text-text-muted cursor-not-allowed opacity-50">
                                            <item.icon size={20} />
                                            <span>{item.label}</span>
                                            <span className="ml-auto text-xs bg-glass-white-5 px-2 py-1 rounded">Próximamente</span>
                                        </div>
                                    ) : (
                                        <NavLink
                                            to={item.path}
                                            end={item.path === '/'}
                                            className={({ isActive }) =>
                                                `flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive
                                                    ? 'bg-primary text-white glow-primary'
                                                    : 'text-text-secondary hover:bg-glass-white-5 hover:text-text-primary'
                                                }`
                                            }
                                            onClick={() => setSidebarOpen(false)}
                                        >
                                            <item.icon size={20} />
                                            <span>{item.label}</span>
                                        </NavLink>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </nav>

                    {/* User Profile */}
                    <div className="p-4 border-t border-glass-white-5">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                                <User size={20} color="white" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{userProfile?.displayName}</p>
                                <p className="text-xs text-text-muted truncate">{userProfile?.email}</p>
                            </div>
                        </div>
                        <button onClick={handleLogout} className="btn btn-ghost w-full justify-start">
                            <LogOut size={18} />
                            <span>Cerrar Sesión</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Main content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <header className="bg-bg-secondary border-b border-glass-white-5 px-6 py-4">
                    <div className="flex items-center gap-4">
                        <button
                            className="lg:hidden p-2 hover:bg-glass-white-5 rounded-lg transition-colors"
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                        >
                            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                        <h2 className="text-xl font-semibold">Administración del Hogar</h2>
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 p-6 overflow-y-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;
