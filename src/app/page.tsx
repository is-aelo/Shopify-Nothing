"use client";

import Header from '@/components/Header';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-black">
      {/* 1. Integrated System Header */}
      <Header />

      {/* 2. Main Viewport: System_Entry */}
      <main className="flex-grow flex flex-col items-center justify-center p-6 min-h-[120vh]">
        
        {/* Hero Section: Technical Manifest */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center flex flex-col items-center"
        >
          <span className="font-ntypeMono text-[10px] tracking-[0.5em] text-white/20 uppercase mb-8">
            System_Status: Operational // Build_2026.03
          </span>
          
          <h1 className="font-ndot text-5xl md:text-8xl text-white uppercase leading-none tracking-tighter">
            REWIRED<br />
            <span className="text-white/10 italic">SYSTEMS</span>
          </h1>

          <div className="mt-12 h-px w-32 bg-white/20" />
          
          <p className="mt-12 font-ntypeMono text-[10px] text-white/40 uppercase tracking-[0.2em] max-w-[300px] leading-relaxed">
            High-performance hardware interface for the next generation of mobile computing.
          </p>

          {/* Core Navigation CTA */}
          <Link href="/products" className="group mt-16 relative overflow-hidden">
            <motion.div 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-6 border border-white/10 px-8 py-4 bg-white/5 hover:bg-white hover:text-black transition-all duration-500"
            >
              <span className="font-ntypeMono text-xs uppercase tracking-widest">
                Access_Inventory
              </span>
              <ArrowRight 
                size={18} 
                strokeWidth={1} 
                className="group-hover:translate-x-1 transition-transform" 
              />
            </motion.div>
          </Link>
        </motion.div>

        {/* Scroll Indicator: Testing Backdrop Blur Contrast */}
        <div className="mt-[40vh] w-full max-w-4xl opacity-10 flex flex-col items-center">
           <div className="h-[200px] w-px bg-gradient-to-b from-white via-white/50 to-transparent" />
           <p className="font-ntypeMono text-[9px] uppercase tracking-[0.4em] mt-8 text-white">
             Continuity_Scroll
           </p>
        </div>
      </main>

      {/* 3. System Footer: Global Manifest */}
      <footer className="p-10 border-t border-white/5 bg-black">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <p className="font-ndot text-[9px] text-white/20 uppercase tracking-[0.2em]">
            Nothing (R) OS v1.0.0 // Headless_Instance_Verified
          </p>
          
          <div className="flex gap-8">
            <span className="font-ntypeMono text-[9px] text-white/10 uppercase tracking-widest hover:text-white transition-colors cursor-help">
              Protocol_v4
            </span>
            <span className="font-ntypeMono text-[9px] text-white/10 uppercase tracking-widest hover:text-white transition-colors cursor-help">
              Legal_Disclaimer
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}