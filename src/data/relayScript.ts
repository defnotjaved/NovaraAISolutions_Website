/**
 * Branching demo scenario for the RelayDemo island.
 * Message content is sanitized from Relay's real golden replay fixtures —
 * this is what the production agent actually sounds like.
 */

export interface DemoTag {
  tag: 'STATE' | 'ORDER' | 'ESCALATE';
  /** dashboard field this tag fills (state | customer | address | region | payment | order) */
  field: string;
  value: string;
}

export interface DemoChoice {
  label: string;
  next: string;
}

export interface DemoNode {
  id: string;
  role: 'customer' | 'ai' | 'human';
  text: string;
  tags?: DemoTag[];
  /** if present, playback pauses and the visitor picks the customer's reply */
  choices?: DemoChoice[];
  next?: string;
  toast?: string;
  banner?: string;
  end?: boolean;
}

export const START_NODE = 'c1';

export const RELAY_SCRIPT: Record<string, DemoNode> = {
  c1: {
    id: 'c1',
    role: 'customer',
    text: 'hi, i saw the ad. how much for the fire stick?',
    next: 'a1',
  },
  a1: {
    id: 'a1',
    role: 'ai',
    text: 'Hey! Welcome 👋 The Amazon Fire TV Stick 4K is TTD $350 — it comes fully set up and ready to watch. Would you like to place an order?',
    tags: [{ tag: 'STATE', field: 'state', value: 'in_progress' }],
    next: 'choice1',
  },
  choice1: {
    id: 'choice1',
    role: 'customer',
    text: '',
    choices: [
      { label: 'Yes, I want one 🙌', next: 'c2yes' },
      { label: "Isn't it $250? Thought it was cheaper", next: 'c2price' },
      { label: 'You all deliver to Tobago?', next: 'c2tobago' },
    ],
  },

  /* ── price objection branch (the agent never invents a discount) ── */
  c2price: {
    id: 'c2price',
    role: 'customer',
    text: "isn't it $250? thought it was cheaper",
    next: 'a2price',
  },
  a2price: {
    id: 'a2price',
    role: 'ai',
    text: 'The Fire TV Stick 4K is TTD $350 — that includes full setup, so it works the moment it reaches you. Would you like to go ahead?',
    next: 'choice1b',
  },
  choice1b: {
    id: 'choice1b',
    role: 'customer',
    text: '',
    choices: [
      { label: 'Ok fine, let’s do it', next: 'c2yes' },
      { label: 'Let me talk to a real person', next: 'c2human' },
    ],
  },

  /* ── tobago branch ── */
  c2tobago: {
    id: 'c2tobago',
    role: 'customer',
    text: 'you all deliver to tobago?',
    next: 'a2tobago',
  },
  a2tobago: {
    id: 'a2tobago',
    role: 'ai',
    text: 'We deliver all across Trinidad, and Tobago orders go out by courier 📦 Would you like to place an order?',
    next: 'choice1c',
  },
  choice1c: {
    id: 'choice1c',
    role: 'customer',
    text: '',
    choices: [
      { label: 'Yes please!', next: 'c2yes' },
      { label: 'Let me talk to a real person', next: 'c2human' },
    ],
  },

  /* ── happy path: slot-filling, one field at a time ── */
  c2yes: {
    id: 'c2yes',
    role: 'customer',
    text: 'yes i want one',
    next: 'a3',
  },
  a3: {
    id: 'a3',
    role: 'ai',
    text: 'Great! Can I get your full name for the order?',
    next: 'c3',
  },
  c3: {
    id: 'c3',
    role: 'customer',
    text: 'Jane Doe',
    next: 'a4',
  },
  a4: {
    id: 'a4',
    role: 'ai',
    text: 'Thanks Jane! And what’s your delivery address?',
    tags: [{ tag: 'ORDER', field: 'customer', value: 'Jane Doe' }],
    next: 'c4',
  },
  c4: {
    id: 'c4',
    role: 'customer',
    text: '12 Hibiscus Drive, Curepe',
    next: 'a5',
  },
  a5: {
    id: 'a5',
    role: 'ai',
    text: 'Perfect. And how would you like to pay — cash on delivery or bank transfer?',
    tags: [
      { tag: 'ORDER', field: 'address', value: '12 Hibiscus Drive' },
      { tag: 'ORDER', field: 'region', value: 'Curepe' },
    ],
    next: 'choice2',
  },
  choice2: {
    id: 'choice2',
    role: 'customer',
    text: '',
    choices: [
      { label: 'Cash on delivery', next: 'c5cash' },
      { label: 'Bank transfer', next: 'c5bank' },
      { label: 'Actually… real person please 😅', next: 'c2human' },
    ],
  },
  c5cash: {
    id: 'c5cash',
    role: 'customer',
    text: 'cash on delivery',
    next: 'a6cash',
  },
  a6cash: {
    id: 'a6cash',
    role: 'ai',
    text: 'Perfect — here’s your order 👇\n\n1× Fire TV Stick 4K — TTD $350\nJane Doe · 12 Hibiscus Drive, Curepe\nPayment: cash on delivery\n\nWe’ll message you the moment it’s out for delivery 🚀',
    tags: [
      { tag: 'ORDER', field: 'payment', value: 'cash on delivery' },
      { tag: 'STATE', field: 'state', value: 'converted' },
      { tag: 'ORDER', field: 'order', value: '1× Fire Stick · $350' },
    ],
    toast: 'Order captured — TTD 350',
    end: true,
  },
  c5bank: {
    id: 'c5bank',
    role: 'customer',
    text: 'bank transfer',
    next: 'a6bank',
  },
  a6bank: {
    id: 'a6bank',
    role: 'ai',
    text: 'No problem — I’ll send the transfer details now. Once you send the receipt here, your order is confirmed 👇\n\n1× Fire TV Stick 4K — TTD $350\nJane Doe · 12 Hibiscus Drive, Curepe',
    tags: [
      { tag: 'ORDER', field: 'payment', value: 'bank transfer' },
      { tag: 'STATE', field: 'state', value: 'converted' },
      { tag: 'ORDER', field: 'order', value: '1× Fire Stick · $350' },
    ],
    toast: 'Order captured — TTD 350',
    end: true,
  },

  /* ── escalation branch: the honest handoff ── */
  c2human: {
    id: 'c2human',
    role: 'customer',
    text: 'let me talk to a real person',
    next: 'a2human',
  },
  a2human: {
    id: 'a2human',
    role: 'ai',
    text: 'No problem at all — let me get someone from the team for you 🙌',
    tags: [{ tag: 'ESCALATE', field: 'state', value: 'escalated' }],
    banner: '⚠ AI paused — human takes over from here',
    next: 'h1',
  },
  h1: {
    id: 'h1',
    role: 'human',
    text: 'Hi! Javed here from the team — I saw the chat, I’ll take it from here 👍',
    end: true,
  },
};
