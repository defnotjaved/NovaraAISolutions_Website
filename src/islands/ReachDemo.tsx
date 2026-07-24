import { useEffect, useRef, useState } from 'react';
import '../styles/relay-chat.css';
import './reach-demo.css';

type KidStatus = 'expected' | 'boarded' | 'absent' | 'reached';

interface Kid {
  id: string;
  name: string;
  stop: string;
  status: KidStatus;
}

interface ParentMsg {
  id: string;
  text: string;
  time: string;
}

interface PendingTap {
  id: string; // kid id or 'trip'
  label: string;
  fire: () => void;
}

const INITIAL_KIDS: Kid[] = [
  { id: 'k1', name: 'Aiden', stop: 'Curepe Junction', status: 'expected' },
  { id: 'k2', name: 'Maya', stop: 'St. Augustine', status: 'expected' },
  { id: 'k3', name: 'Josiah', stop: 'Tunapuna Market', status: 'expected' },
  { id: 'k4', name: 'Zara', stop: 'Macoya', status: 'expected' },
];

const TIMES = ['7:42 AM', '7:48 AM', '7:55 AM', '8:01 AM'];
const UNDO_SECONDS = 5;

export default function ReachDemo() {
  const [kids, setKids] = useState<Kid[]>(INITIAL_KIDS);
  const [parentMsgs, setParentMsgs] = useState<ParentMsg[]>([]);
  const [pending, setPending] = useState<PendingTap | null>(null);
  const [countdown, setCountdown] = useState(UNDO_SECONDS);
  const [tripDone, setTripDone] = useState(false);
  const [pulse, setPulse] = useState(false);
  const [autoRunning, setAutoRunning] = useState(false);

  const parentRef = useRef<HTMLDivElement>(null);
  const undoTimer = useRef<number | null>(null);
  const tickTimer = useRef<number | null>(null);
  const autoTimers = useRef<number[]>([]);
  const boardedCount = useRef(0);

  const reduceMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    parentRef.current?.scrollTo({
      top: parentRef.current.scrollHeight,
      behavior: reduceMotion ? 'auto' : 'smooth',
    });
  }, [parentMsgs, reduceMotion]);

  useEffect(
    () => () => {
      if (undoTimer.current) clearTimeout(undoTimer.current);
      if (tickTimer.current) clearInterval(tickTimer.current);
      autoTimers.current.forEach(clearTimeout);
    },
    []
  );

  function sendParent(text: string) {
    setPulse(true);
    window.setTimeout(() => setPulse(false), 900);
    setParentMsgs((m) => [
      ...m,
      { id: `${Date.now()}-${m.length}`, text, time: TIMES[Math.min(m.length, TIMES.length - 1)] },
    ]);
  }

  /** Every tap is held for an undo window before the parent message fires.
      (60 seconds in the real product — compressed to 5 here.) */
  function holdThenFire(tap: PendingTap) {
    if (undoTimer.current) clearTimeout(undoTimer.current);
    if (tickTimer.current) clearInterval(tickTimer.current);
    setPending(tap);
    setCountdown(UNDO_SECONDS);
    tickTimer.current = window.setInterval(() => {
      setCountdown((c) => Math.max(0, c - 1));
    }, 1000);
    undoTimer.current = window.setTimeout(() => {
      if (tickTimer.current) clearInterval(tickTimer.current);
      setPending(null);
      tap.fire();
    }, UNDO_SECONDS * 1000);
  }

  function undo() {
    if (undoTimer.current) clearTimeout(undoTimer.current);
    if (tickTimer.current) clearInterval(tickTimer.current);
    if (!pending) return;
    // revert the optimistic status
    if (pending.id === 'trip') {
      setTripDone(false);
    } else {
      setKids((ks) =>
        ks.map((k) => (k.id === pending.id ? { ...k, status: 'expected' } : k))
      );
    }
    setPending(null);
  }

  function tapKid(kid: Kid, action: 'boarded' | 'absent') {
    if (pending || kid.status !== 'expected') return;
    setKids((ks) => ks.map((k) => (k.id === kid.id ? { ...k, status: action } : k)));
    if (action === 'absent') return; // absences never notify — no guessing, no alarms
    const msgIndex = boardedCount.current;
    holdThenFire({
      id: kid.id,
      label: `${kid.name} boarded`,
      fire: () => {
        sendParent(
          `${kid.name} boarded the bus at ${kid.stop} — ${TIMES[Math.min(msgIndex, 3)]} ✅`
        );
        boardedCount.current += 1;
      },
    });
  }

  function tapReached() {
    if (pending || tripDone) return;
    const aboard = kids.filter((k) => k.status === 'boarded');
    if (aboard.length === 0) return;
    setTripDone(true);
    holdThenFire({
      id: 'trip',
      label: 'Reached school',
      fire: () => {
        setKids((ks) =>
          ks.map((k) => (k.status === 'boarded' ? { ...k, status: 'reached' } : k))
        );
        aboard.forEach((k, i) => {
          window.setTimeout(
            () => sendParent(`${k.name} reached school — 8:15 AM. Have a great day! 🎒`),
            i * 600
          );
        });
      },
    });
  }

  /** Scripted "morning run" for passive viewers */
  function playMorningRun() {
    if (autoRunning) return;
    reset();
    setAutoRunning(true);
    const steps: Array<{ at: number; run: () => void }> = [];
    let t = 600;
    INITIAL_KIDS.forEach((kid, i) => {
      const action: 'boarded' | 'absent' = kid.id === 'k3' ? 'absent' : 'boarded';
      steps.push({
        at: t,
        run: () => {
          setKids((ks) => ks.map((k) => (k.id === kid.id ? { ...k, status: action } : k)));
          if (action === 'boarded') {
            const idx = i > 2 ? i - 1 : i;
            window.setTimeout(
              () =>
                sendParent(
                  `${kid.name} boarded the bus at ${kid.stop} — ${TIMES[Math.min(idx, 3)]} ✅`
                ),
              1200
            );
          }
        },
      });
      t += 2200;
    });
    steps.push({
      at: t + 800,
      run: () => {
        setTripDone(true);
        setKids((ks) =>
          ks.map((k) => (k.status === 'boarded' ? { ...k, status: 'reached' } : k))
        );
        INITIAL_KIDS.filter((k) => k.id !== 'k3').forEach((k, i) => {
          window.setTimeout(
            () => sendParent(`${k.name} reached school — 8:15 AM. Have a great day! 🎒`),
            600 + i * 700
          );
        });
        window.setTimeout(() => setAutoRunning(false), 3200);
      },
    });
    steps.forEach((s) => autoTimers.current.push(window.setTimeout(s.run, s.at)));
  }

  function reset() {
    autoTimers.current.forEach(clearTimeout);
    autoTimers.current = [];
    if (undoTimer.current) clearTimeout(undoTimer.current);
    if (tickTimer.current) clearInterval(tickTimer.current);
    boardedCount.current = 0;
    setKids(INITIAL_KIDS);
    setParentMsgs([]);
    setPending(null);
    setTripDone(false);
    setAutoRunning(false);
  }

  const statusLabel: Record<KidStatus, string> = {
    expected: 'EXPECTED',
    boarded: 'BOARDED',
    absent: 'ABSENT',
    reached: 'REACHED',
  };

  return (
    <div className="reach-demo">
      <div className="reach-stage-head">
        <span className="chip amber">NO GPS · NO LIVE MAP · JUST PROOF</span>
        <div className="reach-actions">
          <button className="reach-run mono" onClick={playMorningRun} disabled={autoRunning}>
            {autoRunning ? '▶ RUNNING…' : '▶ PLAY MORNING RUN'}
          </button>
          <button className="reach-reset mono" onClick={reset}>
            ↺ RESET
          </button>
        </div>
      </div>

      <div className="reach-panes">
        {/* ── Pane 1: driver tap app ── */}
        <div className="phone reach-phone driver">
          <div className="phone-screen reach-driver-screen">
            <div className="reach-driver-head">
              <span className="mono reach-driver-kicker">REACH · DRIVER</span>
              <span className="reach-driver-trip">Morning run — Maxi PBR 4821</span>
            </div>
            <div className="reach-roster">
              {kids.map((kid) => (
                <div key={kid.id} className={`reach-kid ${kid.status}`}>
                  <div className="reach-kid-info">
                    <span className="reach-kid-name">{kid.name}</span>
                    <span className="reach-kid-stop mono">{kid.stop}</span>
                  </div>
                  {kid.status === 'expected' ? (
                    <div className="reach-kid-btns">
                      <button
                        className="reach-btn board"
                        onClick={() => tapKid(kid, 'boarded')}
                        disabled={!!pending || autoRunning}
                      >
                        Boarded
                      </button>
                      <button
                        className="reach-btn absent"
                        onClick={() => tapKid(kid, 'absent')}
                        disabled={!!pending || autoRunning}
                      >
                        Absent
                      </button>
                    </div>
                  ) : (
                    <span className={`reach-kid-status mono ${kid.status}`}>
                      {statusLabel[kid.status]}
                    </span>
                  )}
                </div>
              ))}
            </div>
            <button
              className="reach-btn reached-btn"
              onClick={tapReached}
              disabled={
                !!pending || tripDone || autoRunning || !kids.some((k) => k.status === 'boarded')
              }
            >
              🏁 Reached school
            </button>
            {pending && (
              <button className="reach-undo" onClick={undo}>
                <span
                  className="reach-undo-bar"
                  style={{ width: `${(countdown / UNDO_SECONDS) * 100}%` }}
                />
                <span className="reach-undo-text mono">
                  UNDO “{pending.label}” — {countdown}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* ── Signal pulse between panes ── */}
        <div className={`reach-signal ${pulse ? 'firing' : ''}`} aria-hidden="true">
          <span className="reach-signal-dot" />
          <svg viewBox="0 0 120 8" preserveAspectRatio="none">
            <path d="M0 4 H120" stroke="currentColor" strokeWidth="2" strokeDasharray="4 6" />
          </svg>
        </div>

        {/* ── Pane 2: parent WhatsApp ── */}
        <div className="phone reach-phone parent">
          <div className="phone-screen">
            <div className="rc-header">
              <div className="rc-avatar reach-avatar" aria-hidden="true">🚌</div>
              <div>
                <div className="rc-header-name">Reach</div>
                <div className="rc-header-sub">
                  <span>business account</span>
                </div>
              </div>
            </div>
            <div className="rc-thread reach-parent-thread" ref={parentRef} aria-live="polite">
              <div className="rc-day-pill">TODAY</div>
              {parentMsgs.length === 0 && (
                <div className="reach-parent-empty mono">
                  Parent’s phone.
                  <br />
                  Tap “Boarded” on the driver app →
                </div>
              )}
              {parentMsgs.map((m) => (
                <div key={m.id} className="bubble-row">
                  <div className="bubble-group">
                    <div className="bubble in">
                      <span className="bubble-text">{m.text}</span>
                      <span className="bubble-meta">{m.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Pane 3: operator strip ── */}
      <div className="reach-operator glass-card">
        <div className="reach-op-head">
          <span className="mono reach-op-title">OPERATOR VIEW</span>
          <span className="mono reach-op-invoice">
            month-end: 82 trips · invoiced automatically · reconciled ✓
          </span>
        </div>
        <div className="reach-op-rows">
          <div className="reach-op-row">
            <span className="mono">TRIP 1 · MORNING RUN</span>
            <span className="reach-op-cells">
              {kids.map((k) => (
                <span key={k.id} className={`reach-op-cell mono ${k.status}`}>
                  {k.name}: {statusLabel[k.status]}
                </span>
              ))}
            </span>
            <span className={`mono reach-op-flag ${tripDone ? 'ok' : ''}`}>
              {tripDone ? '✓ COMPLETE' : 'OPEN'}
            </span>
          </div>
          <div className="reach-op-row overdue">
            <span className="mono">TRIP 3 · SOUTH ROUTE</span>
            <span className="reach-op-cells">
              <span className="reach-op-cell mono">no “reached” tap by 8:30</span>
            </span>
            <span className="mono reach-op-flag warn">⚠ FLAGGED — CALL DRIVER</span>
          </div>
        </div>
      </div>
    </div>
  );
}
