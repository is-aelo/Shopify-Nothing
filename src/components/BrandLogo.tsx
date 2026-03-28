"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';

interface LogoProps {
  variant?: 'header' | 'footer';
}

export default function BrandLogo({ variant = 'header' }: LogoProps) {
  const isFooter = variant === 'footer';

  return (
    <Link 
      href="/" 
      className={`
        font-ndotCaps text-black transition-opacity hover:opacity-50 inline-block
        ${isFooter 
          ? 'text-3xl md:text-5xl tracking-[0.15em] md:tracking-[0.2em]' 
          : 'text-lg md:text-xl tracking-[0.05em] md:tracking-[0.1em]'
        }
      `}
    >
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="flex items-center"
      >
        NOTHING <span className="ml-1 md:ml-1.5 opacity-80">(R)</span>
      </motion.span>
    </Link>
  );
}