import React, { useEffect, useState } from 'react';
import { Emoji } from './Emoji';
import { motion } from 'framer-motion';

interface PreloaderProps {
  onComplete: () => void;
}

const Preloader: React.FC<PreloaderProps> = ({ onComplete }) => {
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
    }, 100);

    const timer = setTimeout(() => {
      onComplete();
    }, 2200);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [onComplete]);

  return (
    <motion.div 
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className="fixed inset-0 bg-slate-950 z-[1000] flex flex-col items-center justify-center"
    >
      <div className="relative flex flex-col items-center">
        {/* Spinner */}
        <div className="relative w-24 h-24 mb-8">
          <div className="absolute inset-0 border-4 border-rose-500/10 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-t-rose-500 rounded-full animate-spin shadow-[0_0_20px_rgba(244,63,94,0.4)]"></div>
          
          {/* Central Icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Emoji char="🐉" active={true} className="w-14 h-14" />
          </div>
        </div>

        {/* Text */}
        <div className="text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-2xl font-black text-white tracking-[0.3em] uppercase font-serif mb-2"
          >
            Crit 2048
          </motion.h1>
          <div className="w-48 h-1 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
            <motion.div 
              className="h-full bg-rose-600"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ type: 'spring', damping: 20, stiffness: 100 }}
            ></motion.div>
          </div>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-4 font-bold animate-pulse">
            Communing with the Vestige...
          </p>
        </div>
      </div>

      {/* Decorative corners */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="absolute top-8 left-8 w-12 h-12 border-t-2 border-l-2 border-rose-900/30"
      ></motion.div>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="absolute top-8 right-8 w-12 h-12 border-t-2 border-r-2 border-rose-900/30"
      ></motion.div>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="absolute bottom-8 left-8 w-12 h-12 border-b-2 border-l-2 border-rose-900/30"
      ></motion.div>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="absolute bottom-8 right-8 w-12 h-12 border-b-2 border-r-2 border-rose-900/30"
      ></motion.div>
    </motion.div>
  );
};

export default Preloader;
