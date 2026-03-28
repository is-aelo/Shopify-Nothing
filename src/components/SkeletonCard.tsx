"use client";

import { motion } from 'framer-motion';

// Palette mapping reference:
// --white: #F5F5F5 (Background fallback)
// --pure-white: #FFFFFF (Main background)
// --grayish-white: #E1E2E3 (Skeleton blocks & borders)

export function SkeletonCard() {
  return (
    <div className="bg-[#FFFFFF] p-4 md:p-10 h-[450px] md:h-[500px] flex flex-col border border-[#E1E2E3] relative overflow-hidden">
      
      {/* Refined Shimmer Effect using --grayish-white */}
      <motion.div
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(225, 226, 227, 0.4) 50%, transparent 100%)',
        }}
        animate={{ x: ['-100%', '100%'] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }}
      />

      {/* Image Skeleton - Using --white (#F5F5F5) for subtle contrast */}
      <div className="aspect-square w-full mb-8 md:mb-14 flex items-center justify-center bg-[#F5F5F5] rounded-sm" />

      {/* Info Skeleton Container */}
      <div className="mt-auto relative z-0">
        <div className="flex justify-between items-start mb-4 md:mb-6">
          <div className="space-y-2 w-2/3">
             <div className="h-4 md:h-6 w-full bg-[#E1E2E3] rounded-sm" /> {/* Title Line 1 */}
             <div className="h-4 md:h-6 w-1/2 bg-[#E1E2E3] rounded-sm" />  {/* Title Line 2 */}
          </div>
          {/* Arrow Button Skeleton */}
          <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-[#E1E2E3] shrink-0" /> 
        </div>

        {/* Footer Divider using grayish-white */}
        <div className="flex justify-between items-center pt-4 md:pt-5 border-t border-[#E1E2E3]">
          <div className="space-y-2">
            <div className="h-2 md:h-3 w-12 bg-[#F5F5F5]" /> {/* Compare At Price */}
            <div className="h-5 md:h-6 w-20 md:w-24 bg-[#E1E2E3]" /> {/* Current Price */}
          </div>
          
          {/* Thumb-friendly Cart Button Skeleton (Perfect Circle) */}
          <div className="h-10 w-10 md:h-9 md:w-9 rounded-full bg-[#E1E2E3] shrink-0" />
        </div>
      </div>
    </div>
  );
}

/**
 * REUSABLE GRID WRAPPER
 */
export default function ProductGridSkeleton({ count = 10 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-0 border-l border-[#E1E2E3]">
      {[...Array(count)].map((_, i) => (
        <SkeletonCard key={`skeleton-${i}`} />
      ))}
    </div>
  );
}