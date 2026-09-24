import { Link } from "react-router-dom";
import { Mail, MapPin, MessageCircle } from "lucide-react";
import Logo from "./Logo";
import { SITE } from "@/lib/site";

const columns = [
  {
    heading: "Our Work",
    links: [
      { to: "/programs", label: "Programs" },
      { to: "/impact", label: "Impact & Strategic Plan" },
      { to: "/events", label: "Beach Cleanup Events" },
      { to: "/gallery", label: "Gallery" },
    ],
  },
  {
    heading: "Get Involved",
    links: [
      { to: "/get-involved", label: "Volunteer" },
      { to: "/partner-with-us", label: "Partner With Us" },
      { to: "/donate", label: "Donate" },
      { to: "/communities", label: "Communities" },
    ],
  },
  {
    heading: "Organisation",
    links: [
      { to: "/about", label: "About Us" },
      { to: "/contact", label: "Contact" },
    ],
  },
];

const Footer = () => (
  <footer className="bg-slate-950 text-slate-300">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 grid gap-10 md:grid-cols-2 lg:grid-cols-5">
      <div className="lg:col-span-2 space-y-4">
        <Link to="/" className="inline-block [&_span]:text-white">
          <Logo size="md" />
        </Link>
        <p className="text-sm leading-relaxed max-w-sm">
          A Ghanaian NGO restoring and protecting Ghana's coastline through community-led beach cleanups,
          plastic recovery and ocean education.
        </p>
        <ul className="space-y-2 text-sm">
          <li className="flex items-start gap-2">
            <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-sky-400" aria-hidden />
            {SITE.location}
          </li>
          <li className="flex items-start gap-2">
            <Mail className="h-4 w-4 mt-0.5 shrink-0 text-sky-400" aria-hidden />
            <a href={`mailto:${SITE.email}`} className="hover:text-white break-all">{SITE.email}</a>
          </li>
          <li className="flex items-start gap-2">
            <MessageCircle className="h-4 w-4 mt-0.5 shrink-0 text-sky-400" aria-hidden />
            <a href={`https://wa.me/${SITE.phones[0].wa}`} target="_blank" rel="noopener noreferrer" className="hover:text-white">
              WhatsApp {SITE.phones[0].display}
            </a>
          </li>
        </ul>
      </div>
      {columns.map((col) => (
        <nav key={col.heading} aria-label={col.heading}>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">{col.heading}</h2>
          <ul className="space-y-2.5 text-sm">
            {col.links.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="hover:text-white transition-colors">{l.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
      ))}
    </div>
    <div className="border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 text-xs text-slate-400 flex flex-col sm:flex-row gap-2 justify-between">
        <p>© {new Date().getFullYear()} {SITE.name}. {SITE.registration}.</p>
        <p>Accra, Ghana</p>
      </div>
    </div>
  </footer>
);

export default Footer;
