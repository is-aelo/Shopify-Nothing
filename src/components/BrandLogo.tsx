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
        font-ndotCaps tracking-[0.1em] text-black transition-opacity hover:opacity-70 inline-block
        ${isFooter ? 'text-4xl md:text-5xl tracking-[0.2em]' : 'text-xl md:text-2xl'}
      `}
    >
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        NOTHING <span>(R)</span>
      </motion.span>
    </Link>
  );
}