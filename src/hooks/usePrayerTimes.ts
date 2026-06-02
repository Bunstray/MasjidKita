import { useState, useEffect } from 'react';
import { prayerSchedule } from '@/data/mockData';

interface PrayerTimeInfo {
  currentPrayer: string;
  nextPrayer: string;
  nextPrayerTime: string;
  nextPrayerIndex: number;
  timeRemaining: { hours: number; minutes: number; seconds: number };
  isPast: (index: number) => boolean;
}

export function usePrayerTimes(): PrayerTimeInfo {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const prayers = prayerSchedule.prayers;

  const getMinutes = (time: string) => {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  };

  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  let nextPrayerIndex = prayers.findIndex(
    (p) => getMinutes(p.time) > currentMinutes
  );

  if (nextPrayerIndex === -1) nextPrayerIndex = 0;

  const currentPrayerIndex = nextPrayerIndex === 0 ? prayers.length - 1 : nextPrayerIndex - 1;

  const nextPrayerTime = prayers[nextPrayerIndex].time;
  const [nh, nm] = nextPrayerTime.split(':').map(Number);

  let diffSeconds: number;
  if (nextPrayerIndex === 0 && currentMinutes >= getMinutes(prayers[prayers.length - 1].time)) {
    // After Isha, counting to next Fajr
    const targetDate = new Date(now);
    targetDate.setDate(targetDate.getDate() + 1);
    targetDate.setHours(nh, nm, 0, 0);
    diffSeconds = Math.max(0, Math.floor((targetDate.getTime() - now.getTime()) / 1000));
  } else {
    const targetDate = new Date(now);
    targetDate.setHours(nh, nm, 0, 0);
    diffSeconds = Math.max(0, Math.floor((targetDate.getTime() - now.getTime()) / 1000));
  }

  const hours = Math.floor(diffSeconds / 3600);
  const minutes = Math.floor((diffSeconds % 3600) / 60);
  const seconds = diffSeconds % 60;

  const isPast = (index: number) => {
    if (nextPrayerIndex === 0 && currentMinutes >= getMinutes(prayers[prayers.length - 1].time)) {
      return true; // All past after Isha
    }
    return index < nextPrayerIndex;
  };

  return {
    currentPrayer: prayers[currentPrayerIndex].name,
    nextPrayer: prayers[nextPrayerIndex].name,
    nextPrayerTime: prayers[nextPrayerIndex].time,
    nextPrayerIndex,
    timeRemaining: { hours, minutes, seconds },
    isPast,
  };
}
