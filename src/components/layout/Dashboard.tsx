import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
    Calendar,
    DollarSign,
    Package,
    CheckSquare,
    FileText,
    ShoppingCart,
    TrendingUp,
    Clock,
} from 'lucide-react';

const Dashboard: React.FC = () => {
    const { userProfile } = useAuth();
    const navigate = useNavigate();

    const modules = [
        {
            id: 'calendar',
            title: 'Calendario Familiar',
            description: 'Gestiona eventos, citas y actividades',
            icon: Calendar,
            color: 'primary',
            path: '/calendar',
            enabled: true,
        },
        {
            id: 'finances',
            title: 'Finanzas',
            description: 'Control de gastos e ingresos',
            icon: DollarSign,
            color: 'success',
            path: '/finances',
            enabled: false,
        },
        {
            id: 'inventory',
            title: 'Inventario',
            description: 'Productos y despensa del hogar',
            icon: Package,
            color: 'warning',
            path: '/inventory',
            enabled: false,
        },
        {
            id: 'tasks',
            title: 'Tareas',
            description: 'Mantenimiento y tareas domésticas',
            icon: CheckSquare,
            color: 'accent',
            path: '/tasks',
            enabled: false,
        },
        {
            id: 'documents',
            title: 'Documentos',
            description: 'Facturas, garantías y contratos',
            icon: FileText,
            color: 'primary',
            path: '/documents',
            enabled: false,
        },
        {
            id: 'shopping',
            title: 'Lista de Compras',
            description: 'Gestión inteligente de compras',
            icon: ShoppingCart,
            color: 'success',
            path: '/shopping',
            enabled: false,
        },
    ];

    const stats = [
        { label: 'Eventos Hoy', value: '3', icon: Calendar, color: 'primary' },
        { label: 'Tareas Pendientes', value: '7', icon: Clock, color: 'warning' },
        { label: 'Gastos del Mes', value: '$1,234', icon: TrendingUp, color: 'success' },
    ];

    return (
        <div className="max-w-7xl mx-auto">
            {/* Welcome Section */}
            <div className="mb-8 animate-slide-up">
                <h1 className="text-3xl font-bold mb-2">
                    ¡Hola, {userProfile?.displayName?.split(' ')[0]}! 👋
                </h1>
                <p className="text-text-secondary">
                    Bienvenido a tu panel de administración del hogar
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {stats.map((stat, index) => (
                    <div
                        key={stat.label}
                        className="card-glass animate-slide-up"
                        style={{ animationDelay: `${index * 100}ms` }}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-text-muted text-sm mb-1">{stat.label}</p>
                                <p className="text-3xl font-bold">{stat.value}</p>
                            </div>
                            <div className={`w-12 h-12 bg-${stat.color} bg-opacity-20 rounded-xl flex items-center justify-center`}>
                                <stat.icon size={24} className={`text-${stat.color}`} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modules Grid */}
            <div>
                <h2 className="text-2xl font-semibold mb-6">Módulos</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {modules.map((module, index) => (
                        <div
                            key={module.id}
                            className={`card-glass animate-slide-up ${module.enabled ? 'cursor-pointer' : 'opacity-60 cursor-not-allowed'
                                }`}
                            style={{ animationDelay: `${index * 100}ms` }}
                            onClick={() => module.enabled && navigate(module.path)}
                        >
                            <div className="flex items-start gap-4">
                                <div
                                    className={`w-14 h-14 gradient-${module.color} rounded-xl flex items-center justify-center flex-shrink-0 ${module.enabled ? `glow-${module.color}` : ''
                                        }`}
                                >
                                    <module.icon size={28} color="white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-2">
                                        <h3 className="font-semibold text-lg">{module.title}</h3>
                                        {!module.enabled && (
                                            <span className="text-xs bg-glass-white-5 px-2 py-1 rounded">Próximamente</span>
                                        )}
                                    </div>
                                    <p className="text-text-secondary text-sm">{module.description}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Quick Tips */}
            <div className="mt-8 card-glass">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <span className="text-xl">💡</span>
                    Consejo del día
                </h3>
                <p className="text-text-secondary">
                    Comienza agregando eventos a tu calendario familiar para mantener a todos organizados.
                    ¡Puedes asignar eventos a diferentes miembros de la familia!
                </p>
            </div>
        </div>
    );
};

export default Dashboard;
