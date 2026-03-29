"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Search as SearchIcon, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import BrandLogo from './BrandLogo';
import Navigation from './Navigation';
import Search from './Search';
import { useCartStore } from '@/store/useCartStore';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Zustand states
  const openCart = useCartStore((state) => state.openCart);
  const cartItems = useCartStore((state) => state.cartItems);
  
  // Calculate total items in basket
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

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
          
          {/* ── LEFT: Navigation & Discovery ──────────────── */}
          <div className="flex items-center justify-start gap-1">
            <button
              onClick={() => setIsMenuOpen(true)}
              className="group flex flex-col gap-[3.5px] p-2 transition-all active:scale-90"
              aria-label="Menu"
            >
              <span className="h-[1.2px] w-5 bg-black" />
              <span className="h-[1.2px] w-3 bg-black transition-all group-hover:w-5" />
            </button>

            <IconButton label="Search" onClick={() => setIsSearchOpen(true)}>
              <SearchIcon size={20} strokeWidth={1.2} />
            </IconButton>
          </div>

          {/* ── CENTER: Brand_Identity ──────────────── */}
          <div className="flex justify-center">
            <div className={`transition-transform duration-500 ${scrolled ? 'scale-90' : 'scale-100'}`}>
              <BrandLogo variant="header" />
            </div>
          </div>

          {/* ── RIGHT: User_Portal ──────────────── */}
          <div className="flex justify-end items-center gap-1">
            {/* FIX: Inalis ang <Link> at pinalitan ng <a> tag.
                Ito ay para tumalon direkta sa Shopify at hindi i-intercept ng Next.js.
            */}
            <a 
              href="https://eloise-nothing.myshopify.com/account/login" 
              className={iconButtonBase} 
              aria-label="Account"
              rel="external"
              target="_top"
            >
              <User size={20} strokeWidth={1.2} />
            </a>

            <div className="relative">
              <IconButton label="Cart" onClick={openCart}>
                <ShoppingBag size={20} strokeWidth={1.2} />
              </IconButton>
              
              {/* Nothing-style badge logic */}
              <AnimatePresence>
                {cartCount > 0 && (
                  <motion.span 
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-black px-1 font-ntypeMono text-[8px] text-white pointer-events-none border border-white"
                  >
                    {cartCount > 99 ? '99+' : cartCount}
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