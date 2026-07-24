export interface Product {
  id: string;
  name: string;
  status: 'LIVE' | 'IN PRODUCTION' | 'EARLY ACCESS' | 'CLIENT WORK';
  strap: string;
  blurb: string;
  accent: 'blue' | 'teal' | 'gold' | 'violet';
}

export const PRODUCTS: Product[] = [
  {
    id: 'iconbook',
    name: 'IconBook',
    status: 'LIVE',
    strap: 'Bookings for barbershops & salons',
    blurb:
      'Appointment booking, customer profiles, follow-ups, receipts, and an analytics dashboard — built with a working barbershop, not for a hypothetical one.',
    accent: 'gold',
  },
  {
    id: 'signal',
    name: 'Signal',
    status: 'IN PRODUCTION',
    strap: 'Trend sensing → content briefs',
    blurb:
      'Reads Instagram, YouTube, and X; ranks what’s actually trending with every score visible; and emits a daily content brief in your brand voice.',
    accent: 'violet',
  },
  {
    id: 'press',
    name: 'Press',
    status: 'IN PRODUCTION',
    strap: 'Publishing you can trust',
    blurb:
      'Renders and publishes content to Instagram with a provenance record for every asset and an append-only ledger that makes double-posting impossible.',
    accent: 'blue',
  },
  {
    id: 'content-automation',
    name: 'Content Automation',
    status: 'EARLY ACCESS',
    strap: 'Sense → Think → Make → Ship',
    blurb:
      'A four-stage daily pipeline: scan trends, write the story, render the slides, publish on a randomized schedule. One command a day.',
    accent: 'teal',
  },
  {
    id: 'ai-creative',
    name: 'AI Creative Studio',
    status: 'LIVE',
    strap: 'Ads that make themselves',
    blurb:
      'AI avatar video ads, image generation, hook analysis of competitor creative, and full Meta campaign management — in production for paid social.',
    accent: 'violet',
  },
  {
    id: 'lead-enricher',
    name: 'Lead Enricher TT',
    status: 'LIVE',
    strap: 'Clean data, compliantly',
    blurb:
      'Takes a CSV of local businesses and returns enriched, verified profiles — phones normalized, hours, socials, confidence scores. Official APIs only, no scraping.',
    accent: 'teal',
  },
  {
    id: 'web-work',
    name: 'Client Web Work',
    status: 'CLIENT WORK',
    strap: 'Sites that sell',
    blurb:
      'Marketing sites for Trinidad retailers and wholesalers — home centres, streaming services, device setup — every one wired into WhatsApp.',
    accent: 'gold',
  },
];
