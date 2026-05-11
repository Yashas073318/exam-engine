import { useState, useEffect, useRef } from 'react';

/**
 * useTimer — countdown timer for active exams.
 *
 * Features:
 *  - Persists remaining seconds in sessionStorage (survives accidental refresh).
 *  - Calls onExpire() when time hits zero (triggers auto-submit).
 *  - Returns { timeLeft, formatted, isRunning, stop }.
 *
 * @param {number}   totalSeconds  - Total exam duration in seconds.
 * @param {string}   storageKey    - Unique key per exam attempt (e.g. examId).
 * @param {Function} onExpire      - Called when the timer reaches 0.
 */
const useTimer = (totalSeconds, storageKey, onExpire) => {
  const [timeLeft, setTimeLeft] = useState(() => {
    const saved = sessionStorage.getItem(storageKey);
    return saved ? parseInt(saved, 10) : totalSeconds;
  });

  const [isRunning, setIsRunning] = useState(true);
  const onExpireRef = useRef(onExpire);

  // Keep ref up-to-date without restarting the effect
  useEffect(() => { onExpireRef.current = onExpire; }, [onExpire]);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        const next = prev - 1;
        sessionStorage.setItem(storageKey, next);

        if (next <= 0) {
          clearInterval(interval);
          sessionStorage.removeItem(storageKey);
          setIsRunning(false);
          onExpireRef.current?.();
          return 0;
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, storageKey]);

  const stop = () => {
    setIsRunning(false);
    sessionStorage.removeItem(storageKey);
  };

  // Format as MM:SS
  const minutes = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  const seconds = String(timeLeft % 60).padStart(2, '0');
  const formatted = `${minutes}:${seconds}`;

  // Warning thresholds
  const isWarning  = timeLeft <= 120 && timeLeft > 30;  // last 2 minutes
  const isDanger   = timeLeft <= 30;                     // last 30 seconds

  return { timeLeft, formatted, isRunning, isWarning, isDanger, stop };
};

export default useTimer;
