
'use client';

import { useState, useEffect } from 'react';

const getIsMobile = () => {
  if (typeof window === 'undefined') {
    return false;
  }
  return window.innerWidth < 768; // Corresponds to md breakpoint in Tailwind
};

export function useMediaQuery() {
  const [isMobile, setIsMobile] = useState(getIsMobile());

  useEffect(() => {
    // Set initial value after mount to avoid hydration mismatch
    setIsMobile(getIsMobile());

    const handleResize = () => {
      setIsMobile(getIsMobile());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return { isMobile };
}
