
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from '@/contexts/auth-context';
import { getDatabase, ref, onValue } from 'firebase/database';
import { app as firebaseApp } from '@/lib/firebase';
import { getCurrentWeather } from '@/ai/tools/weather-tools';
import { Loader2, Sun, Cloud, CloudRain, Snowflake, Zap, CloudFog } from 'lucide-react';
import Image from 'next/image';

const weatherIconMap: { [key: string]: React.ReactNode } = {
    '01d': <Sun className="h-8 w-8 text-yellow-400" />,
    '01n': <Sun className="h-8 w-8 text-yellow-400" />, // Using Sun for clear night for simplicity
    '02d': <Cloud className="h-8 w-8 text-gray-400" />,
    '02n': <Cloud className="h-8 w-8 text-gray-400" />,
    '03d': <Cloud className="h-8 w-8 text-gray-400" />,
    '03n': <Cloud className="h-8 w-8 text-gray-400" />,
    '04d': <Cloud className="h-8 w-8 text-gray-400" />,
    '04n': <Cloud className="h-8 w-8 text-gray-400" />,
    '09d': <CloudRain className="h-8 w-8 text-blue-400" />,
    '09n': <CloudRain className="h-8 w-8 text-blue-400" />,
    '10d': <CloudRain className="h-8 w-8 text-blue-400" />,
    '10n': <CloudRain className="h-8 w-8 text-blue-400" />,
    '11d': <Zap className="h-8 w-8 text-yellow-500" />,
    '11n': <Zap className="h-8 w-8 text-yellow-500" />,
    '13d': <Snowflake className="h-8 w-8 text-blue-200" />,
    '13n': <Snowflake className="h-8 w-8 text-blue-200" />,
    '50d': <CloudFog className="h-8 w-8 text-gray-500" />,
    '50n': <CloudFog className="h-8 w-8 text-gray-500" />,
  };


export function WeatherOverview() {
  const { user } = useAuth();
  const [weather, setWeather] = useState<{ temperature: number; condition: string; icon: string; } | null>(null);
  const [location, setLocation] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const db = getDatabase(firebaseApp);
      const locationRef = ref(db, `users/${user.uid}/profile/location`);
      const unsubscribe = onValue(locationRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setLocation(data);
        } else {
            setLoading(false);
        }
      });
      return () => unsubscribe();
    }
  }, [user]);

  useEffect(() => {
    if (location) {
      setLoading(true);
      getCurrentWeather({ city: location })
        .then(setWeather)
        .finally(() => setLoading(false));
    }
  }, [location]);

  return (
    <Card className="bg-white/10 dark:bg-black/10 border-none shadow-none text-center p-6">
      {loading && <Loader2 className="h-6 w-6 animate-spin mx-auto" />}
      {!loading && !location && (
        <p className="text-sm text-muted-foreground">Adicione sua cidade no perfil para ver o clima.</p>
      )}
      {!loading && weather && location && (
        <div className="flex items-center justify-center gap-4">
          <div className="text-5xl font-bold text-foreground">
            {weather.temperature}°
          </div>
          <div className="flex flex-col items-start">
            <p className="font-semibold capitalize">{weather.condition}</p>
            <p className="text-sm text-muted-foreground">{location.split(',')[0]}</p>
          </div>
          <div>
            {weather.icon && (
                <Image 
                    src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
                    alt={weather.condition}
                    width={64}
                    height={64}
                />
            )}
          </div>
        </div>
      )}
    </Card>
  );
}
