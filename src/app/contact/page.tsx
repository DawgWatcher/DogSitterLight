import ContactForm from '@/components/ContactForm';

export const metadata = {
  title: 'Contact — ThePupPad',
  description: 'Get in touch with ThePupPad. Call, email, or send us a message.',
};

/* ── Social SVG Icons ── */
function InstagramIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2Zm0 1.5A4.25 4.25 0 0 0 3.5 7.75v8.5A4.25 4.25 0 0 0 7.75 20.5h8.5a4.25 4.25 0 0 0 4.25-4.25v-8.5A4.25 4.25 0 0 0 16.25 3.5h-8.5ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 1.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7ZM17.5 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2Z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12Z" />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M16.6 5.82A4.278 4.278 0 0 1 15.54 3h-3.09v12.4a2.592 2.592 0 0 1-2.59 2.5c-1.42 0-2.6-1.16-2.6-2.6 0-1.72 1.66-3.01 3.37-2.48V9.66c-3.45-.46-6.47 2.22-6.47 5.64 0 3.33 2.76 5.7 5.69 5.7 3.14 0 5.69-2.55 5.69-5.7V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3s-1.88.09-3.24-1.48Z" />
    </svg>
  );
}

/* ── Gold Divider (matches BookingForm pattern) ── */
function GoldDivider() {
  return (
    <div className="my-8 flex items-center gap-3">
      <div className="h-px flex-1 bg-gold/30" />
      <div className="h-1.5 w-1.5 rounded-full bg-gold" />
      <div className="h-px flex-1 bg-gold/30" />
    </div>
  );
}

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-xl px-5 py-10">
      <h1 className="font-nunito text-3xl font-bold text-plum">
        Get in Touch
      </h1>
      <p className="mt-2 font-nunito text-base text-plum/45">
        We&apos;d love to hear from you.
      </p>

      {/* ── Contact Info ── */}
      <div className="mt-8 space-y-4">
        {/* Tap-to-call */}
        <a
          href="tel:9089026008"
          className="flex h-12 items-center justify-center rounded-full bg-gold font-nunito text-sm font-bold text-plum transition-colors hover:bg-gold-hover"
        >
          908-902-6008
        </a>

        {/* Tap-to-email */}
        <a
          href="mailto:bookings@thepuppad.com"
          className="flex h-12 items-center justify-center rounded-full border-2 border-plum font-nunito text-sm font-bold text-plum transition-colors hover:bg-plum/5"
        >
          bookings@thepuppad.com
        </a>

        {/* Hours + Service Area */}
        <div className="flex flex-col gap-2 pt-2">
          <p className="font-nunito text-sm text-plum">
            <span className="font-bold">Hours:</span> 7am &ndash; 7pm
          </p>
          <p className="font-nunito text-sm text-plum">
            <span className="font-bold">Service Area:</span> Monroe Township, NJ and surrounding areas
          </p>
        </div>

        {/* Social Links */}
        <div className="flex items-center gap-5 pt-2">
          <a
            href="https://instagram.com/thepuppadnj"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="flex h-12 w-12 items-center justify-center rounded-full text-plum transition-colors hover:text-plum/70"
          >
            <InstagramIcon />
          </a>
          <a
            href="https://facebook.com/ThePupPad"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
            className="flex h-12 w-12 items-center justify-center rounded-full text-plum transition-colors hover:text-plum/70"
          >
            <FacebookIcon />
          </a>
          <a
            href="https://tiktok.com/@thepuppad"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="TikTok"
            className="flex h-12 w-12 items-center justify-center rounded-full text-plum transition-colors hover:text-plum/70"
          >
            <TikTokIcon />
          </a>
        </div>
      </div>

      <GoldDivider />

      {/* ── Contact Form ── */}
      <h2 className="font-nunito text-xl font-bold text-plum">
        Send Us a Message
      </h2>
      <div className="mt-4">
        <ContactForm />
      </div>
    </div>
  );
}
