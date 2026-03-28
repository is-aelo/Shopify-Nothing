"use client";

import { motion } from 'framer-motion';

export function SkeletonCard() {
  return (
    <div className="bg-white p-10 h-[500px] flex flex-col border border-black/[0.08] relative overflow-hidden">
      {/* Pulse Overlay */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-black/[0.02] to-transparent"
        animate={{ x: ['-100%', '100%'] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
      />

      {/* Image Skeleton */}
      <div className="aspect-square w-full mb-14 flex items-center justify-center bg-black/[0.03] rounded-sm" />

      {/* Info Skeleton */}
      <div className="mt-auto">
        <div className="flex justify-between items-end mb-6">
          <div className="h-8 w-2/3 bg-black/[0.05] rounded-sm" /> {/* Title */}
          <div className="h-10 w-10 rounded-full bg-black/[0.05]" /> {/* Arrow Button */}
        </div>

        <div className="flex justify-between items-center pt-5 border-t border-black/[0.05]">
          <div className="space-y-2">
            <div className="h-3 w-12 bg-black/[0.03]" /> {/* Small Price */}
            <div className="h-6 w-24 bg-black/[0.05]" /> {/* Big Price */}
          </div>
          <div className="h-9 w-9 rounded-full bg-black/[0.05]" /> {/* Add Button */}
        </div>
      </div>
    </div>
  );
}