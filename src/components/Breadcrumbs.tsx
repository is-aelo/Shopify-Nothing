"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

// Palette mapping:
// --black: #07080F
// --gray: #373B3B
// --grayish-white: #E1E2E3

export default function Breadcrumbs() {
  const pathname = usePathname();
  const pathSegments = pathname.split('/').filter((segment) => segment !== "");

  return (
    <nav aria-label="Breadcrumb" className="flex items-center overflow-hidden">
      <ol className="flex items-center space-x-2 md:space-x-4 font-ntypeMono text-[9px] md:text-[10px] tracking-[0.2em] uppercase">
        
        {/* 1. HOME SEGMENT */}
        <li className="flex items-center shrink-0">
          <Link 
            href="/" 
            className="text-[#373B3B] opacity-50 hover:opacity-100 hover:text-[#07080F] transition-all duration-300"
          >
            HOME
          </Link>
        </li>

        {/* 2. DYNAMIC SEGMENTS */}
        {pathSegments.map((segment, index) => {
          const href = `/${pathSegments.slice(0, index + 1).join('/')}`;
          const isLast = index === pathSegments.length - 1;
          const label = segment.replace(/-/g, ' ');

          return (
            <li key={href} className="flex items-center space-x-2 md:space-x-4 min-w-0">
              {/* Separator Slash - Using grayish-white */}
              <span className="text-[#E1E2E3] font-light text-[12px]">/</span>
              
              {isLast ? (
                <motion.span 
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  // Inapply ang truncation dito (line-clamp-1) para hindi umapaw
                  className="text-[#07080F] font-bold truncate max-w-[120px] md:max-w-[300px]"
                  title={label}
                >
                  {label}
                </motion.span>
              ) : (
                <Link 
                  href={href}
                  className="text-[#373B3B] opacity-50 hover:opacity-100 hover:text-[#07080F] transition-all duration-300 shrink-0"
                >
                  {label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}