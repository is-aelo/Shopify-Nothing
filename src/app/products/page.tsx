"use client";

import { getAllProducts } from '@/lib/shopify';
import Link from 'next/link';
import { ArrowUpRight } from "@phosphor-icons/react";
import Header from '@/components/Header';
import Breadcrumbs from '@/components/Breadcrumbs'; 
import Pagination from '@/components/Pagination'; // Import Pagination
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ── Skeleton Card Component ─────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white p-10 h-[500px] flex flex-col border border-black/[0.08] relative overflow-hidden">
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-black/[0.03] to-transparent"
        animate={{ x: ['-100%', '100%'] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
      />
      <div className="aspect-square w-full mb-14 flex items-center justify-center bg-black/[0.03] rounded-sm" />
      <div className="mt-auto">
        <div className="flex justify-between items-end mb-6">
          <div className="h-8 w-2/3 bg-black/[0.05] rounded-sm" />
          <div className="h-10 w-10 rounded-full bg-black/[0.05]" />
        </div>
        <div className="flex justify-between items-center pt-5 border-t border-black/[0.05]">
          <div className="space-y-2">
            <div className="h-3 w-12 bg-black/[0.03]" />
            <div className="h-6 w-24 bg-black/[0.05]" />
          </div>
          <div className="h-9 w-36 rounded-full bg-black/[0.05]" />
        </div>
      </div>
    </div>
  );
}

// ── Add to Basket Component ─────────────────────────────────────────────────
function AddToBasketButton() {
  const [hovered, setHovered] = useState(false);
  const [added, setAdded] = useState(false);

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (added) return;
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      setHovered(false);
    }, 2200);
  }

  const isExpanded = hovered || added;

  return (
    <motion.button
      aria-label="Add to basket"
      onHoverStart={() => !added && setHovered(true)}
      onHoverEnd={() => !added && setHovered(false)}
      onClick={handleClick}
      animate={{
        width: isExpanded ? 145 : 36,
        backgroundColor: added ? '#000' : isExpanded ? '#000' : '#fff',
        borderColor: added ? '#000' : isExpanded ? '#000' : 'rgba(0,0,0,0.08)',
      }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="relative pointer-events-auto h-9 rounded-full border flex items-center justify-center overflow-hidden shrink-0"
      style={{ minWidth: 36 }}
    >
      <motion.span
        className="flex items-center gap-2.5 px-3 whitespace-nowrap"
        animate={{ color: isExpanded ? '#fff' : '#000' }}
        transition={{ duration: 0.15 }}
      >
        <AnimatePresence mode="wait" initial={false}>
          {!added ? (
            <motion.span
              key="basket"
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              className="flex shrink-0 items-center justify-center"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="2" y="2" width="20" height="20" rx="2" stroke="currentColor" strokeWidth="1.8" />
                <path d="M7 9C7 9 9.5 13 12 13C14.5 13 17 9 17 9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </motion.span>
          ) : (
            <motion.span
              key="check"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="flex shrink-0 items-center justify-center"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 12L9 17L20 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </motion.span>
          )}
        </AnimatePresence>

        {isExpanded && (
          <motion.span
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            className="font-ndot text-[11px] uppercase tracking-[0.1em] leading-none pt-0.5"
          >
            {added ? 'Added!' : 'Add to Cart'}
          </motion.span>
        )}
      </motion.span>
    </motion.button>
  );
}

