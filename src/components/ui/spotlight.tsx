
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export function Spotlight() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [spotlightColor, setSpotlightColor] = useState('rgba(255, 218, 99, 0.05)'); // Default to a soft yellow

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };
    
    // Function to update color from CSS variable
    const updateColor = () => {
        if (typeof window !== 'undefined') {
            const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim();
            if (primaryColor) {
                // Convert HSL string to HSLA for opacity
                setSpotlightColor(`hsla(${primaryColor}, 0.05)`);
            }
        }
    };

    // Initial color set
    updateColor();

    window.addEventListener('mousemove', handleMouseMove);
    
    // Optional: Observe changes to the theme/color
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
  }, []);

  return (
    <motion.div
      className="pointer-events-none fixed inset-0 z-30 transition duration-300"
      style={{
        background: `radial-gradient(600px at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 80%)`,
      }}
    ></motion.div>
  );
}
