
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import { Heart } from 'lucide-react';
import { isSameDay, parseISO, getMonth, getDate } from 'date-fns';
import { useAuth } from '@/contexts/auth-context';
import { getDatabase, ref, onValue } from 'firebase/database';
import { app as firebaseApp } from '@/lib/firebase';


type SpecialDateType = 'anniversary' | 'birthday' | null;

const HeartComponent = ({ id, left }: { id: number; left: number }) => {
  const duration = Math.random() * 5 + 5; // 5 to 10 seconds
  const delay = Math.random() * 5;
  const size = Math.random() * 20 + 20; // 20 to 40px

  return (
    <motion.div
      key={id}
      initial={{ top: '110%', opacity: 1 }}
      animate={{ top: '-10%', opacity: 0 }}
      transition={{ duration, delay, ease: 'linear' }}
      style={{
        position: 'fixed',
        left: `${left}%`,
        zIndex: 9999,
      }}
    >
      <Heart
        className="text-primary"
        style={{ width: size, height: size }}
        fill="currentColor"
      />
    </motion.div>
  );
};

export function SpecialDayAnimation() {
  const { user } = useAuth();
  const [specialDateType, setSpecialDateType] = useState<SpecialDateType>(null);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!user) return;

    const db = getDatabase(firebaseApp);
    const profileRef = ref(db, `users/${user.uid}/profile`);

    const unsubscribe = onValue(profileRef, (snapshot) => {
        const profileData = snapshot.val();
        if (!profileData) return;

        const today = new Date();
        const { sinceDate, birthday1, birthday2 } = profileData;

        let type: SpecialDateType = null;
        const todayMonth = getMonth(today);
        const todayDay = getDate(today);

        if (sinceDate) {
          const anniversaryDate = parseISO(sinceDate);
          if (getMonth(anniversaryDate) === todayMonth && getDate(anniversaryDate) === todayDay) {
            type = 'anniversary';
          }
        }

        if (!type && birthday1) {
          const b1 = parseISO(birthday1);
          if (getMonth(b1) === todayMonth && getDate(b1) === todayDay) {
            type = 'birthday';
          }
        }

        if (!type && birthday2) {
          const b2 = parseISO(birthday2);
          if (getMonth(b2) === todayMonth && getDate(b2) === todayDay) {
            type = 'birthday';
          }
        }

        if (type) {
          const lastCheck = localStorage.getItem('special-day-check');
          const todayStr = today.toISOString().split('T')[0];

          if (lastCheck !== todayStr) {
            setSpecialDateType(type);
            setShowAnimation(true);
            localStorage.setItem('special-day-check', todayStr);
            setTimeout(() => setShowAnimation(false), 8000);
          }
        }
    });

    return () => unsubscribe();
  }, [user]);

  const renderAnimation = () => {
    if (!showAnimation) return null;

    if (specialDateType === 'birthday') {
      return (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={400}
          gravity={0.1}
          onConfettiComplete={() => setShowAnimation(false)}
          style={{ zIndex: 9999 }}
        />
      );
    }

    if (specialDateType === 'anniversary') {
      return (
        <div className="pointer-events-none fixed inset-0 overflow-hidden z-[9999]">
          {Array.from({ length: 30 }).map((_, i) => (
            <HeartComponent key={i} id={i} left={Math.random() * 100} />
          ))}
        </div>
      );
    }

    return null;
  };

  return <AnimatePresence>{renderAnimation()}</AnimatePresence>;
}
