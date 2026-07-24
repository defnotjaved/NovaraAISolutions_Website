import { useEffect, useRef, useState } from 'react';
import { SITE } from '../data/site';
import '../styles/relay-chat.css';
import './fab-agent.css';

interface Msg {
  role: 'ai' | 'user';
  text: string;
}

interface Step {
  question: string;
  options: string[];
}

const STEPS: Step[] = [
  {
    question: 'Hey! 👋 I’m Novara’s AI. What kind of business do you run?',
    options: ['Retail / shop', 'Salon / barber', 'Food / restaurant', 'Services / other'],
  },
  {
    question: 'Nice. What eats most of your time right now?',
    options: ['Answering messages', 'Missed calls', 'Posting content', 'Manual admin work'],
  },
];

export default function FabAgent() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [typing, setTyping] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);

  const done = step >= STEPS.length;

  useEffect(() => {
    if (!open || msgs.length > 0) return;
    setTyping(true);
    const t = setTimeout(() => {
      setTyping(false);
      setMsgs([{ role: 'ai', text: STEPS[0].question }]);
    }, 700);
    return () => clearTimeout(t);
  }, [open, msgs.length]);

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight, behavior: 'smooth' });
  }, [msgs, typing]);

  function pick(option: string) {
    const nextStep = step + 1;
    const nextAnswers = [...answers, option];
    setAnswers(nextAnswers);
    setMsgs((m) => [...m, { role: 'user', text: option }]);
    setStep(nextStep);
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      if (nextStep < STEPS.length) {
        setMsgs((m) => [...m, { role: 'ai', text: STEPS[nextStep].question }]);
      } else {
        setMsgs((m) => [
          ...m,
          {
            role: 'ai',
            text: 'Got it — we’ve built exactly that fix before. Tap below and this chat continues with the humans on WhatsApp 👇',
          },
        ]);
      }
    }, 800);
  }

  const waHref = `https://wa.me/${SITE.whatsappE164}?text=${encodeURIComponent(
    done
      ? `Hi Novara! I run a ${answers[0]?.toLowerCase() ?? 'business'} and I need help with ${answers[1]?.toLowerCase() ?? 'automation'}.`
      : 'Hi Novara! I want to talk about AI for my business.'
  )}`;

  return (
    <div className="fab-root">
      {open && (
        <div className="fab-panel" role="dialog" aria-label="Chat with Novara AI">
          <div className="rc-header">
            <div className="rc-avatar" aria-hidden="true">N</div>
            <div>
              <div className="rc-header-name">Novara AI</div>
              <div className="rc-header-sub">
                <span className="rc-live">online</span>
              </div>
            </div>
            <span className="ai-active-pill">AI ACTIVE</span>
            <button className="fab-close" onClick={() => setOpen(false)} aria-label="Close chat">
              ×
            </button>
          </div>

          <div className="rc-thread fab-thread" ref={bodyRef} aria-live="polite">
            {msgs.map((m, i) => (
              <div key={i} className={`bubble-row ${m.role === 'ai' ? 'out' : ''}`}>
                <div className={`bubble-group ${m.role === 'ai' ? 'out' : ''}`}>
                  <div className={`bubble ${m.role === 'ai' ? 'out ai-bubble' : 'in'}`}>
                    <span className="bubble-text">{m.text}</span>
                  </div>
                </div>
              </div>
            ))}
            {typing && (
              <div className="bubble-row">
                <div className="typing-indicator" style={{ background: '#fff' }}>
                  <span className="dot" />
                  <span className="dot" />
                  <span className="dot" />
                </div>
              </div>
            )}
          </div>

          {!done && !typing && msgs.length > 0 && (
            <div className="choice-row">
              {STEPS[step].options.map((o) => (
                <button key={o} className="choice-pill" onClick={() => pick(o)}>
                  {o}
                </button>
              ))}
            </div>
          )}

          {done && !typing && (
            <div className="fab-cta-row">
              <a className="btn btn-wa fab-cta" href={waHref} target="_blank" rel="noopener noreferrer">
                Open WhatsApp →
              </a>
              <a className="fab-alt" href={SITE.bookingUrl}>
                or book a call instead
              </a>
            </div>
          )}
        </div>
      )}

      <button
        className={`fab-btn ${open ? 'is-open' : ''}`}
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? 'Close Novara chat' : 'Chat with Novara on WhatsApp'}
      >
        {open ? (
          <span className="fab-x">×</span>
        ) : (
          <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor" aria-hidden="true">
            <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.87 9.87 0 0 0 4.74 1.21c5.46 0 9.9-4.45 9.9-9.91A9.87 9.87 0 0 0 12.04 2m0 18.03a8.1 8.1 0 0 1-4.13-1.13l-.3-.18-3.12.82.83-3.04-.2-.31a8.1 8.1 0 0 1-1.24-4.28c0-4.5 3.66-8.15 8.16-8.15 4.49 0 8.15 3.66 8.15 8.15 0 4.5-3.66 8.12-8.15 8.12m4.47-6.08c-.24-.12-1.45-.72-1.67-.8-.23-.08-.39-.12-.56.12-.16.25-.64.8-.78.97-.15.16-.29.18-.53.06-.25-.12-1.04-.38-1.97-1.22-.73-.65-1.22-1.45-1.36-1.7-.14-.24-.02-.38.1-.5.11-.11.25-.29.37-.43s.16-.25.25-.41c.08-.17.04-.31-.02-.43s-.56-1.34-.76-1.84c-.2-.48-.4-.42-.56-.43h-.48c-.16 0-.43.06-.66.31-.22.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.45-.6 1.65-1.18.21-.58.21-1.07.15-1.18-.07-.1-.23-.16-.48-.27" />
          </svg>
        )}
      </button>
    </div>
  );
}
