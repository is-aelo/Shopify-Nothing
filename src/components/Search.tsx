"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MagnifyingGlass, X, ArrowRight, ClockCounterClockwise } from "@phosphor-icons/react";
import Link from 'next/link';
import { getSearchResults } from '@/lib/shopify';

interface SearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Search({ isOpen, onClose }: SearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [recentItems, setRecentItems] = useState<any[]>([]); // State for localStorage history
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load history from localStorage every time the search overlay opens
  useEffect(() => {
    if (isOpen) {
      const history = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
      setRecentItems(history);
      
      // Technical auto-focus delay for smooth transition
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Main Search Logic with Debouncing
  useEffect(() => {
    // If query is empty, clear results (UI will fallback to Recently Viewed)
    if (query.trim() === "") {
      setResults([]);
      return;
    }

    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const response = await getSearchResults(query);
        const products = response?.body?.data?.products?.edges?.map((edge: any) => edge.node) || [];
        setResults(products);
      } catch (err) {
        console.error("SEARCH_SYSTEM_ERROR:", err);
      } finally {
        setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchProducts, 300);
    return () => clearTimeout(timeoutId);
  }, [query]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[110] flex flex-col bg-white/95 backdrop-blur-[50px]"
        >
          {/* Technical Header */}
          <div className="flex items-center justify-between px-6 py-[18px]">
            <button onClick={onClose} className="p-2 -ml-2 hover:opacity-50 transition-opacity text-black">
              <X size={22} weight="thin" />
            </button>
            <span className="font-ntypeMono text-[10px] uppercase tracking-[0.3em] text-black/40">
              Terminal_Session: Global_Search
            </span>
            <div className="w-[38px]" /> 
          </div>

          <div className="mx-auto w-full max-w-4xl px-6 pt-20">
            {/* Command Line Input */}
            <div className="group relative border-b border-black/10 pb-4 focus-within:border-black transition-colors">
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="SEARCH_SYSTEM"
                className="w-full bg-transparent font-ntypeMono text-4xl md:text-6xl uppercase tracking-tighter outline-none placeholder:text-black/5 text-black"
              />
              <MagnifyingGlass 
                size={32} 
                weight="thin" 
                className={`absolute right-0 top-1/2 -translate-y-1/2 text-black ${isLoading ? 'animate-pulse' : ''}`} 
              />
            </div>

            <div className="mt-12 overflow-y-auto max-h-[60vh] pr-4 custom-scrollbar pb-20">
              
              {/* CASE 1: RECENTLY VIEWED (Displays when input is empty) */}
              {query.length === 0 && recentItems.length > 0 && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <div className="flex items-center gap-2 mb-6 opacity-40">
                    <ClockCounterClockwise size={14} />
                    <p className="font-ntypeMono text-[10px] uppercase tracking-widest">Recently_Viewed_Logs</p>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {recentItems.map((product) => (
                      <Link 
                        key={product.id} 
                        href={`/products/${product.handle}`} 
                        onClick={onClose}
                        className="group flex items-center justify-between border border-black/5 p-4 hover:bg-black transition-all"
                      >
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 bg-black/5 flex items-center justify-center grayscale group-hover:invert transition-all">
                             {product.images?.edges?.[0]?.node?.url && (
                               <img src={product.images.edges[0].node.url} alt="" className="h-[80%] w-[80%] object-contain" />
                             )}
                          </div>
                          <h3 className="font-ndot text-lg uppercase text-black group-hover:text-white transition-colors">{product.title}</h3>
                        </div>
                        <ArrowRight size={20} weight="thin" className="text-black group-hover:text-white opacity-0 group-hover:opacity-100 transition-all" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* CASE 2: SEARCH RESULTS (Displays when typing) */}
              {results.length > 0 && (
                <div className="grid grid-cols-1 gap-2 animate-in fade-in duration-300">
                  <p className="font-ntypeMono text-[10px] uppercase tracking-widest text-brandRed mb-4">
                    Matches_Found: {results.length.toString().padStart(2, '0')}
                  </p>
                  {results.map((product: any) => {
                    const image = product.images?.edges?.[0]?.node;
                    return (
                      <Link 
                        key={product.id}
                        href={`/products/${product.handle}`}
                        onClick={onClose}
                        className="group flex items-center justify-between border border-black/5 p-6 hover:bg-black transition-all"
                      >
                        <div className="flex items-center gap-6">
                          <div className="h-16 w-16 bg-black/5 flex items-center justify-center grayscale group-hover:grayscale-0 group-hover:bg-white/10 transition-all">
                            {image && <img src={image.url} alt="" className="h-[80%] w-[80%] object-contain mix-blend-multiply group-hover:invert transition-all" />}
                          </div>
                          <div>
                            <h3 className="font-ndot text-xl uppercase group-hover:text-white text-black transition-colors">{product.title}</h3>
                            <p className="font-ntypeMono text-[10px] text-black/40 group-hover:text-white/40 uppercase">UID: {product.handle}</p>
                          </div>
                        </div>
                        <ArrowRight size={24} weight="thin" className="text-black group-hover:text-white opacity-0 group-hover:opacity-100 transition-all" />
                      </Link>
                    );
                  })}
                </div>
              )}

              {/* CASE 3: NO RESULTS FOUND */}
              {query.length > 0 && results.length === 0 && !isLoading && (
                <div className="py-20 text-center border border-dashed border-black/10 animate-in zoom-in-95 duration-500">
                   <p className="font-ntypeMono text-[10px] uppercase text-black/40">! Error: No_Matching_Units_In_Database</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}