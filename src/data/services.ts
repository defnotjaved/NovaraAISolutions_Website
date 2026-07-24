export interface Service {
  id: string;
  pillar: 'conversational' | 'operations' | 'custom';
  icon: string; // inline emoji-free glyph key used by components
  title: string;
  pain: string;
  build: string;
  plugsInto: string;
  proof: string;
}

export const PILLARS: Record<Service['pillar'], { label: string; strap: string }> = {
  conversational: { label: 'Conversational AI', strap: 'Never miss a customer' },
  operations: { label: 'Operations Automation', strap: 'Run lean' },
  custom: { label: 'Custom Builds', strap: 'Software that fits' },
};

export const SERVICES: Service[] = [
  {
    id: 'whatsapp-agents',
    pillar: 'conversational',
    icon: 'chat',
    title: 'WhatsApp AI Sales Agents',
    pain: 'Customers message at 11 PM. By morning, the sale went to whoever replied first.',
    build:
      'An AI agent that answers every WhatsApp message instantly — greets, answers from your real catalog, collects the order field by field, and hands off to a human the moment it should.',
    plugsInto: 'WhatsApp Business API · your product catalog · delivery partners · payments',
    proof: 'Running in production for a Caribbean retailer — thousands of conversations handled.',
  },
  {
    id: 'voice-agents',
    pillar: 'conversational',
    icon: 'phone',
    title: 'AI Voice & Calling Agents',
    pain: 'The phone rings while you work. 62% of calls to small businesses go unanswered.',
    build:
      'An AI receptionist that answers your line 24/7 — books appointments, answers questions, qualifies callers, and texts them links mid-call.',
    plugsInto: 'your phone number · calendar · CRM',
    proof: 'Built on the same conversation engine that powers our WhatsApp agents.',
  },
  {
    id: 'sms-textback',
    pillar: 'conversational',
    icon: 'sms',
    title: 'AI SMS & Missed-Call Text-Back',
    pain: 'Every missed call is a customer standing at a locked door.',
    build:
      'The moment a call goes unanswered, an automatic text goes out — apologises, asks what they need, books or quotes. Plus AI campaigns that revive your dormant customer list.',
    plugsInto: 'your phone line · contact lists · booking system',
    proof: 'Missed-call text-back recovers 30–60% of unanswered calls industry-wide.',
  },
  {
    id: 'workflow-automation',
    pillar: 'operations',
    icon: 'flow',
    title: 'Workflow Automation',
    pain: 'Copy the order. Paste it in the group chat. Message the courier. Repeat forever.',
    build:
      'Pipelines that move work without you: order → delivery dispatch → payment check → renewal reminder. Built to run every day without babysitting.',
    plugsInto: 'WhatsApp · delivery APIs · spreadsheets · accounting tools',
    proof: 'Our own platform runs renewal ladders, delivery sync, and payment verification on autopilot.',
  },
  {
    id: 'ai-crm',
    pillar: 'operations',
    icon: 'crm',
    title: 'AI-Powered CRM',
    pain: 'Your customer history lives in six chat threads and someone’s memory.',
    build:
      'A dashboard where every conversation, order, and escalation is logged automatically — with ad attribution so you know which ad brought each customer.',
    plugsInto: 'WhatsApp · Meta ads · your team’s roles and permissions',
    proof: 'The Relay dashboard is this, live — inbox, orders, escalations, analytics.',
  },
  {
    id: 'content-automation',
    pillar: 'operations',
    icon: 'content',
    title: 'Content & Ads Automation',
    pain: 'Posting every day is a second job nobody applied for.',
    build:
      'AI content pipelines: sense what’s trending, write on-brand posts and ad creative (including AI avatar video), schedule and publish safely — with a ledger that can never double-post.',
    plugsInto: 'Instagram · TikTok · Meta ads',
    proof: 'Our publishing engine records the provenance of every asset it ships.',
  },
  {
    id: 'custom-ai-apps',
    pillar: 'custom',
    icon: 'app',
    title: 'Custom AI Applications',
    pain: 'Off-the-shelf software wasn’t built for how business works here.',
    build:
      'Full products designed around your operation — from school-transport notification systems to booking platforms for barbershops. Multi-tenant, role-based, mobile-ready.',
    plugsInto: 'whatever your business already uses',
    proof: 'Reach (school transport) and IconBook (salon booking) started exactly this way.',
  },
  {
    id: 'websites',
    pillar: 'custom',
    icon: 'web',
    title: 'Websites & Web Apps',
    pain: 'Your business is good. Your Google presence says otherwise.',
    build:
      'Fast, animated, conversion-focused sites — wired into WhatsApp so every visitor can become a conversation.',
    plugsInto: 'WhatsApp · booking · analytics',
    proof: 'Shipped for retailers and wholesalers across Trinidad — including this site.',
  },
];
