"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

export default function Breadcrumbs() {
  const pathname = usePathname();
  
  // Hatiin ang URL path (e.g., /products/ear-stick -> ['products', 'ear-stick'])
  const pathSegments = pathname.split('/').filter((segment) => segment !== "");

  return (
    <nav aria-label="Breadcrumb" className="flex items-center">
      <ol className="flex items-center space-x-2 md:space-x-3 font-ntypeMono text-[9px] md:text-[10px] tracking-[0.2em] uppercase">
        
        {/* 1. HOME SEGMENT (Dati ay INDEX) */}
        <li className="flex items-center">
          <Link 
            href="/" 
            className="text-black/40 hover:text-black transition-colors duration-300"
          >
            HOME
          </Link>
        </li>

        {/* 2. DYNAMIC SEGMENTS */}
        {pathSegments.map((segment, index) => {
          const href = `/${pathSegments.slice(0, index + 1).join('/')}`;
          const isLast = index === pathSegments.length - 1;
          
          // Linisin ang text (e.g., ear-stick -> EAR STICK)
          const label = segment.replace(/-/g, ' ');

          return (
            <li key={href} className="flex items-center space-x-2 md:space-x-3">
              <span className="text-black/10">/</span>
              {isLast ? (
                <motion.span 
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-black font-bold"
                >
                  {label}
                </motion.span>
              ) : (
                <Link 
                  href={href}
                  className="text-black/40 hover:text-black transition-colors duration-300"
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