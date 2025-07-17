
'use client';

import { useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring, animate } from 'framer-motion';

export function Spotlight() {
  const [isMounted, setIsMounted] = useState(false);
  const [spotlightColor, setSpotlightColor] = useState('rgba(128, 0, 128, 0.08)');

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { damping: 25, stiffness: 120 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);
  
  useEffect(() => {
    setIsMounted(true);
    
    const handleMouseMove = (e: MouseEvent) => {
      animate(mouseX, e.clientX);
      animate(mouseY, e.clientY);
    };
    
    const updateColor = () => {
        if (typeof window !== 'undefined') {
            const primaryColorValue = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim();
            // Assuming --primary is in the format "H S% L%" e.g., "258 95% 68%"
            if (primaryColorValue) {
                setSpotlightColor(`hsla(${primaryColorValue}, 0.1)`);
            }
        }
    };

    updateColor();
    window.addEventListener('mousemove', handleMouseMove);
    
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.attributeName === 'style' || mutation.attributeName === 'class') {
                updateColor();
            }
        });
    });
    observer.observe(document.documentElement, { attributes: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      observer.disconnect();
    };
  }, [mouseX, mouseY]);

  if (!isMounted) {
    return null;
  }

  return (
    <motion.div
      className="pointer-events-none fixed inset-0 z-30 transition duration-300"
      style={{
        background: `radial-gradient(600px at ${smoothMouseX.get()}px ${smoothMouseY.get()}px, ${spotlightColor}, transparent 80%)`,
      }}
    ></motion.div>
  );
}
