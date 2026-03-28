"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from "@phosphor-icons/react";

const NAV_LINKS = [
  { name: 'Shop All', href: '/products' }, // Updated to point to our new inventory page
  { name: 'Phones', href: '/phones' },
  { name: 'Audio', href: '/audio' },
  { name: 'Watches', href: '/watches' },
  { name: 'Accessories', href: '/accessories' },
  { name: 'CMF', href: '/cmf' },
];

interface NavigationProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Navigation({ isOpen, onClose }: NavigationProps) {
  const pathname = usePathname();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Subtle Grayscale Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] bg-white/20 backdrop-grayscale-[0.5] backdrop-blur-sm pointer-events-none"
          />

          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[100] flex flex-col bg-white/90 backdrop-blur-[40px] border-l border-black/5"
          >
            {/* Menu Header - Clean and Minimal */}
            <div className="flex items-center justify-between px-6 py-[18px]">
              <button onClick={onClose} className="p-2 -ml-2 hover:opacity-50 transition-opacity">
                <X size={22} weight="thin" className="text-black" />
              </button>
              <div className="w-[38px]" /> 
            </div>

            {/* Links Container - Left Aligned Indent */}
            <div className="flex flex-col items-start justify-center flex-grow pl-[10%] space-y-1">
              {NAV_LINKS.map((link, i) => {
                const isActive = pathname === link.href;

                return (
                  <motion.div
                    key={link.name}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 + 0.2 }}
                  >
                    <Link
                      href={link.href}
                      onClick={onClose}
                      className="group relative flex items-center py-2"
                    >
                      <span 
                        className={`font-ndotCaps text-5xl md:text-7xl tracking-tighter transition-all duration-500
                          ${isActive ? 'text-black' : 'text-gray/20 group-hover:text-black group-hover:pl-4'}`}
                      >
                        {link.name}
                      </span>
                      
                      {isActive && (
                        <motion.span 
                          layoutId="nav-pill"
                          className="ml-4 h-2 w-2 rounded-full bg-black"
                        />
                      )}
                    </Link>
                  </motion.div>
                );
              })}
            </div>

            {/* Bottom Utility - User Friendly Labels */}
            <div className="p-10 flex justify-between items-center border-t border-black/5">
               <div className="flex gap-10">
                {['Account', 'Support', 'Legal'].map((item) => (
                  <Link 
                    key={item} 
                    href={`/${item.toLowerCase()}`}
                    onClick={onClose}
                    className="font-ntype text-[10px] uppercase tracking-[0.2em] text-gray/60 hover:text-black transition-colors"
                  >
                    {item}
                  </Link>
                ))}
              </div>
              <p className="font-ntypeMono text-[10px] text-gray/40">© 2026</p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}