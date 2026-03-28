"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, MagnifyingGlass, ShoppingBag } from "@phosphor-icons/react";
import Link from 'next/link';
import BrandLogo from './BrandLogo';
import Navigation from './Navigation';
import Search from './Search';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [cartCount] = useState(0); 
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen || isSearchOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMenuOpen, isSearchOpen]);

  return (
    <>
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)' }}
        className={`sticky top-0 z-50 w-full transition-all duration-300 backdrop-blur-xl ${
          scrolled ? 'border-b border-black/[0.04] py-2' : 'border-b border-transparent py-4'
        }`}
      >
        <div className="mx-auto grid max-w-7xl grid-cols-3 items-center px-4 sm:px-6 lg:px-8">
          
          {/* ── LEFT: Navigation & Discovery (Menu + Search) ──────────────── */}
          <div className="flex items-center justify-start gap-1">
            <button
              onClick={() => setIsMenuOpen(true)}
              className="group flex flex-col gap-[3.5px] p-2 transition-all active:scale-90"
              aria-label="Menu"
            >
              <span className="h-[1.2px] w-5 bg-black" />
              <span className="h-[1.2px] w-3 bg-black transition-all group-hover:w-5" />
            </button>

            {/* Search moved here for balance */}
            <IconButton label="Search" onClick={() => setIsSearchOpen(true)}>
              <MagnifyingGlass size={20} weight="thin" />
            </IconButton>
          </div>

          {/* ── CENTER: Brand_Identity ──────────────── */}
          <div className="flex justify-center">
            <div className={`transition-transform duration-500 ${scrolled ? 'scale-90' : 'scale-100'}`}>
              <BrandLogo variant="header" />
            </div>
          </div>

          {/* ── RIGHT: User_Portal (Account + Cart) ──────────────── */}
          <div className="flex justify-end items-center gap-1">
            <Link href="/account" className={iconButtonBase} aria-label="Account">
              <User size={20} weight="thin" />
            </Link>

            <div className="relative">
              <IconButton label="Cart">
                <ShoppingBag size={20} weight="thin" />
              </IconButton>
              
              {/* Nothing-style badge logic */}
              <AnimatePresence>
                {cartCount > 0 && (
                  <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute right-1 top-1 flex h-3.5 min-w-[0.875rem] items-center justify-center rounded-full bg-black px-1 font-ntypeMono text-[7px] text-white"
                  >
                    {cartCount > 9 ? '9+' : cartCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.header>

      <AnimatePresence mode="wait">
        {isMenuOpen && <Navigation key="nav" isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />}
        {isSearchOpen && <Search key="search" isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />}
      </AnimatePresence>
    </>
  );
}

// ── Shared Styling ──────────────────────────────────────────────────────────

const iconButtonBase = "flex h-9 w-9 items-center justify-center rounded-sm transition-all hover:bg-black/[0.03] active:scale-90 text-black";

function IconButton({ label, onClick, children }: { label: string; onClick?: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} aria-label={label} className={iconButtonBase}>
      {children}
    </button>
  );
}