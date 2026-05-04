import React, { useEffect, useState } from 'react';

interface PreloaderProps {
  onComplete: () => void;
}

const Preloader: React.FC<PreloaderProps> = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Simulate loading progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 150);

    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 500); // Wait for fade animation
    }, 2000);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [onComplete]);

  if (!isVisible && progress >= 100) return null;

  return (
    <div className={`fixed inset-0 bg-slate-950 z-[1000] flex flex-col items-center justify-center transition-all duration-700 ease-in-out ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div className="relative flex flex-col items-center">
        {/* Spinner */}
        <div className="relative w-24 h-24 mb-8">
          <div className="absolute inset-0 border-4 border-rose-500/10 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-t-rose-500 rounded-full animate-spin shadow-[0_0_20px_rgba(244,63,94,0.4)]"></div>
          
          {/* Central Icon */}
          <div className="absolute inset-0 flex items-center justify-center text-3xl animate-pulse">
            🐉
          </div>
        </div>

        {/* Text */}
        <div className="text-center">
          <h1 className="text-2xl font-black text-white tracking-[0.3em] uppercase font-serif mb-2">Crit 2048</h1>
          <div className="w-48 h-1 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
            <div 
              className="h-full bg-rose-600 transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-4 font-bold animate-pulse">
            Communing with the Vestige...
          </p>
        </div>
      </div>

      {/* Decorative corners */}
      <div className="absolute top-8 left-8 w-12 h-12 border-t-2 border-l-2 border-rose-900/30"></div>
      <div className="absolute top-8 right-8 w-12 h-12 border-t-2 border-r-2 border-rose-900/30"></div>
      <div className="absolute bottom-8 left-8 w-12 h-12 border-b-2 border-l-2 border-rose-900/30"></div>
      <div className="absolute bottom-8 right-8 w-12 h-12 border-b-2 border-r-2 border-rose-900/30"></div>
    </div>
  );
};

export default Preloader;
