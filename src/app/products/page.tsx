"use client";

import { useEffect, useState } from 'react';
import { getAllProducts } from '@/lib/shopify';

// Layout Components
import Header from '@/components/Header';
import Breadcrumbs from '@/components/Breadcrumbs'; 
import Pagination from '@/components/Pagination';
import ProductCard from '@/components/ProductCard';

// ── Skeleton Card (Internal to avoid unnecessary files) ──────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white p-4 md:p-10 h-[300px] md:h-[500px] flex flex-col border border-black/[0.08] relative overflow-hidden">
      <div className="aspect-square w-full mb-4 md:mb-14 bg-black/[0.03] animate-pulse rounded-sm" />
      <div className="mt-auto space-y-3">
        <div className="h-4 md:h-6 w-2/3 bg-black/[0.05] animate-pulse rounded-sm" />
        <div className="h-8 md:h-10 w-full bg-black/[0.02] animate-pulse pt-4 border-t border-black/[0.05]" />
      </div>
    </div>
  );
}

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 12; // Adjusted to 12 para pantay sa 2-col at 3-col grids

  useEffect(() => {
    async function loadProducts() {
      try {
        const response = await getAllProducts();
        const fetchedProducts = response?.body?.data?.products?.edges?.map((edge: any) => edge.node) || [];
        setProducts(fetchedProducts);
      } catch (error) {
        console.error("Shopify Fetch Error:", error);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  // Pagination Logic
  const totalPages = Math.ceil(products.length / productsPerPage);
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <Header />

      <main className="min-h-screen bg-white pt-24 md:pt-32 pb-16 md:pb-20 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          
          {/* Navigation/Utility */}
          <div className="mb-6 md:mb-8">
             <Breadcrumbs />
          </div>

          {/* Catalog Header Section */}
          <div className="border-b border-black/[0.08] pb-8 md:pb-12 mb-8 md:mb-12 flex justify-between items-end">
            <div>
              <h1 className="font-ndot text-4xl sm:text-5xl md:text-7xl uppercase text-black tracking-tighter leading-none">
                Ecosystem
              </h1>
            </div>
            
            <div className="text-right hidden sm:block leading-none">
              <p className="font-ntypeMono text-[9px] md:text-[10px] text-black/40 uppercase tracking-[0.2em]">
                {loading ? "---" : products.length} <br /> 
                <span className="opacity-50 text-[7px] md:text-[8px]">Available_Assets</span>
              </p>
            </div>
          </div>

          {/* Product Grid - Set to 2 columns on mobile (grid-cols-2) */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-px bg-black/[0.08] border border-black/[0.08]">
            {loading ? (
              [...Array(6)].map((_, i) => (
                <SkeletonCard key={i} />
              ))
            ) : (
              currentProducts.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))
            )}
          </div>

          {/* Empty State */}
          {!loading && products.length === 0 && (
            <div className="py-40 text-center border border-black/[0.08] border-t-0">
              <p className="font-ndot text-black/20 uppercase tracking-widest text-sm">
                No products found in the ecosystem.
              </p>
            </div>
          )}

          {/* Pagination Controls */}
          {!loading && products.length > productsPerPage && (
            <Pagination 
              currentPage={currentPage} 
              totalPages={totalPages} 
              onPageChange={handlePageChange} 
            />
          )}
        </div>
      </main>
    </>
  );
}