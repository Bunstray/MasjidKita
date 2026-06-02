import { useState, useEffect } from 'react';
import { prayerSchedule as fallbackSchedule } from '@/data/mockData';

interface PrayerTimeInfo {
  currentPrayer: string;
  nextPrayer: string;
  nextPrayerTime: string;
  nextPrayerIndex: number;
  timeRemaining: { hours: number; minutes: number; seconds: number };
  isPast: (index: number) => boolean;
  schedule: typeof fallbackSchedule;
  loading: boolean;
}

const PRAYER_NAMES: Record<string, { name: string; nameAr: string; icon: string }> = {
  Fajr: { name: 'Subuh', nameAr: 'الفجر', icon: 'sunrise' },
  Dhuhr: { name: 'Dzuhur', nameAr: 'الظهر', icon: 'sun' },
  Asr: { name: 'Ashar', nameAr: 'العصر', icon: 'sunset' },
  Maghrib: { name: 'Maghrib', nameAr: 'المغرب', icon: 'moon' },
  Isha: { name: 'Isya', nameAr: 'العشاء', icon: 'star' },
};

export function usePrayerTimes(): PrayerTimeInfo {
  const [now, setNow] = useState(new Date());
  const [schedule, setSchedule] = useState(fallbackSchedule);
  const [loading, setLoading] = useState(true);

  // Update time every second
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch daily prayer times
  useEffect(() => {
    const fetchPrayerTimes = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        const cacheKey = `prayer_times_sleman_${today}`;
        const cached = localStorage.getItem(cacheKey);

        if (cached) {
          setSchedule(JSON.parse(cached));
          setLoading(false);
          return;
        }

        const res = await fetch(
          'https://api.aladhan.com/v1/timingsByCity?city=Sleman&country=Indonesia&method=20'
        );
        if (res.ok) {
          const data = await res.json();
          const timings = data.data.timings;
          const hijri = data.data.date.hijri;

          const prayers = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].map((key) => ({
            name: PRAYER_NAMES[key].name,
            nameAr: PRAYER_NAMES[key].nameAr,
            time: timings[key],
            icon: PRAYER_NAMES[key].icon,
          }));

          const newSchedule = {
            date: new Date().toLocaleDateString('id-ID', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            }),
            hijriDate: `${hijri.day} ${hijri.month.en} ${hijri.year} H`,
            location: 'Sleman',
            prayers,
          };

          localStorage.setItem(cacheKey, JSON.stringify(newSchedule));
          setSchedule(newSchedule);
        }
      } catch (err) {
        console.error('Failed to fetch prayer times', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPrayerTimes();
  }, []);

  const prayers = schedule.prayers;

  const getMinutes = (time: string) => {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  };

  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  let nextPrayerIndex = prayers.findIndex((p) => getMinutes(p.time) > currentMinutes);

  if (nextPrayerIndex === -1) nextPrayerIndex = 0;

  const currentPrayerIndex =
    nextPrayerIndex === 0 ? prayers.length - 1 : nextPrayerIndex - 1;

  const nextPrayerTime = prayers[nextPrayerIndex].time;
  const [nh, nm] = nextPrayerTime.split(':').map(Number);

  let diffSeconds: number;
  if (
    nextPrayerIndex === 0 &&
    currentMinutes >= getMinutes(prayers[prayers.length - 1].time)
  ) {
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
    if (
      nextPrayerIndex === 0 &&
      currentMinutes >= getMinutes(prayers[prayers.length - 1].time)
    ) {
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
    schedule,
    loading,
  };
}
