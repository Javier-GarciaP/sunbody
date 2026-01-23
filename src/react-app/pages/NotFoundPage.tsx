import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router';

export default function NotFoundPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 text-center">
            <div className="space-y-6 max-w-md animate-fade-in">
                <div className="inline-flex p-6 bg-white dark:bg-slate-900 rounded-3xl shadow-xl dark:shadow-none border border-slate-200 dark:border-slate-800 mb-4">
                    <ShieldAlert size={64} className="text-slate-400 dark:text-slate-600" />
                </div>

                <div className="space-y-2">
                    <h1 className="text-6xl font-black text-slate-900 dark:text-slate-100 italic tracking-tighter">
                        404
                    </h1>
                    <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200">
                        Página no encontrada
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                        Lo sentimos, la página que estás buscando no existe o ha sido movida.
                    </p>
                </div>

                <div className="pt-6">
                    <button
                        onClick={() => navigate('/')}
                        className="btn btn-primary inline-flex items-center gap-2"
                    >
                        <ArrowLeft size={18} />
                        Volver al inicio
                    </button>
                </div>

                <div className="pt-12 text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 dark:text-slate-800">
                    sunbody system
                </div>
            </div>
        </div>
    );
}
