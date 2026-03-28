"use client";

import { motion } from 'framer-motion';
import { CaretLeft, CaretRight } from "@phosphor-icons/react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-col items-center gap-6 mt-20 pb-10">
      {/* Page Indicator */}
      <div className="font-ntypeMono text-[10px] uppercase tracking-[0.3em] text-black/40">
        Page <span className="text-black font-bold">{currentPage}</span> of {totalPages}
      </div>

      <div className="flex items-center gap-8">
        {/* Previous Button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="group flex items-center gap-2 disabled:opacity-10 disabled:cursor-not-allowed transition-all"
        >
          <CaretLeft size={16} weight="bold" />
          <span className="font-ndot text-[11px] uppercase tracking-widest pt-0.5 border-b border-transparent group-hover:border-black transition-all">
            Prev
          </span>
        </button>

        {/* Minimalist Dots */}
        <div className="flex gap-2">
          {[...Array(totalPages)].map((_, i) => (
            <div
              key={i}
              className={`h-1 transition-all duration-500 rounded-full ${
                currentPage === i + 1 ? 'w-8 bg-black' : 'w-1 bg-black/10'
              }`}
            />
          ))}
        </div>

        {/* Next Button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="group flex items-center gap-2 disabled:opacity-10 disabled:cursor-not-allowed transition-all"
        >
          <span className="font-ndot text-[11px] uppercase tracking-widest pt-0.5 border-b border-transparent group-hover:border-black transition-all">
            Next
          </span>
          <CaretRight size={16} weight="bold" />
        </button>
      </div>
    </div>
  );
}