// ── Arrow Link Button ────────────────────────────────────────────────────────
function ArrowButton({ href }: { href: string }) {
  return (
    <div className="group/arrow p-2.5 border border-black/5 rounded-full bg-white hover:bg-black hover:text-white transition-all duration-300 pointer-events-auto">
      <Link href={href}>
        <ArrowUpRight
          size={20}
          weight="light"
          className="group-hover/arrow:translate-x-0.5 group-hover/arrow:-translate-y-0.5 transition-transform duration-300"
        />
      </Link>
    </div>
  );
}

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 10; 

  useEffect(() => {
    async function loadProducts() {
      try {
        const response = await getAllProducts();
        const fetchedProducts = response?.body?.data?.products?.edges?.map((edge: any) => edge.node) || [];
        setProducts(fetchedProducts);
      } catch (error) {
        console.error("Error loading products:", error);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  // 2. Logic para sa Pagination
  const totalPages = Math.ceil(products.length / productsPerPage);
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const formatCurrency = (amount: string, currencyCode: string) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: currencyCode || 'PHP',
      maximumFractionDigits: 0,
    }).format(Number(amount));
  };

  return (
    <>
      <Header />

      <main className="min-h-screen bg-white pt-24 md:pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          
          <div className="mb-8">
             <Breadcrumbs />
          </div>

          {/* Catalog Header */}
          <div className="border-b border-black/[0.08] pb-12 mb-12 flex justify-between items-end">
            <div>
              <h1 className="font-ndot text-5xl md:text-7xl uppercase text-black tracking-tighter leading-none">
                Ecosystem
              </h1>
            </div>
            <div className="text-right hidden md:block leading-none">
              <p className="font-ntypeMono text-[10px] text-black/40 uppercase tracking-widest">
                {loading ? "---" : products.length} <br /> 
                <span className="opacity-50 text-[8px]">Products</span>
              </p>
            </div>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-black/[0.08] border border-black/[0.08]">
            {loading ? (
              [...Array(6)].map((_, i) => (
                <SkeletonCard key={i} />
              ))
            ) : (
              currentProducts.map((product: any) => {
                const variant = product.variants?.edges?.[0]?.node;
                const price = variant?.price;
                const compareAtPrice = variant?.compareAtPrice;
                const image = product.images?.edges?.[0]?.node;
                const isOnSale = compareAtPrice && Number(compareAtPrice.amount) > Number(price?.amount);
                const discountPercent = isOnSale 
                  ? Math.round(((Number(compareAtPrice.amount) - Number(price.amount)) / Number(compareAtPrice.amount)) * 100)
                  : 0;

                return (
                  <div key={product.id} className="group/card bg-white p-10 flex flex-col transition-all duration-500 relative overflow-hidden hover:z-10">
                    <Link href={`/products/${product.handle}`} className="absolute inset-0 z-0" />
                    
                    {isOnSale && (
                      <div className="absolute top-6 left-6 z-10">
                        <span className="bg-black text-white font-ndot text-[11px] px-3 py-2 uppercase tracking-widest leading-none rounded-sm">
                          {discountPercent}% OFF
                        </span>
                      </div>
                    )}

                    <div className="aspect-square w-full mb-14 flex items-center justify-center overflow-hidden pointer-events-none">
                      <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.8 }} className="w-full h-full flex items-center justify-center">
                        {image?.url ? (
                          <img src={image.url} alt={product.title} className="w-[85%] h-[85%] object-contain mix-blend-multiply" />
                        ) : (
                          <div className="font-ntypeMono text-[10px] opacity-10 italic uppercase">NO_ASSET</div>
                        )}
                      </motion.div>
                    </div>

                    <div className="mt-auto relative z-10 pointer-events-none">
                      <div className="flex justify-between items-end mb-6">
                        <h2 className="font-ndot text-2xl uppercase text-black leading-[1.1] max-w-[75%]">
                          {product.title}
                        </h2>
                        <div className="pointer-events-auto">
                           <ArrowButton href={`/products/${product.handle}`} />
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-5 border-t border-black/[0.05]">
                        <div className="flex flex-col">
                          {isOnSale && (
                            <span className="font-ndot text-[12px] text-black/30 line-through tracking-tighter mb-0.5">
                              {formatCurrency(compareAtPrice.amount, compareAtPrice.currencyCode)}
                            </span>
                          )}
                          <span className="font-ndot text-xl text-black tracking-tight leading-none">
                            {price ? formatCurrency(price.amount, price.currencyCode) : 'TBD'}
                          </span>
                        </div>
                        <div className="pointer-events-auto">
                          <AddToBasketButton />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Pagination Integration */}
          {!loading && (
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