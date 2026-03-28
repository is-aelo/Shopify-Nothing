"use client";

export default function ProductDetailSkeleton() {
  return (
    <div className="max-w-[1440px] mx-auto overflow-hidden">
      {/* Breadcrumbs Placeholder */}
      <div className="h-4 w-48 bg-[#F5F5F5] rounded-sm mb-12 animate-pulse" />

      <div className="grid grid-cols-1 lg:grid-cols-[80px_1fr_400px] xl:grid-cols-[100px_1fr_450px] gap-8">
        
        {/* Gallery Thumbnails */}
        <div className="hidden lg:flex flex-col gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="aspect-square w-full bg-[#F5F5F5] rounded-sm relative overflow-hidden">
               <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
            </div>
          ))}
        </div>

        {/* Main Image Container */}
        <div className="aspect-square bg-[#F5F5F5] rounded-sm border border-[#E1E2E3] relative overflow-hidden">
          {/* Main shimmer for the big box */}
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent" />
          
          {/* Inner "Product" Silhouette placeholder */}
          <div className="absolute inset-0 flex items-center justify-center">
             <div className="w-2/3 h-2/3 bg-[#E1E2E3]/50 rounded-full blur-2xl animate-pulse" />
          </div>
        </div>

        {/* Info Area */}
        <div className="flex flex-col gap-6 pt-2">
          {/* Brand/Category Tag */}
          <div className="h-4 w-20 bg-[#F5F5F5] rounded-full animate-pulse" />
          
          {/* Product Title Lines */}
          <div className="flex flex-col gap-3">
            <div className="h-10 w-full bg-[#F5F5F5] rounded-sm relative overflow-hidden">
               <div className="absolute inset-0 -translate-x-full animate-[shimmer_2.5s_infinite] bg-gradient-to-r from-transparent via-white/50 to-transparent" />
            </div>
            <div className="h-10 w-2/3 bg-[#F5F5F5] rounded-sm animate-pulse" />
          </div>

          {/* Price Placeholder */}
          <div className="h-8 w-32 bg-[#F5F5F5] rounded-sm mt-2 animate-pulse" />

          <div className="h-[1px] w-full bg-[#E1E2E3] my-4" />

          {/* Variant Selectors Placeholder */}
          <div className="flex flex-col gap-4">
             <div className="h-3 w-24 bg-[#F5F5F5] rounded-full animate-pulse" />
             <div className="flex gap-3">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="w-12 h-12 rounded-full border border-[#E1E2E3] bg-[#F5F5F5] animate-pulse" />
                ))}
             </div>
          </div>

          {/* Description Lines */}
          <div className="flex flex-col gap-2.5 mt-4">
            <div className="h-3 w-full bg-[#F5F5F5] rounded-full animate-pulse" />
            <div className="h-3 w-full bg-[#F5F5F5] rounded-full animate-pulse" />
            <div className="h-3 w-4/5 bg-[#F5F5F5] rounded-full animate-pulse" />
          </div>

          {/* Button Placeholder */}
          <div className="h-14 w-full bg-[#07080F]/5 rounded-full mt-auto animate-pulse" />
        </div>
      </div>

      {/* Tailwind Config required for the shimmer animation if not yet added */}
      <style jsx>{`
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
}