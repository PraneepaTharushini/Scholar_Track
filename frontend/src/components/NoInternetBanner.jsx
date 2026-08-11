import React, { useState, useEffect, useCallback, useRef } from 'react';

const AUTO_RETRY_SECONDS = 5;

export default function NoInternetBanner() {
  const [phase, setPhase] = useState(!navigator.onLine ? 'offline' : 'hidden');
  const [spinning, setSpinning] = useState(false);
  const countRef = useRef(null);
  const closeTimer = useRef(null);

  const handleRestored = useCallback(() => {
    clearInterval(countRef.current);
    clearTimeout(closeTimer.current);
    setPhase('restored');                     // show green tick briefly
    closeTimer.current = setTimeout(() => {
      setPhase('closing');                    // trigger slide-up CSS class
      closeTimer.current = setTimeout(() => setPhase('hidden'), 420);
    }, 1600);                                 // show "Back Online!" for 1.6 s
  }, []);

  useEffect(() => {
    const goOffline = () => {
      clearTimeout(closeTimer.current);
      setPhase('offline');
    };
    const goOnline = () => handleRestored();
    window.addEventListener('offline', goOffline);
    window.addEventListener('online', goOnline);
    return () => {
      window.removeEventListener('offline', goOffline);
      window.removeEventListener('online', goOnline);
      clearInterval(countRef.current);
      clearTimeout(closeTimer.current);
    };
  }, [handleRestored]);

  const startCountdown = useCallback((retryFn) => {
    clearInterval(countRef.current);
    countRef.current = setInterval(() => {
      setPhase(prev => {
        if (prev !== 'offline') { clearInterval(countRef.current); return prev; }
        return prev; // keep phase; just trigger retry externally
      });
    }, AUTO_RETRY_SECONDS * 1000);
    // simpler: just schedule one-shot
    countRef.current = setTimeout(retryFn, AUTO_RETRY_SECONDS * 1000);
  }, []);

  const doRetry = useCallback(() => {
    setSpinning(true);
    fetch('https://www.google.com/favicon.ico', { mode: 'no-cors', cache: 'no-store' })
      .then(() => handleRestored())
      .catch(() => startCountdown(doRetry))
      .finally(() => setTimeout(() => setSpinning(false), 900));
  }, [handleRestored, startCountdown]);

  useEffect(() => {
    if (phase === 'offline') {
      startCountdown(doRetry);
    } else {
      clearTimeout(countRef.current);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const handleRetry = () => {
    if (spinning || phase !== 'offline') return;
    clearTimeout(countRef.current);
    doRetry();
  };

  if (phase === 'hidden') return null;

  const isOffline = phase === 'offline';
  const isRestored = phase === 'restored';
  const isClosing = phase === 'closing';
  const showGreen = isRestored || isClosing;  // keep green during slide-out

  const rootClass = "nib-root " + (
    isClosing ? "nib-root--out nib-root--ok" :   // slide out as green pill
      isRestored ? "nib-root--in  nib-root--ok" :
        isOffline ? "nib-root--in" : "nib-root--out"
  );
  const btnClass = "nib-btn" + (spinning ? " nib-btn--busy" : "");
  const svgClass = "nib-refresh-svg" + (spinning ? " nib-spin" : "");

  return (
    <div className={rootClass} role="alert" aria-live="assertive" aria-atomic="true">
      <div className="nib-glow" aria-hidden="true" />

      {showGreen ? (
        <>
          <div className="nib-icon-wrap nib-icon-wrap--ok" aria-hidden="true">
            <CheckIcon />
          </div>
          <div className="nib-body">
            <p className="nib-title nib-title--ok">Back Online!</p>
          </div>
        </>
      ) : (
        <>
          <div className="nib-icon-wrap" aria-hidden="true">
            <WifiOffIcon />
            <div className="nib-pulse-ring nib-pulse-ring--1" />
            <div className="nib-pulse-ring nib-pulse-ring--2" />
          </div>
          <div className="nib-body">
            <p className="nib-title">No Internet Connection</p>
          </div>
          <button
            id="nib-retry-btn"
            className={btnClass}
            onClick={handleRetry}
            disabled={spinning}
            aria-label="Retry connection"
          >
            <RefreshIcon svgClass={svgClass} />
            <span>{spinning ? 'Checking\u2026' : 'Try Again'}</span>
          </button>
        </>
      )}
    </div>
  );
}

function WifiOffIcon() {
  return (
    <svg className="nib-wifi-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path className="nib-arc nib-arc--outer" d="M2 9.5C5.5 5.5 8.5 4 12 4s6.5 1.5 10 5.5"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path className="nib-arc nib-arc--mid" d="M5.5 13C7.5 10.5 9.5 9.5 12 9.5s4.5 1 6.5 3.5"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path className="nib-arc nib-arc--inner" d="M9 16.5C9.9 15.5 10.9 15 12 15s2.1.5 3 1.5"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle className="nib-dot" cx="12" cy="19.5" r="1.3" fill="currentColor" />
      <line className="nib-slash" x1="2.5" y1="2.5" x2="21.5" y2="21.5"
        stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="nib-check-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}


function RefreshIcon({ svgClass }) {
  return (
    <svg className={svgClass} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M4 4v5h5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M20 20v-5h-5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4.07 9A8 8 0 0 1 19.93 15" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M19.93 15A8 8 0 0 1 4.07 9" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}