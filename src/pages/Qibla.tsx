import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Navigation, RotateCcw, Info } from 'lucide-react';
import Header from '@/components/layout/Header';

const QIBLA_DIRECTION = 295;
const TOLERANCE = 5;

function normalizeAngle(angle: number): number {
  return ((angle % 360) + 360) % 360;
}

function angleDifference(a: number, b: number): number {
  const diff = normalizeAngle(b - a);
  return diff > 180 ? diff - 360 : diff;
}

const cardinalLabels: { angle: number; label: string; isCardinal: boolean }[] = [
  { angle: 0, label: 'N', isCardinal: true },
  { angle: 45, label: 'NE', isCardinal: false },
  { angle: 90, label: 'E', isCardinal: true },
  { angle: 135, label: 'SE', isCardinal: false },
  { angle: 180, label: 'S', isCardinal: true },
  { angle: 225, label: 'SW', isCardinal: false },
  { angle: 270, label: 'W', isCardinal: true },
  { angle: 315, label: 'NW', isCardinal: false },
];

function CompassSVG() {
  const size = 280;
  const center = size / 2;
  const outerRadius = 130;
  const innerRingRadius = 115;
  const tickOuterRadius = 126;
  const tickInnerMajor = 116;
  const tickInnerMinor = 120;
  const labelRadius = 104;

  const qiblaAngleOnCompass = QIBLA_DIRECTION;

  const qiblaRadians = ((qiblaAngleOnCompass - 90) * Math.PI) / 180;
  const kaabahX = center + (outerRadius + 6) * Math.cos(qiblaRadians);
  const kaabahY = center + (outerRadius + 6) * Math.sin(qiblaRadians);

  const needleLength = 85;
  const needleRadians = ((qiblaAngleOnCompass - 90) * Math.PI) / 180;
  const tipX = center + needleLength * Math.cos(needleRadians);
  const tipY = center + needleLength * Math.sin(needleRadians);
  const baseLeft = ((qiblaAngleOnCompass - 90 + 150) * Math.PI) / 180;
  const baseRight = ((qiblaAngleOnCompass - 90 - 150) * Math.PI) / 180;
  const baseLen = 10;
  const bLeftX = center + baseLen * Math.cos(baseLeft);
  const bLeftY = center + baseLen * Math.sin(baseLeft);
  const bRightX = center + baseLen * Math.cos(baseRight);
  const bRightY = center + baseLen * Math.sin(baseRight);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <defs>
        <radialGradient id="compassBg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.95)" />
          <stop offset="100%" stopColor="rgba(240,250,246,0.9)" />
        </radialGradient>
        <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#0F7D5F" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#0F7D5F" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="needleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0F7D5F" />
          <stop offset="100%" stopColor="#0A5C45" />
        </linearGradient>
        <filter id="needleShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#0F7D5F" floodOpacity="0.3" />
        </filter>
        <filter id="outerGlow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#0F7D5F" floodOpacity="0.15" />
        </filter>
      </defs>

      {/* Background circle */}
      <circle cx={center} cy={center} r={outerRadius} fill="url(#compassBg)" filter="url(#outerGlow)" />

      {/* Outer ring */}
      <circle cx={center} cy={center} r={outerRadius} fill="none" stroke="#0F7D5F" strokeWidth="2.5" strokeOpacity="0.3" />

      {/* Inner decorative ring */}
      <circle cx={center} cy={center} r={innerRingRadius} fill="none" stroke="#0F7D5F" strokeWidth="1" strokeOpacity="0.15" />

      {/* Second inner ring */}
      <circle cx={center} cy={center} r={innerRingRadius - 24} fill="none" stroke="#D4A853" strokeWidth="0.5" strokeOpacity="0.3" />

      {/* Decorative arcs */}
      {[0, 90, 180, 270].map((angle) => {
        const startAngle = ((angle - 20 - 90) * Math.PI) / 180;
        const endAngle = ((angle + 20 - 90) * Math.PI) / 180;
        const r = innerRingRadius - 12;
        const x1 = center + r * Math.cos(startAngle);
        const y1 = center + r * Math.sin(startAngle);
        const x2 = center + r * Math.cos(endAngle);
        const y2 = center + r * Math.sin(endAngle);
        return (
          <path
            key={angle}
            d={`M ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2}`}
            fill="none"
            stroke="#D4A853"
            strokeWidth="1"
            strokeOpacity="0.25"
          />
        );
      })}

      {/* Tick marks */}
      {Array.from({ length: 72 }, (_, i) => {
        const angle = i * 5;
        const radians = ((angle - 90) * Math.PI) / 180;
        const isMajor = angle % 30 === 0;
        const isMedium = angle % 15 === 0;
        const inner = isMajor ? tickInnerMajor : isMedium ? tickInnerMinor - 2 : tickInnerMinor;
        const x1 = center + inner * Math.cos(radians);
        const y1 = center + inner * Math.sin(radians);
        const x2 = center + tickOuterRadius * Math.cos(radians);
        const y2 = center + tickOuterRadius * Math.sin(radians);
        return (
          <line
            key={`tick-${i}`}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={isMajor ? '#0F7D5F' : '#94A39B'}
            strokeWidth={isMajor ? 2 : isMedium ? 1.2 : 0.6}
            strokeOpacity={isMajor ? 0.8 : isMedium ? 0.5 : 0.3}
          />
        );
      })}

      {/* Cardinal direction labels */}
      {cardinalLabels.map(({ angle, label, isCardinal }) => {
        const radians = ((angle - 90) * Math.PI) / 180;
        const x = center + labelRadius * Math.cos(radians);
        const y = center + labelRadius * Math.sin(radians);
        return (
          <text
            key={label}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={isCardinal ? 14 : 10}
            fontWeight={isCardinal ? 700 : 500}
            fontFamily="'Outfit', sans-serif"
            fill={isCardinal ? '#0F7D5F' : '#94A39B'}
          >
            {label}
          </text>
        );
      })}

      {/* Center glow */}
      <circle cx={center} cy={center} r={20} fill="url(#centerGlow)" />

      {/* Qibla needle */}
      <polygon
        points={`${tipX},${tipY} ${bLeftX},${bLeftY} ${center},${center} ${bRightX},${bRightY}`}
        fill="url(#needleGrad)"
        fillOpacity="0.85"
        filter="url(#needleShadow)"
      />

      {/* Needle tail (opposite side, lighter) */}
      <polygon
        points={`${center + 30 * Math.cos(needleRadians + Math.PI)},${center + 30 * Math.sin(needleRadians + Math.PI)} ${bLeftX},${bLeftY} ${center},${center} ${bRightX},${bRightY}`}
        fill="#94A39B"
        fillOpacity="0.25"
      />

      {/* Center dot */}
      <circle cx={center} cy={center} r={5} fill="#0F7D5F" />
      <circle cx={center} cy={center} r={2.5} fill="white" />

      {/* Ka'bah emoji at Qibla direction */}
      <text
        x={kaabahX}
        y={kaabahY}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={20}
        style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))' }}
      >
        🕋
      </text>

      {/* Small N indicator arrow at top — red accent for north */}
      <polygon
        points={`${center},${center - outerRadius + 14} ${center - 4},${center - outerRadius + 22} ${center + 4},${center - outerRadius + 22}`}
        fill="#E74C3C"
        fillOpacity="0.9"
      />

      {/* Heading indicator at top of bezel */}
      <polygon
        points={`${center},${center - outerRadius - 6} ${center - 6},${center - outerRadius - 14} ${center + 6},${center - outerRadius - 14}`}
        fill="#0F7D5F"
        fillOpacity="0.6"
      />
    </svg>
  );
}

