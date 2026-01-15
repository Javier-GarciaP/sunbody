import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';

const PHRASES = [
    "¡Eres increíble!",
    "Te amo ❤️",
    "¡Sigue brillando!",
    "Tu esfuerzo vale la pena",
    "Eres capaz de todo",
    "¡Hoy será un gran día!",
    "Confío en ti",
    "Eres mi orgullo",
    "¡Nunca te rindas!",
    "Lo estás haciendo genial",
];

export default function LovableBear() {
    const [phraseIndex, setPhraseIndex] = useState(0);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const interval = setInterval(() => {
            setIsVisible(false); // Fade out
            setTimeout(() => {
                setPhraseIndex((prev) => (prev + 1) % PHRASES.length);
                setIsVisible(true); // Fade in
            }, 500); // Wait for fade out
        }, 5000); // Change every 5 seconds

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="w-full flex justify-center items-center py-6 animate-fade-in">
            <div className="relative flex items-center gap-4 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/10 dark:to-pink-900/10 px-8 py-4 rounded-3xl border border-red-100 dark:border-red-900/30 shadow-sm max-w-lg w-full">

                {/* Bear Image */}
                <div className="shrink-0 relative">
                    <img
                        src="/lovable-bear.png"
                        alt="Lovable Bear"
                        className="w-24 h-24 object-contain drop-shadow-md animate-bounce-slow"
                    />
                    <div className="absolute -top-1 -right-1">
                        <Heart className="w-5 h-5 text-red-500 fill-red-500 animate-pulse" />
                    </div>
                </div>

                {/* Speech Bubble */}
                <div className="flex-1">
                    <div className="relative bg-white dark:bg-gray-800 p-4 rounded-2xl rounded-tl-none shadow-sm border border-red-100 dark:border-red-900/20">
                        <div className={`text-lg font-bold text-gray-800 dark:text-gray-100 text-center transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
                            "{PHRASES[phraseIndex]}"
                        </div>
                        {/* Triangle for speech bubble */}
                        <div className="absolute top-4 -left-2 w-4 h-4 bg-white dark:bg-gray-800 border-l border-b border-red-100 dark:border-red-900/20 transform rotate-45"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}
