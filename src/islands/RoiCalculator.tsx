import { useEffect, useRef, useState } from 'react';
import { SITE } from '../data/site';
import './roi-calc.css';

/** Conservative model: only a quarter of missed conversations are
    counted as lost sales (industry data says 75% of people who message
    a business end up buying — from someone). */
const LOST_SALE_RATE = 0.25;

interface Dial {
  key: 'msgs' | 'order' | 'missed';
  label: string;
  sub: string;
  min: number;
  max: number;
  step: number;
  format: (v: number) => string;
}

const DIALS: Dial[] = [
  {
    key: 'msgs',
    label: 'WhatsApp messages / day',
    sub: 'enquiries your business gets',
    min: 5,
    max: 200,
    step: 5,
    format: (v) => `${v}`,
  },
  {
    key: 'order',
    label: 'Average order (TTD)',
    sub: 'what a typical sale is worth',
    min: 50,
    max: 2000,
    step: 25,
    format: (v) => `$${v}`,
  },
  {
    key: 'missed',
    label: 'Missed after hours',
    sub: 'messages nobody answers in time',
    min: 5,
    max: 90,
    step: 5,
    format: (v) => `${v}%`,
  },
];

export default function RoiCalculator() {
  const [values, setValues] = useState({ msgs: 20, order: 300, missed: 40 });
  const [display, setDisplay] = useState(0);
  const raf = useRef<number | null>(null);
  const current = useRef(0);

  const lost = Math.round(
    values.msgs * 30 * (values.missed / 100) * LOST_SALE_RATE * values.order
  );

  const reduceMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    if (reduceMotion) {
      current.current = lost;
      setDisplay(lost);
      return;
    }
    const from = current.current;
    const start = performance.now();
    const dur = 700;
    if (raf.current) cancelAnimationFrame(raf.current);
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - t, 3);
      const v = Math.round(from + (lost - from) * eased);
      current.current = v;
      setDisplay(v);
      if (t < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [lost, reduceMotion]);

  return (
    <div className="roi">
      <div className="roi-dials">
        {DIALS.map((d) => {
          const v = values[d.key];
          const pct = (v - d.min) / (d.max - d.min);
          return (
            <label key={d.key} className="roi-dial">
              {/* steelpan face: conic ring + note-segment ticks */}
              <span
                className="roi-pan"
                style={{ '--pct': pct } as React.CSSProperties}
                aria-hidden="true"
              >
                <span className="roi-pan-ticks" />
                <span className="roi-pan-value mono">{d.format(v)}</span>
              </span>
              <span className="roi-dial-label">{d.label}</span>
              <span className="roi-dial-sub mono">{d.sub}</span>
              <input
                type="range"
                min={d.min}
                max={d.max}
                step={d.step}
                value={v}
                aria-label={d.label}
                onChange={(e) =>
                  setValues((s) => ({ ...s, [d.key]: Number(e.target.value) }))
                }
              />
            </label>
          );
        })}
      </div>

      <div className="roi-result glass-card" aria-live="polite">
        <span className="roi-result-kicker mono">LEFT ON THE TABLE EVERY MONTH</span>
        <span className="roi-result-value">
          TTD ${display.toLocaleString()}
        </span>
        <span className="roi-result-line">
          Relay answers <strong>100%</strong> of them. Instantly. At 11 PM too.
        </span>
        <a
          className="btn btn-primary roi-cta"
          href={SITE.bookingUrl}
        >
          Book a call — let’s go get it
        </a>
        <span className="roi-assumptions mono">
          assumes a 30-day month · counts only {LOST_SALE_RATE * 100}% of missed chats as lost
          sales — the conservative end of conversational-commerce data
        </span>
      </div>
    </div>
  );
}
