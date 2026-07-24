export const SITE = {
  name: 'Novara AI Solutions',
  shortName: 'Novara AI',
  domain: 'https://bynovara.com',
  tagline: 'AI Infrastructure for Caribbean Business',
  email: 'admin.novaraaisolutions@gmail.com',
  /** TODO(Javed): replace with the real WhatsApp business number (digits only, E.164 no +). */
  whatsappE164: '18680000000',
  /** TODO(Javed): replace with the real booking link (Calendly etc). */
  bookingUrl: 'mailto:admin.novaraaisolutions@gmail.com?subject=Book%20a%20call%20with%20Novara%20AI',
  relayUrl: 'https://relay.bynovara.com',
  location: 'Trinidad & Tobago',
};

export function waLink(message: string): string {
  return `https://wa.me/${SITE.whatsappE164}?text=${encodeURIComponent(message)}`;
}
