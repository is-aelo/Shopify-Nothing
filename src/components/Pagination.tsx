"use client";

import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTransition } from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
}

export default function Pagination({ currentPage, totalPages }: PaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  if (totalPages <= 1) return null;

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    
    // Ginagamit ang startTransition para hindi "mag-freeze" ang UI habang naglo-load
    startTransition(() => {
      router.push(`/products?${params.toString()}`, { scroll: true });
      // Pinipilit ang Server Component na mag-re-fetch ng data base sa bagong URL
      router.refresh();
    });
  };

  return (
    <div className={`flex flex-col items-center gap-6 mt-20 pb-10 transition-opacity ${isPending ? 'opacity-50' : 'opacity-100'}`}>
      {/* Page Indicator */}
      <div className="font-ntypeMono text-[10px] uppercase tracking-[0.3em] text-black/40">
        Page <span className="text-black font-bold">{currentPage}</span> of {totalPages}
      </div>

      <div className="flex items-center gap-8">
        {/* Previous Button */}
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1 || isPending}
          className="group flex items-center gap-2 disabled:opacity-10 disabled:cursor-not-allowed transition-all"
        >
          <ChevronLeft size={16} strokeWidth={2} className="text-black" />
          <span className="font-ndot text-[11px] uppercase tracking-widest pt-0.5 border-b border-transparent group-hover:border-black transition-all text-black">
            Prev
          </span>
        </button>

        {/* Minimalist Dots */}
        <div className="flex gap-2">
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              disabled={isPending}
              onClick={() => handlePageChange(i + 1)}
              className={`h-1 transition-all duration-500 rounded-full ${
                currentPage === i + 1 ? 'w-8 bg-black' : 'w-1 bg-black/10'
              }`}
            />
          ))}
        </div>

        {/* Next Button */}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages || isPending}
          className="group flex items-center gap-2 disabled:opacity-10 disabled:cursor-not-allowed transition-all"
        >
          <span className="font-ndot text-[11px] uppercase tracking-widest pt-0.5 border-b border-transparent group-hover:border-black transition-all text-black">
            Next
          </span>
          <ChevronRight size={16} strokeWidth={2} className="text-black" />
        </button>
      </div>
    </div>
  );
}