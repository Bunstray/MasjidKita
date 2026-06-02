import { motion } from 'framer-motion';
import {
  MapPin,
  Sunrise,
  Sun,
  Sunset,
  Moon,
  Star,
  Check,
} from 'lucide-react';
import Header from '@/components/layout/Header';
import { usePrayerTimes } from '@/hooks/usePrayerTimes';
import { prayerSchedule } from '@/data/mockData';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.15 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const prayerIcons = [Sunrise, Sun, Sunset, Moon, Star];

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

export default function PrayerTimes() {
  const { nextPrayer, nextPrayerTime, nextPrayerIndex, timeRemaining, isPast } =
    usePrayerTimes();

  const gregorianDate = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-bg-primary pb-28">
      <Header />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="mx-auto max-w-lg px-5 pt-4"
      >
        {/* ── Date Card ── */}
        <motion.div
          variants={itemVariants}
          className="rounded-2xl bg-bg-card p-4 shadow-sm"
        >
          <p className="text-sm font-medium text-text-primary">{gregorianDate}</p>
          <p className="mt-0.5 text-xs text-text-muted">{prayerSchedule.hijriDate}</p>
          <div className="mt-2 flex items-center gap-1.5 text-text-secondary">
            <MapPin size={14} className="text-primary" />
            <span className="text-xs font-medium">{prayerSchedule.location}</span>
          </div>
        </motion.div>

        {/* ── Next Prayer Countdown ── */}
        <motion.div
          variants={itemVariants}
          className="mt-4 overflow-hidden rounded-2xl bg-gradient-to-br from-primary-dark via-primary to-primary-400 p-5 shadow-lg"
        >
          <div className="relative z-10">
            <p className="text-xs font-medium uppercase tracking-wider text-white/70">
              Sholat Berikutnya
            </p>

            <div className="mt-2 flex items-end justify-between">
              <div>
                <h2 className="font-heading text-2xl font-bold text-white">
                  {nextPrayer}
                </h2>
                <p className="mt-0.5 text-sm text-white/70">{nextPrayerTime}</p>
              </div>

              <div className="text-right">
                <span className="font-heading text-4xl font-bold tabular-nums text-white">
                  {pad(timeRemaining.hours)}:{pad(timeRemaining.minutes)}
                </span>
                <span className="ml-0.5 font-heading text-xl font-bold tabular-nums text-white/60">
                  :{pad(timeRemaining.seconds)}
                </span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-white/15">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-accent to-white"
                initial={{ width: '0%' }}
                animate={{
                  width: `${Math.min(
                    100,
                    (1 -
                      (timeRemaining.hours * 3600 +
                        timeRemaining.minutes * 60 +
                        timeRemaining.seconds) /
                        (6 * 3600)) *
                      100
                  )}%`,
                }}
                transition={{ duration: 1 }}
              />
            </div>
          </div>

          {/* Background decoration */}
          <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/5" />
          <div className="pointer-events-none absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-white/5" />
        </motion.div>

        {/* ── Prayer Cards List ── */}
        <motion.div variants={itemVariants} className="mt-5 space-y-3">
          {prayerSchedule.prayers.map((prayer, index) => {
            const past = isPast(index);
            const isNext = index === nextPrayerIndex;
            const IconComponent = prayerIcons[index];

            return (
              <motion.div
                key={prayer.name}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 + index * 0.08, duration: 0.4 }}
                className={`relative overflow-hidden rounded-2xl p-4 transition-all ${
                  isNext
                    ? 'animate-pulse-glow border-2 border-accent bg-bg-card shadow-lg'
                    : past
                    ? 'border border-transparent bg-bg-elevated/60'
                    : 'border border-transparent bg-bg-card shadow-sm'
                }`}
              >
                {/* Accent left border for next prayer */}
                {isNext && (
                  <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-accent to-primary" />
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3.5">
                    {/* Icon circle */}
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                        isNext
                          ? 'bg-primary/10'
                          : past
                          ? 'bg-bg-elevated'
                          : 'bg-primary-50'
                      }`}
                    >
                      <IconComponent
                        size={20}
                        className={
                          isNext
                            ? 'text-primary'
                            : past
                            ? 'text-text-muted'
                            : 'text-primary-400'
                        }
                      />
                    </div>

                    {/* Name + Arabic */}
                    <div>
                      <h4
                        className={`font-heading text-base font-semibold ${
                          past ? 'text-text-muted' : 'text-text-primary'
                        }`}
                      >
                        {prayer.name}
                      </h4>
                      <p
                        className={`arabic-text mt-px text-sm ${
                          past ? 'text-text-muted/60' : 'text-text-secondary'
                        }`}
                        style={{ direction: 'rtl', textAlign: 'left' }}
                      >
                        {prayer.nameAr}
                      </p>
                    </div>
                  </div>

                  {/* Time + Status */}
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`font-heading text-lg font-bold tabular-nums ${
                        isNext
                          ? 'text-primary'
                          : past
                          ? 'text-text-muted'
                          : 'text-text-primary'
                      }`}
                    >
                      {prayer.time}
                    </span>

                    {past && (
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-100">
                        <Check size={13} className="text-primary" />
                      </div>
                    )}

                    {isNext && (
                      <div className="relative flex h-6 w-6 items-center justify-center">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/20" />
                        <span className="relative inline-flex h-3 w-3 rounded-full bg-primary" />
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* ── Footer note ── */}
        <motion.p
          variants={itemVariants}
          className="mt-5 text-center text-[11px] text-text-muted"
        >
          Waktu sholat berdasarkan lokasi {prayerSchedule.location}
        </motion.p>
      </motion.div>
    </div>
  );
}
