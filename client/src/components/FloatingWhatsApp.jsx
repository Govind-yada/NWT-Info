import React from 'react';
import { WhatsAppIcon } from './WhatsAppIcon';

export const FloatingWhatsApp = () => {
  return (
    <aside aria-label="WhatsApp quick chat" className="fixed bottom-6 right-6 z-40 flex items-center group">
      {/* Tooltip on hover */}
      <div className="mr-3 px-3.5 py-1.5 rounded-xl bg-navy-900/95 border border-emerald-500/40 text-white text-xs font-medium shadow-2xl opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 pointer-events-none whitespace-nowrap flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        <span>Chat with us on WhatsApp</span>
      </div>

      {/* Floating Action Button */}
      <a
        href="https://wa.me/917859088239?text=Hello%20NWT%20Info%2C%20I%20would%20like%20to%20discuss%20a%20project."
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp (+91 7859088239)"
        className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-[0_4px_24px_rgba(37,211,102,0.45)] hover:shadow-[0_6px_32px_rgba(37,211,102,0.65)] hover:scale-110 active:scale-95 transition-all duration-300 relative"
      >
        <WhatsAppIcon className="w-7 h-7 fill-white" />
        
        {/* Pulse ring animation */}
        <span className="absolute -inset-1 rounded-full bg-[#25D366] opacity-30 animate-ping -z-10 pointer-events-none"></span>
      </a>
    </aside>
  );
};
