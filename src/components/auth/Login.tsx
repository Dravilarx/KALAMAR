import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Home } from 'lucide-react';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(email, password);
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

                <h2 className="text-2xl font-semibold text-center mb-2">Bienvenido</h2>
                <p className="text-center text-secondary mb-8">Inicia sesión para continuar</p>

                {error && (
                    <div className="mb-6 p-4 bg-danger bg-opacity-10 border border-danger rounded-lg">
                        <p className="text-danger text-sm">{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
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

                    <button type="submit" className="btn btn-primary w-full mb-4" disabled={loading}>
                        {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                    </button>

                    <p className="text-center text-secondary text-sm">
                        ¿No tienes cuenta?{' '}
                        <a
                            href="/register"
                            className="text-primary-light hover:text-primary font-semibold"
                            onClick={(e) => {
                                e.preventDefault();
                                navigate('/register');
                            }}
                        >
                            Regístrate
                        </a>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Login;
