import React, { useEffect, useState } from 'react';

const BrowserWarning: React.FC = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // 1. Don't show if already in standalone mode (PWA/TWA) or Electron
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
    const isElectron = /Electron/i.test(navigator.userAgent);
    
    if (isStandalone || isElectron) return;

    // 2. Check if it's NOT Chromium-based
    // Note: This is a simple check. Chrome, Edge, Opera, Brave are all Chromium.
    const isChromium = /Chrome|CriOS|Edg|OPR/i.test(navigator.userAgent) && !/Firefox|Safari/i.test(navigator.userAgent);
    const isIOS = /iPad|iPhone|iPod/.test(navigator.platform) || (navigator.userAgent.includes("Mac") && "ontouchend" in document);
    
    // Specifically target Firefox or Safari users on Web (unless on iOS where Safari is required)
    if (!isChromium && !isIOS) {
      // Check if they've already dismissed it this session
      const dismissed = sessionStorage.getItem('browser-warning-dismissed');
      if (!dismissed) {
        setShow(true);
      }
    }
  }, []);

  if (!show) return null;

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[200] w-[90%] max-w-md animate-tile-pop">
      <div className="bg-amber-900/90 border border-amber-500/50 backdrop-blur-xl p-4 rounded-2xl shadow-2xl flex items-center gap-4">
        <span className="text-3xl shrink-0">🌐</span>
        <div className="flex-grow">
          <h4 className="text-amber-200 font-black text-xs uppercase tracking-widest">Browser Optimization</h4>
          <p className="text-amber-100/80 text-[10px] leading-relaxed mt-1">
            For the best visual effects and performance, we recommend using <strong className="text-white">Google Chrome</strong> or a Chromium-based browser.
          </p>
        </div>
        <button 
          onClick={() => {
            setShow(false);
            sessionStorage.setItem('browser-warning-dismissed', 'true');
          }}
          className="bg-amber-500/20 hover:bg-amber-500/40 text-amber-200 w-8 h-8 rounded-lg flex items-center justify-center transition-colors border border-amber-500/30 active:scale-95"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default BrowserWarning;
