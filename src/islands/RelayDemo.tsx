import { useCallback, useEffect, useRef, useState } from 'react';
import { RELAY_SCRIPT, START_NODE, type DemoChoice, type DemoNode, type DemoTag } from '../data/relayScript';
import '../styles/relay-chat.css';
import './relay-demo.css';

interface RenderedMsg {
  key: string;
  role: DemoNode['role'];
  text: string;
  banner?: string;
}

const FIELD_ORDER = ['state', 'customer', 'address', 'region', 'payment', 'order'] as const;
const FIELD_LABELS: Record<string, string> = {
  state: 'STATE',
  customer: 'CUSTOMER_NAME',
  address: 'DELIVERY_ADDRESS',
  region: 'REGION',
  payment: 'PAYMENT_METHOD',
  order: 'ORDER',
};

const CUSTOMER_DELAY = 800;
const TYPING_MS = 1200;
const CHOICE_AUTO_MS = 7000;

export default function RelayDemo() {
  const [messages, setMessages] = useState<RenderedMsg[]>([]);
  const [typing, setTyping] = useState(false);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [flash, setFlash] = useState<Record<string, boolean>>({});
  const [choices, setChoices] = useState<DemoChoice[] | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);
  const [started, setStarted] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const threadRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const fieldRefs = useRef<Record<string, HTMLElement | null>>({});
  const timers = useRef<number[]>([]);
  const runId = useRef(0);

  const reduceMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const later = useCallback((fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms);
    timers.current.push(id);
  }, []);

  /* start playback when scrolled into view */
  useEffect(() => {
    const el = rootRef.current;
    if (!el || started) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          io.disconnect();
          setStarted(true);
        }
      },
      { threshold: 0.35 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [started]);

  useEffect(() => {
    if (started) playNode(START_NODE);
    return () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started]);

  useEffect(() => {
    threadRef.current?.scrollTo({
      top: threadRef.current.scrollHeight,
      behavior: reduceMotion ? 'auto' : 'smooth',
    });
  }, [messages, typing, choices, reduceMotion]);

  function fillField(field: string, value: string) {
    setFields((f) => ({ ...f, [field]: value }));
    setFlash((f) => ({ ...f, [field]: true }));
    window.setTimeout(() => setFlash((f) => ({ ...f, [field]: false })), 900);
  }

  /** FLIP-style chip flight from the last bubble to a dashboard field */
  function flyTag(t: DemoTag, delay: number) {
    const overlay = overlayRef.current;
    const thread = threadRef.current;
    const target = fieldRefs.current[t.field];
    if (reduceMotion || !overlay || !thread || !target) {
      later(() => fillField(t.field, t.value), delay);
      return;
    }
    later(() => {
      const bubbles = thread.querySelectorAll('.bubble.out');
      const from = bubbles[bubbles.length - 1];
      if (!from) return fillField(t.field, t.value);

      const oRect = overlay.getBoundingClientRect();
      const fRect = from.getBoundingClientRect();
      const tRect = target.getBoundingClientRect();

      const chip = document.createElement('span');
      chip.className = `tag-chip fly ${t.tag === 'ESCALATE' ? 'escalate' : ''}`;
      chip.textContent = t.tag === 'ORDER' ? `[ORDER: ${t.field}]` : `[${t.tag}]`;
      chip.style.left = `${fRect.right - oRect.left - 30}px`;
      chip.style.top = `${fRect.top - oRect.top + 8}px`;
      overlay.appendChild(chip);

      // force layout, then fly
      chip.getBoundingClientRect();
      chip.style.transform = `translate(${tRect.left - fRect.right + 34}px, ${
        tRect.top - fRect.top - 6
      }px) scale(0.9)`;
      chip.style.opacity = '0.95';

      const finish = () => {
        chip.remove();
        fillField(t.field, t.value);
      };
      chip.addEventListener('transitionend', finish, { once: true });
      window.setTimeout(finish, 900); // safety net
    }, delay);
  }

  function playNode(id: string) {
    const node = RELAY_SCRIPT[id];
    if (!node) return;
    const myRun = runId.current;
    const guard = (fn: () => void) => () => {
      if (runId.current === myRun) fn();
    };

    if (node.choices) {
      setChoices(node.choices);
      later(
        guard(() => {
          // auto-advance with the first option if the visitor doesn't pick
          setChoices((c) => {
            if (c) pickChoice(node.choices![0], true);
            return null;
          });
        }),
        CHOICE_AUTO_MS
      );
      return;
    }

    if (node.role === 'customer') {
      later(
        guard(() => {
          setMessages((m) => [...m, { key: node.id, role: 'customer', text: node.text }]);
          if (node.next) playNode(node.next);
        }),
        CUSTOMER_DELAY
      );
      return;
    }

    // ai / human replies: typing indicator first
    later(guard(() => setTyping(true)), 500);
    later(
      guard(() => {
        setTyping(false);
        setMessages((m) => [
          ...m,
          { key: node.id, role: node.role, text: node.text, banner: node.banner },
        ]);
        node.tags?.forEach((t, i) => flyTag(t, 350 + i * 320));
        if (node.toast) later(guard(() => setToast(node.toast!)), 1100);
        if (node.end) later(guard(() => setFinished(true)), 1400);
        if (node.next) playNode(node.next);
      }),
      500 + TYPING_MS
    );
  }

  function pickChoice(choice: DemoChoice, auto = false) {
    if (!auto) {
      // visitor interacted: cancel any pending auto-advance timers
      timers.current.forEach(clearTimeout);
      timers.current = [];
    }
    setChoices(null);
    playNode(choice.next);
  }

  function replay() {
    runId.current += 1;
    timers.current.forEach(clearTimeout);
    timers.current = [];
    overlayRef.current?.querySelectorAll('.tag-chip.fly').forEach((c) => c.remove());
    setMessages([]);
    setFields({});
    setChoices(null);
    setToast(null);
    setTyping(false);
    setFinished(false);
    window.setTimeout(() => playNode(START_NODE), 400);
  }

  return (
    <div className="rdemo" ref={rootRef}>
      <div className="rdemo-overlay" ref={overlayRef} aria-hidden="true" />

      {/* ── Phone: the WhatsApp conversation ── */}
      <div className="phone rdemo-phone">
        <div className="phone-screen">
          <div className="rc-header">
            <div className="rc-avatar" aria-hidden="true">J</div>
            <div>
              <div className="rc-header-name">Jane Doe</div>
              <div className="rc-header-sub">
                <span className="rc-live">live</span>
                <span>· from ad</span>
              </div>
            </div>
            <span className="ai-active-pill">AI ACTIVE</span>
          </div>

          <div className="rc-thread rdemo-thread" ref={threadRef} aria-live="polite">
            <div className="rc-day-pill">TODAY</div>
            {messages.map((m) => (
              <div key={m.key}>
                <div className={`bubble-row ${m.role !== 'customer' ? 'out' : ''}`}>
                  <div className={`bubble-group ${m.role !== 'customer' ? 'out' : ''}`}>
                    <div
                      className={`bubble ${
                        m.role === 'ai' ? 'out ai-bubble' : m.role === 'human' ? 'out' : 'in'
                      }`}
                    >
                      <span className="bubble-text">{m.text}</span>
                      <span className="bubble-meta">
                        {m.role !== 'customer' ? '✓✓' : ''} now
                      </span>
                    </div>
                  </div>
                </div>
                {m.banner && <div className="ai-banner">{m.banner}</div>}
              </div>
            ))}
            {typing && (
              <div className="bubble-row out">
                <div className="typing-indicator rdemo-typing">
                  <span className="dot" />
                  <span className="dot" />
                  <span className="dot" />
                </div>
              </div>
            )}
          </div>

          {choices ? (
            <div className="choice-row" aria-label="Choose the customer's reply">
              <span className="rdemo-choice-hint">You’re the customer — reply:</span>
              {choices.map((c) => (
                <button key={c.label} className="choice-pill" onClick={() => pickChoice(c)}>
                  {c.label}
                </button>
              ))}
            </div>
          ) : (
            <div className="rc-composer">
              <div className="rc-ta-wrap">Message…</div>
              <button className="send-btn" aria-label="Send" tabIndex={-1}>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
                  <path d="M2 21l21-9L2 3v7l15 2-15 2v7z" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Dashboard: live extraction panel ── */}
      <div className="rdemo-dash glass-card">
        <div className="rdemo-dash-head">
          <span className="rdemo-dash-title mono">LIVE EXTRACTION</span>
          <span className="chip live">relay.bynovara.com</span>
        </div>
        <p className="rdemo-dash-sub">
          Every AI reply carries structured tags. The backend — not the AI — decides what to do
          with them.
        </p>

        <dl className="rdemo-fields">
          {FIELD_ORDER.map((f) => (
            <div
              key={f}
              className={`rdemo-field ${fields[f] ? 'filled' : ''} ${flash[f] ? 'flash' : ''} ${
                f === 'state' && fields[f] === 'escalated' ? 'is-escalated' : ''
              } ${f === 'state' && fields[f] === 'converted' ? 'is-converted' : ''}`}
              ref={(el) => {
                fieldRefs.current[f] = el;
              }}
            >
              <dt className="mono">{FIELD_LABELS[f]}</dt>
              <dd className="mono">{fields[f] ?? '—'}</dd>
            </div>
          ))}
        </dl>

        {toast && <div className="order-toast rdemo-toast">✅ {toast}</div>}

        {finished && (
          <button className="rdemo-replay mono" onClick={replay}>
            ↺ REPLAY DEMO
          </button>
        )}
      </div>
    </div>
  );
}
