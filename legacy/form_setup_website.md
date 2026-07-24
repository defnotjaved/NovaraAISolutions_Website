# Contact Form Setup — novaraai.com

## Stack
- **Form backend:** [Formspree](https://formspree.io) (free tier — 50 submissions/month, unlimited on paid)
- **Integration:** HTML form + fetch (AJAX) — no page redirect on submit
- **File to edit:** `novara-ai/index.html`

---

## Step 1 — Create a Formspree account

1. Go to [formspree.io](https://formspree.io) and sign up (use `hello@novaraai.com`)
2. Click **+ New Form**
3. Name it: `Novara AI — Website Contact`
4. Set email notifications to: `hello@novaraai.com` (and/or your WhatsApp-linked email)
5. Copy the **Form Endpoint URL** — it looks like:
   ```
   https://formspree.io/f/abcdefgh
   ```
   The 8-character code at the end is your **Form ID**.

---

## Step 2 — Wire the form ID into the site

Open `novara-ai/index.html` and find this line (inside the `#contact` section):

```html
<form class="contact-form" id="contactForm" action="https://formspree.io/f/YOUR_FORM_ID" method="POST">
```

Replace `YOUR_FORM_ID` with your actual ID:

```html
<form class="contact-form" id="contactForm" action="https://formspree.io/f/abcdefgh" method="POST">
```

---

## Step 3 — Replace placeholder contact info

In the same file, update:

| Placeholder | Replace with |
|---|---|
| `+1 (868) XXX-XXXX` (×2 — channel card + WhatsApp href) | Real WhatsApp number |
| `https://wa.me/18681234567` (×3 — nav CTA, contact, footer) | `https://wa.me/1868XXXXXXX` |
| `hello@novaraai.com` | Real email if different |

---

## Step 4 — Configure Formspree notifications

In the Formspree dashboard for your form:

- **Email notifications** → add `hello@novaraai.com`
- **Subject line template** → `New enquiry from {name} — {interest}`
- **Spam filter** → enable reCAPTCHA or honeypot (Formspree adds this automatically)
- **Redirect after submit** → leave blank (the site handles success state in JS via AJAX)

---

## Form fields (what gets submitted)

| Field name | Type | Required |
|---|---|---|
| `name` | text | yes |
| `business` | text | no |
| `email` | email | yes |
| `phone` | tel | no |
| `interest` | select | no |
| `message` | textarea | no |

---

## Step 5 — Test the form

1. Open `novara-ai/index.html` in a browser (or deploy the site)
2. Fill in the form and submit
3. Check: success state appears (form hides, green ✓ message shows)
4. Check: notification email arrives at `hello@novaraai.com`
5. Check: submission appears in Formspree dashboard → **Submissions** tab

---

## Upgrade path (when ready)

| Need | Option |
|---|---|
| > 50 submissions/month | Formspree Starter ($10/mo) |
| CRM sync (HubSpot, Notion, Airtable) | Formspree integrations tab |
| Store leads in Supabase | Replace Formspree with a `/contact` endpoint in the Relay Express backend |
| WhatsApp notification on new lead | Add n8n / Zapier webhook in Formspree → send WA via Meta Cloud API |

---

## Custom backend option (future)

If you outgrow Formspree, add a public POST route to the existing backend:

```
POST /contact   (no auth — public)
Body: { name, business, email, phone, interest, message }
Action: insert into contact_inquiries table + send WA to owner phone
```

Migration file would be: `backend/migrations/040_contact_inquiries.sql`
