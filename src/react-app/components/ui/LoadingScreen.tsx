
export const LoadingScreen = () => {
    return (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors duration-500">
            <div className="relative flex flex-col items-center">
                {/* Logo/Icon Container */}
                <div className="w-20 h-20 mb-8 relative">
                    {/* Pulsing Backlight */}
                    <div className="absolute inset-0 bg-slate-200 dark:bg-slate-800 rounded-3xl animate-pulse blur-xl opacity-50" />

                    {/* Main Icon */}
                    <div className="relative w-full h-full bg-white dark:bg-slate-900 rounded-3xl shadow-2xl dark:shadow-none border border-slate-200 dark:border-slate-800 flex items-center justify-center overflow-hidden group">
                        <img
                            src="/favicon.svg"
                            alt="sunbody"
                            className="w-12 h-12 object-contain animate-bounce-slow"
                        />
                    </div>
                </div>

                {/* Text Branding */}
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tighter italic animate-fade-in">
                        sunbody
                    </h1>
                    <div className="flex items-center gap-2 justify-center">
                        <div className="h-1 w-1 bg-slate-300 dark:bg-slate-700 rounded-full animate-bounce [animation-delay:-0.3s]" />
                        <div className="h-1 w-1 bg-slate-300 dark:bg-slate-700 rounded-full animate-bounce [animation-delay:-0.15s]" />
                        <div className="h-1 w-1 bg-slate-300 dark:bg-slate-700 rounded-full animate-bounce" />
                    </div>
                </div>

                {/* Minimalist Footer */}
                <div className="absolute bottom-[-100px] text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 dark:text-slate-800">
                    Iniciando Sistema
                </div>
            </div>
        </div>
    );
};