export default function Qibla() {
  const [heading, setHeading] = useState(0);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  const diff = angleDifference(heading, QIBLA_DIRECTION);
  const isAligned = Math.abs(diff) <= TOLERANCE;

  const startCompass = useCallback(async () => {
    try {
      // For iOS 13+
      if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
        const permission = await (DeviceOrientationEvent as any).requestPermission();
        if (permission === 'granted') {
          setHasPermission(true);
        } else {
          setHasPermission(false);
          alert('Izin sensor ditolak. Tidak dapat menggunakan kompas perangkat.');
          return;
        }
      } else {
        // Non iOS 13+ devices
        setHasPermission(true);
      }
    } catch (err) {
      console.error(err);
      setHasPermission(true); // Fallback for environments where requestPermission throws
    }
  }, []);

  useEffect(() => {
    if (hasPermission === true) {
      const handleOrientation = (e: any) => {
        let newHeading = 0;
        if (e.webkitCompassHeading !== undefined) {
          // iOS
          newHeading = e.webkitCompassHeading;
        } else if (e.alpha !== null) {
          // Android
          newHeading = 360 - e.alpha;
        }
        setHeading((prev) => {
          let diff = newHeading - (prev % 360);
          if (diff < -180) diff += 360;
          if (diff > 180) diff -= 360;
          return prev + diff;
        });
      };

      window.addEventListener('deviceorientationabsolute', handleOrientation);
      window.addEventListener('deviceorientation', handleOrientation);

      return () => {
        window.removeEventListener('deviceorientationabsolute', handleOrientation);
        window.removeEventListener('deviceorientation', handleOrientation);
      };
    }
  }, [hasPermission]);
  return (
    <div className="min-h-screen bg-bg-primary">
      <Header showBack={true} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mx-auto max-w-lg px-4 pb-28 pt-4"
      >
        {/* Instruction text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-6 flex items-center gap-2 rounded-lg bg-primary-50 px-4 py-3"
        >
          <Info size={16} className="shrink-0 text-primary" />
          <p className="text-xs text-text-secondary">
            {hasPermission === true
              ? 'Putar perangkat Anda untuk menyesuaikan arah jarum ke logo Ka\'bah.'
              : 'Aktifkan kompas untuk mulai mendeteksi arah kiblat.'}
          </p>
        </motion.div>

        {/* Compass card */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.15, type: 'spring', stiffness: 200, damping: 20 }}
          className="relative mx-auto mb-6 w-fit rounded-2xl bg-bg-card p-6 shadow-xl pattern-overlay"
        >
          {/* Glass overlay effect */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/60 via-transparent to-primary-50/30 pointer-events-none" />

          {/* Compass */}
          <div className="relative flex items-center justify-center">
            <motion.div
              animate={{ rotate: -heading }}
              transition={{
                type: 'spring',
                stiffness: 80,
                damping: 20,
                mass: 1.2,
              }}
              className="relative"
            >
              <CompassSVG />
            </motion.div>

            {/* Fixed heading indicator at top */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1">
              <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[10px] border-t-primary" />
            </div>
          </div>

          {/* Current heading */}
          <div className="relative mt-4 text-center">
            <p className="font-heading text-3xl font-bold text-text-primary">
              {Math.round(((heading % 360) + 360) % 360)}°
            </p>
            <p className="mt-0.5 text-xs text-text-muted">Heading Saat Ini</p>
          </div>
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6 flex items-center justify-center"
        >
          {hasPermission !== true && (
            <button
              onClick={startCompass}
              className="pressable flex items-center gap-2 rounded-xl bg-primary px-6 py-3.5 font-heading text-sm font-bold text-white shadow-lg"
            >
              <Navigation size={18} />
              Mulai Kompas
            </button>
          )}
          {hasPermission === true && (
            <button
              onClick={() => setHeading(0)}
              className="pressable mt-4 flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-medium text-text-primary shadow-sm"
            >
              <RotateCcw size={16} className="text-text-muted" />
              Kalibrasi Ulang
            </button>
          )}
        </motion.div>



        {/* Status indicator */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className={`mb-4 rounded-xl p-4 text-center transition-colors duration-300 ${
            isAligned
              ? 'bg-gradient-to-r from-success/10 via-success/5 to-success/10 border border-success/20'
              : 'bg-bg-card shadow-md'
          }`}
        >
          {isAligned ? (
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="flex flex-col items-center gap-2"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/15">
                <Check size={22} className="text-success" strokeWidth={3} />
              </div>
              <p className="font-heading text-base font-semibold text-success">
                Anda menghadap Kiblat
              </p>
              <p className="text-xs text-success/70">Masya Allah, arah Anda sudah tepat!</p>
            </motion.div>
          ) : (
            <div className="flex flex-col items-center gap-1.5">
              <p className="text-sm text-text-secondary">
                {diff > 0 ? 'Putar ke kanan' : 'Putar ke kiri'}{' '}
                <span className="font-heading font-bold text-primary">
                  {Math.abs(Math.round(diff))}°
                </span>
              </p>
              <p className="text-xs text-text-muted">untuk menghadap Kiblat</p>
            </div>
          )}
        </motion.div>

        {/* Qibla direction info card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-xl bg-bg-card p-4 shadow-md"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-dark">
                <span className="text-lg">🕋</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-text-primary">Arah Kiblat</p>
                <p className="text-xs text-text-muted">Makkah Al-Mukarramah</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-heading text-xl font-bold text-primary">{QIBLA_DIRECTION}°</p>
              <p className="text-[10px] text-text-muted">dari Utara</p>
            </div>
          </div>

          {/* Decorative separator */}
          <div className="my-3 h-px bg-gradient-to-r from-transparent via-primary/10 to-transparent" />

          <div className="flex items-center justify-between text-xs text-text-muted">
            <span>Heading saat ini</span>
            <span className="font-heading font-semibold text-text-secondary">{Math.round(heading)}°</span>
          </div>
          <div className="mt-1.5 flex items-center justify-between text-xs text-text-muted">
            <span>Selisih</span>
            <span
              className={`font-heading font-semibold ${
                isAligned ? 'text-success' : 'text-text-secondary'
              }`}
            >
              {isAligned ? '0°' : `${Math.abs(Math.round(diff))}° ${diff > 0 ? '→' : '←'}`}
            </span>
          </div>
        </motion.div>

        {/* Bottom decorative element */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-6 text-center"
        >
          <p className="arabic-text text-xl text-primary/80" dir="rtl">فَوَلِّ وَجْهَكَ شَطْرَ الْمَسْجِدِ الْحَرَامِ</p>
          <p className="mt-2 text-xs text-text-muted px-4">
            &ldquo;Maka hadapkanlah wajahmu ke arah Masjidil Haram&rdquo; — QS. Al-Baqarah: 144
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
