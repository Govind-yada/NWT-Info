import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Shield, CheckCircle2, ArrowUpRight } from 'lucide-react';
import { WhatsAppIcon } from './WhatsAppIcon';
import { InstagramIcon, FacebookIcon } from './SocialIcons';

export const Footer = () => {
  return (
    <footer className="bg-navy-950 border-t border-slate-800/80 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800/60">

          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-blue to-brand-violet flex items-center justify-center shadow-glow-sm">
                <span className="font-extrabold text-white text-base tracking-wider">NW</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tight text-white">
                  NWT <span className="text-brand-electric">Info</span>
                </span>
                <span className="text-[10px] tracking-widest text-slate-400 font-medium uppercase -mt-1">
                  Next World Tech
                </span>
              </div>
            </Link>

            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              Next-generation digital services, enterprise web applications, and custom cloud software. We engineer scalable technology solutions backed by our transparent 30% advance booking model.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span>Razorpay Secured</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                <span>ISO Quality Standards</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-200">Company</h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>
                <Link to="/" className="hover:text-white transition">Home</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition">About Us</Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-white transition">Services & Pricing</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition">Contact Us</Link>
              </li>
            </ul>
          </div>

          {/* Digital Services */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-200">Services</h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>
                <Link to="/services/website-development" className="hover:text-white transition">Website Development</Link>
              </li>
              <li>
                <Link to="/services/software-development" className="hover:text-white transition">Software Development</Link>
              </li>
              <li>
                <Link to="/services/mobile-app-development" className="hover:text-white transition">Mobile Apps</Link>
              </li>
              <li>
                <Link to="/services/seo-smo" className="hover:text-white transition">SEO & SMO</Link>
              </li>
              <li>
                <Link to="/services/branding-campaign-management" className="hover:text-white transition">Branding & Campaigns</Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-200">Connect</h4>
            <div className="space-y-3 text-sm text-slate-400">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-brand-electric shrink-0 mt-0.5" />
                <span>NWT Cyber Hub, Indiranagar 100ft Road, Bangalore 560038</span>
              </div>
              <a
                href="https://wa.me/917859088239?text=Hello%20NWT%20Info%2C%20I%20would%20like%20to%20discuss%20a%20project."
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 text-emerald-400 hover:text-emerald-300 font-medium transition group"
                title="Chat on WhatsApp (+91 7859088239)"
              >
                <WhatsAppIcon className="w-4 h-4 fill-current shrink-0 text-[#25D366] group-hover:scale-110 transition-transform" />
                <span>WhatsApp: +91 7859088239</span>
              </a>
              <a
                href="tel:+917859088239"
                className="flex items-center gap-2.5 hover:text-white transition"
              >
                <Phone className="w-4 h-4 text-brand-electric shrink-0" />
                <span>+91 7859088239</span>
              </a>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-brand-electric shrink-0" />
                <span>contact@nwtinfo.com</span>
              </div>
              <a
                href="https://www.instagram.com/nwtinfotech?utm_source=qr&mdxt=ZjhuMzVkN296bmFy"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 text-pink-400 hover:text-pink-300 font-medium transition group"
                title="Follow us on Instagram (@nwtinfotech)"
              >
                <InstagramIcon className="w-4 h-4 fill-current shrink-0 group-hover:scale-110 transition-transform" />
                <span>Instagram: @nwtinfotech</span>
              </a>
              <a
                href="https://www.facebook.com/share/19qZ84VoMM/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 text-blue-400 hover:text-blue-300 font-medium transition group"
                title="Follow us on Facebook"
              >
                <FacebookIcon className="w-4 h-4 fill-current shrink-0 group-hover:scale-110 transition-transform" />
                <span>Facebook: NWT Info</span>
              </a>
              <div className="pt-2">
                <Link
                  to="/login?admin=true"
                  className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300 transition"
                >
                  Admin Terminal <ArrowUpRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} NWT Info (Next World Tech). All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a
              href="https://www.instagram.com/nwtinfotech?utm_source=qr&mdxt=ZjhuMzVkN296bmFy"
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-pink-400 hover:text-white hover:bg-pink-600 transition"
              title="Instagram Profile"
              aria-label="Instagram Profile"
            >
              <InstagramIcon className="w-3.5 h-3.5 fill-current" />
            </a>
            <a
              href="https://www.facebook.com/share/19qZ84VoMM/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-blue-400 hover:text-white hover:bg-blue-600 transition"
              title="Facebook Profile"
              aria-label="Facebook Profile"
            >
              <FacebookIcon className="w-3.5 h-3.5 fill-current" />
            </a>
            <a
              href="https://wa.me/917859088239"
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-emerald-400 hover:text-white hover:bg-emerald-600 transition"
              title="WhatsApp Chat"
              aria-label="WhatsApp Chat"
            >
              <WhatsAppIcon className="w-3.5 h-3.5 fill-current" />
            </a>
            <span className="text-slate-700">|</span>
            <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-400 cursor-pointer">Terms of Service</span>
            <span className="hover:text-slate-400 cursor-pointer">30% Advance Policy</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
