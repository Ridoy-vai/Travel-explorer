import {
  MapPin,
  Phone,
  Mail,
  Instagram,
  Facebook,
  Youtube,
  Linkedin,
} from "lucide-react";

/**
 * Footer
 * ------
 * Static 4-column footer: Contact Info, About Us, Support, Safe Payment.
 * All content below is placeholder copy/links — swap hrefs and text for
 * your real routes (About, FAQs, Terms, etc.) and contact details.
 */

interface FooterLink {
  label: string;
  href: string;
  muted?: boolean; // for the greyed-out "our story" style link
}

const aboutLinks: FooterLink[] = [
  { label: "Our story", href: "/about", muted: true },
  { label: "Traveler Blog & Tips", href: "/blog" },
  { label: "Destination", href: "/destinations" },
  { label: "Tours", href: "/tours" },
  { label: "Packages", href: "/packages" },
];

const supportLinks: FooterLink[] = [
  { label: "FAQs", href: "/faqs" },
  { label: "Terms & Conditions", href: "/terms" },
  { label: "Contact us", href: "/contact" },
  { label: "Escrow Code", href: "/escrow-code" },
  { label: "Complaints Book", href: "/complaints-book" },
];

const socialLinks = [
  { icon: Instagram, href: "https://instagram.com", label: "Instagram" },
  { icon: TikTokIcon, href: "https://tiktok.com", label: "TikTok" },
  { icon: Facebook, href: "https://facebook.com", label: "Facebook" },
  { icon: Youtube, href: "https://youtube.com", label: "YouTube" },
  { icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn" },
  { icon: XIcon, href: "https://x.com", label: "X" },
];

const paymentBadges = [
  { label: "VISA", classes: "text-blue-700" },
  { label: "Mastercard", classes: "text-orange-600" },
  { label: "AMEX", classes: "text-blue-500" },
  { label: "Discover", classes: "text-orange-500" },
];

export default function Footer() {
  return (
    <footer className="border-t border-slate-100 bg-white px-6 py-14">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
        {/* Contact Info */}
        <div>
          <h3 className="mb-5 text-lg font-bold text-slate-800">Contact Info</h3>

          <ul className="space-y-4 text-slate-500">
            <li className="flex items-start gap-3">
              <MapPin size={18} className="mt-0.5 flex-none text-slate-400" />
              <span>Av. Pasaje Tello 163, Miraflores 15074</span>
            </li>
            <li className="flex items-center gap-3">
              <Phone size={18} className="flex-none text-slate-400" />
              <a href="tel:+51980538470" className="hover:text-blue-600">
                + 51 980538470
              </a>
            </li>
            <li className="flex items-center gap-3">
              <Mail size={18} className="flex-none text-slate-400" />
              <a href="mailto:info@travelbuddiesperu.com" className="hover:text-blue-600">
                info@travelbuddiesperu.com
              </a>
            </li>
          </ul>

          <div className="mt-6">
            <p className="mb-2 font-semibold text-slate-800">Languages</p>
            <select
              defaultValue="en"
              className="w-full max-w-[180px] rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 focus:border-blue-500 focus:outline-none"
            >
              <option value="en">🇬🇧 English</option>
              <option value="es">🇪🇸 Español</option>
            </select>
          </div>

          <div className="mt-6">
            <p className="mb-3 font-semibold text-slate-800">Follow</p>
            <div className="flex items-center gap-4">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="text-blue-500 transition-colors hover:text-blue-700"
                >
                  <Icon size={20} />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* About Us */}
        <div>
          <h3 className="mb-5 text-lg font-bold text-slate-800">About Us</h3>
          <ul className="space-y-4">
            {aboutLinks.map(({ label, href, muted }) => (
              <li key={label}>
                <a
                  href={href}
                  className={
                    muted
                      ? "text-slate-300 hover:text-slate-400"
                      : "font-medium text-slate-800 hover:text-blue-600"
                  }
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Support */}
        <div>
          <h3 className="mb-5 text-lg font-bold text-slate-800">Support</h3>
          <ul className="space-y-4">
            {supportLinks.map(({ label, href }) => (
              <li key={label}>
                <a href={href} className="font-medium text-slate-800 hover:text-blue-600">
                  {label}
                </a>
              </li>
            ))}
          </ul>

          <a
            href="/complaints-book"
            className="mt-4 inline-flex flex-col items-center gap-1 text-center"
          >
            <span className="font-semibold text-blue-600">
              Libro de
              <br />
              Reclamaciones
            </span>
            <ComplaintsBookIcon />
          </a>
        </div>

        {/* Safe Payment */}
        <div>
          <h3 className="mb-5 text-lg font-bold text-slate-800">Safe Payment</h3>
          <p className="mb-5 leading-relaxed text-slate-500">
            The payment is encrypted and transmitted securely with an SSL protocol.
          </p>

          <div className="mb-6 flex flex-wrap items-center gap-3">
            {paymentBadges.map(({ label, classes }) => (
              <span
                key={label}
                className={`rounded border border-slate-200 px-2.5 py-1 text-xs font-bold ${classes}`}
              >
                {label}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <AgencyBadgeIcon />
            <p className="text-xs font-semibold leading-tight text-slate-700">
              AGENCIA DE VIAJES
              <br />
              REGISTRADA — OPERADOR
              <br />
              DE TURISMO
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ---------- small inline icons (kept local so this file is drop-in) ---------- */

function TikTokIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M16.5 2c.3 2.1 1.6 3.7 3.5 4v2.6c-1.3 0-2.5-.4-3.5-1.1v6.6a5.6 5.6 0 1 1-4.8-5.5v2.7a2.9 2.9 0 1 0 2.3 2.8V2h2.5z" />
    </svg>
  );
}

function XIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 3l7.4 9.1L3.4 21h2.4l5.9-6.8 4.6 6.8H21l-7.7-9.6L20.2 3h-2.4l-5.4 6.2L7.6 3H3z" />
    </svg>
  );
}

function ComplaintsBookIcon() {
  return (
    <svg width="48" height="36" viewBox="0 0 48 36" fill="none">
      <path
        d="M2 6c6-3 14-3 22 1 8-4 16-4 22-1v24c-6-3-14-3-22 1-8-4-16-4-22-1V6z"
        fill="#e2e8f0"
        stroke="#94a3b8"
      />
      <path d="M24 7v24" stroke="#94a3b8" />
    </svg>
  );
}

function AgencyBadgeIcon() {
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
      <circle cx="22" cy="22" r="3" fill="#1e293b" />
      {Array.from({ length: 16 }).map((_, i) => {
        const angle = (i * 360) / 16;
        return (
          <line
            key={i}
            x1="22"
            y1="22"
            x2={22 + 19 * Math.cos((angle * Math.PI) / 180)}
            y2={22 + 19 * Math.sin((angle * Math.PI) / 180)}
            stroke="#1e293b"
            strokeWidth="2"
            strokeLinecap="round"
          />
        );
      })}
      <circle cx="22" cy="22" r="8" fill="white" stroke="#1e293b" strokeWidth="1.5" />
    </svg>
  );
}