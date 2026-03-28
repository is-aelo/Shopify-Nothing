"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { List, MagnifyingGlass, ShoppingBag } from "@phosphor-icons/react";
import BrandLogo from './BrandLogo';
import Navigation from './Navigation';
import Search from './Search'; // Import the new Search component

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <>
      <motion.nav 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="sticky top-0 z-50 w-full border-b border-black/5 bg-white/70 backdrop-blur-xl"
      >
        <div className="mx-auto grid max-w-7xl grid-cols-3 items-center px-6 py-3">
          
          {/* Left: Menu Trigger */}
          <div className="flex items-center justify-start">
            <button 
              onClick={() => setIsMenuOpen(true)}
              className="p-2 -ml-2 transition-opacity hover:opacity-50"
            >
              <List size={22} weight="thin" className="text-black" />
            </button>
          </div>

          {/* Center: Brand Identity */}
          <div className="flex justify-center">
            <BrandLogo variant="header" />
          </div>

          {/* Right: Actions */}
          <div className="flex items-center justify-end gap-3 md:gap-4">
            {/* Search Trigger */}
            <button 
              onClick={() => setIsSearchOpen(true)}
              className="p-2 transition-opacity hover:opacity-50"
            >
              <MagnifyingGlass size={20} weight="thin" className="text-black" />
            </button>
            
            <motion.button 
              whileHover={{ scale: 0.98 }}
              whileTap={{ scale: 0.95 }}
              className="group flex items-center gap-2 border border-black/10 px-3 py-1.5 transition-all hover:bg-black hover:text-white"
            >
              <ShoppingBag size={18} weight="thin" className="group-hover:text-white" />
              <span className="font-ndot text-[10px] uppercase tracking-tighter">
                Cart [0]
              </span>
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* Full-Screen Navigation Overlay */}
      <Navigation 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)} 
      />

      {/* Full-Screen Search Overlay */}
      <Search 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
      />
    </>
  );
}