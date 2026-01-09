import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Home } from 'lucide-react';

const Register: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }

        if (password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres');
            return;
        }

        setLoading(true);

        try {
            await register(email, password, displayName);
            navigate('/');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary opacity-20 rounded-full blur-3xl"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent opacity-20 rounded-full blur-3xl"></div>
            </div>

            <div className="card-glass max-w-md w-full relative z-10 animate-slide-up">
                <div className="flex items-center justify-center mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center glow-primary">
                            <Home size={24} color="white" />
                        </div>
                        <h1 className="text-3xl font-bold">KALAMAR</h1>
                    </div>
                </div>

                <h2 className="text-2xl font-semibold text-center mb-2">Crear Cuenta</h2>
                <p className="text-center text-secondary mb-8">Comienza a organizar tu hogar</p>

                {error && (
                    <div className="mb-6 p-4 bg-danger bg-opacity-10 border border-danger rounded-lg">
                        <p className="text-danger text-sm">{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="displayName" className="label">
                            Nombre Completo
                        </label>
                        <input
                            id="displayName"
                            type="text"
                            className="input"
                            placeholder="Juan Pérez"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="email" className="label">
                            Correo Electrónico
                        </label>
                        <input
                            id="email"
                            type="email"
                            className="input"
                            placeholder="tu@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password" className="label">
                            Contraseña
                        </label>
                        <input
                            id="password"
                            type="password"
                            className="input"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPassword" className="label">
                            Confirmar Contraseña
                        </label>
                        <input
                            id="confirmPassword"
                            type="password"
                            className="input"
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="btn btn-primary w-full mb-4" disabled={loading}>
                        {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
                    </button>

                    <p className="text-center text-secondary text-sm">
                        ¿Ya tienes cuenta?{' '}
                        <a
                            href="/login"
                            className="text-primary-light hover:text-primary font-semibold"
                            onClick={(e) => {
                                e.preventDefault();
                                navigate('/login');
                            }}
                        >
                            Inicia sesión
                        </a>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Register;
