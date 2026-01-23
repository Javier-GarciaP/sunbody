
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router';
import { Loader2, ShieldAlert } from 'lucide-react';

export const LoginPage = () => {
    const { signInWithGoogle, user, isAllowed, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Si ya está logueado y permitido, redirigir al dashboard
    useEffect(() => {
        if (!authLoading && user && isAllowed) {
            navigate('/');
        }
    }, [user, isAllowed, authLoading, navigate]);

    const handleLogin = async () => {
        setError('');
        setLoading(true);
        try {
            await signInWithGoogle();
            // navigate('/') se ejecutará a través del useEffect si todo sale bien
        } catch (err: any) {
            setError(err.message || 'Error al iniciar sesión');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-800 via-gray-900 to-black text-white p-4">
            <div className="max-w-md w-full bg-gray-800/40 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl p-8 md:p-12 space-y-10 animate-fade-in">
                <div className="text-center space-y-4">
                    <div className="inline-flex p-4 bg-gradient-to-tr from-brand-500 to-purple-500 rounded-2xl shadow-lg mb-4 ring-8 ring-brand-500/10 animate-pulse">
                        <ShieldAlert className="w-8 h-8 text-white" />
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-brand-400 to-purple-500 tracking-tight">
                            sunbody
                        </h1>
                        <p className="text-gray-400 font-medium">Panel de Control & Ventas</p>
                    </div>
                </div>

                <div className="space-y-6">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm font-bold text-center animate-shake">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <button
                            onClick={handleLogin}
                            disabled={loading || authLoading}
                            className="w-full flex items-center justify-center gap-4 bg-white text-gray-950 hover:bg-gray-100 font-black py-4 px-6 rounded-2xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-white/5"
                        >
                            {loading ? (
                                <Loader2 className="w-6 h-6 animate-spin" />
                            ) : (
                                <>
                                    <svg className="w-6 h-6" viewBox="0 0 24 24">
                                        <path
                                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                            fill="#4285F4"
                                        />
                                        <path
                                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                            fill="#34A853"
                                        />
                                        <path
                                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                            fill="#FBBC05"
                                        />
                                        <path
                                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                            fill="#EA4335"
                                        />
                                    </svg>
                                    <span className="text-lg">Acceder con Google</span>
                                </>
                            )}
                        </button>

                        <p className="text-[10px] text-gray-500 text-center px-4 leading-relaxed uppercase tracking-widest font-bold opacity-50">
                            Solo personal autorizado puede acceder a este sistema
                        </p>
                    </div>
                </div>

                <div className="pt-4 flex justify-center">
                    <div className="h-1 w-12 bg-gradient-to-r from-transparent via-gray-700 to-transparent rounded-full" />
                </div>
            </div>
        </div>
    );
};
