"use client";

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search as SearchIcon, X, ArrowRight } from "lucide-react";
import Link from 'next/link';
import { useSearchStore } from '@/store/useSearchStore';

interface SearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Search({ isOpen, onClose }: SearchProps) {
  const { query, setQuery, results, isLoading, fetchResults } = useSearchStore();
  const [recentItems, setRecentItems] = useState<any[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      const history = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
      setRecentItems(history);
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim()) fetchResults(query);
    }, 400); 
    return () => clearTimeout(timeoutId);
  }, [query, fetchResults]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[110] flex flex-col bg-[#F6F6F6] backdrop-blur-[20px]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-8 py-8">
            <span className="font-ntypeMono text-[10px] uppercase tracking-[0.2em] text-black/60">
              Search
            </span>
            <button onClick={onClose} className="p-2 hover:opacity-40 transition-opacity">
              <X strokeWidth={1} size={24} className="text-black" />
            </button>
          </div>

          <div className="mx-auto w-full max-w-5xl px-8 pt-12">
            {/* Input Section */}
            <div className="relative border-b border-black/10 pb-6">
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search Nothing..."
                className="w-full bg-transparent font-ntypeMono text-6xl md:text-8xl uppercase tracking-tighter outline-none placeholder:text-black/[0.05] text-black"
              />
              <div className="absolute right-0 top-1/2 -translate-y-1/2">
                {isLoading ? (
                  <div className="h-8 w-8 border-t border-black rounded-full animate-spin" />
                ) : (
                  <SearchIcon strokeWidth={1} size={32} className="text-black/40" />
                )}
              </div>
            </div>

            <div className="mt-16 overflow-y-auto max-h-[65vh] pr-4 custom-scrollbar pb-24">
              
              {/* RECENTLY VIEWED */}
              {query.length === 0 && recentItems.length > 0 && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                  <p className="font-ntypeMono text-[10px] uppercase tracking-[0.2em] text-black/60 mb-8">
                    Recently Viewed
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {recentItems.map((product) => (
                      <Link 
                        key={product.handle} 
                        href={`/products/${product.handle}`} 
                        onClick={onClose}
                        className="flex items-center gap-6 p-4 bg-white border border-black/[0.03] hover:border-black/20 transition-all group"
                      >
                        <div className="h-16 w-16 bg-[#F6F6F6] p-2 flex items-center justify-center">
                           {product.images?.edges?.[0]?.node?.url && (
                             <img src={product.images.edges[0].node.url} alt="" className="h-full w-full object-contain" />
                           )}
                        </div>
                        <h3 className="font-ndot text-sm uppercase text-black">{product.title}</h3>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* SEARCH RESULTS */}
              {results.length > 0 && (
                <div className="grid grid-cols-1 animate-in fade-in duration-300">
                  <p className="font-ntypeMono text-[10px] uppercase tracking-[0.2em] text-black/60 mb-8">
                    Results ({results.length})
                  </p>
                  {results.map((product: any) => (
                    <Link 
                      key={product.handle}
                      href={`/products/${product.handle}`}
                      onClick={onClose}
                      className="group flex items-center justify-between py-8 border-b border-black/[0.05] hover:bg-white transition-all px-6 -mx-6"
                    >
                      <div className="flex items-center gap-10">
                        <h3 className="font-ndot text-3xl uppercase text-black">{product.title}</h3>
                      </div>
                      <ArrowRight strokeWidth={1} size={28} className="text-black opacity-0 -translate-x-6 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    </Link>
                  ))}
                </div>
              )}

              {/* NO RESULTS */}
              {query.length > 0 && results.length === 0 && !isLoading && (
                <div className="py-32 text-center">
                   <p className="font-ntypeMono text-[10px] uppercase text-black/60 tracking-widest">
                     No results found for "{query}"
                   </p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}