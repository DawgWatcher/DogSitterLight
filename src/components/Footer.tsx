export default function Footer() {
  return (
    <footer className="hidden md:block bg-plum text-white/90 py-10">
      <div className="max-w-5xl mx-auto px-8">
        <div className="flex flex-wrap justify-between items-start gap-8">
          {/* Contact */}
          <div className="space-y-1.5 text-sm">
            <p className="font-bold text-base text-white mb-2">Contact</p>
            <p>
              <a
                href="tel:9089026008"
                className="hover:text-gold transition-colors focus:outline-2 focus:outline-gold"
              >
                908-902-6008
              </a>
            </p>
            <p>
              <a
                href="mailto:bookings@thepuppad.com"
                className="hover:text-gold transition-colors focus:outline-2 focus:outline-gold"
              >
                bookings@thepuppad.com
              </a>
            </p>
            <p>7am – 7pm</p>
          </div>

          {/* Social */}
          <div className="space-y-1.5 text-sm">
            <p className="font-bold text-base text-white mb-2">Follow Us</p>
            <p>
              <a
                href="https://instagram.com/thepuppadnj"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gold transition-colors focus:outline-2 focus:outline-gold"
              >
                Instagram @thepuppadnj
              </a>
            </p>
            <p>
              <a
                href="https://facebook.com/ThePupPad"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gold transition-colors focus:outline-2 focus:outline-gold"
              >
                Facebook — The Pup Pad
              </a>
            </p>
            <p>
              <a
                href="https://tiktok.com/@thepuppad"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gold transition-colors focus:outline-2 focus:outline-gold"
              >
                TikTok @thepuppad
              </a>
            </p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-white/15 text-xs text-white/50 text-center">
          &copy; {new Date().getFullYear()} The Pup Pad. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
