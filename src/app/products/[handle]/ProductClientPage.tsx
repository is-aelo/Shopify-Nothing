"use client";

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Breadcrumbs from '@/components/Breadcrumbs';
import ProductGallery from '@/components/ProductGallery';
import ProductInfo from '@/components/ProductInfo';
import ProductActionMenu from '@/components/ProductActionMenu';
import ProductDetailSkeleton from '@/components/ProductDetailSkeleton';

export default function ProductClientPage({ product }: { product: any }) {
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);

  useEffect(() => {
    if (product) {
      // Set initial variant from the first edge
      setSelectedVariant(product?.variants?.edges?.[0]?.node || null);
      
      // Subtle delay para smooth ang transition mula skeleton to content
      const timer = setTimeout(() => setLoading(false), 500); 
      return () => clearTimeout(timer);
    }
  }, [product]);

  // --- DERIVED STATES FOR PRICING ---
  const price = selectedVariant?.price;
  const compareAtPrice = selectedVariant?.compareAtPrice;
  
  const isOnSale = compareAtPrice && price 
    ? Number(compareAtPrice.amount) > Number(price.amount) 
    : false;
    
  const savingsAmount = isOnSale && price && compareAtPrice 
    ? (Number(compareAtPrice.amount) - Number(price.amount)) * quantity 
    : 0;

  /**
   * DIRECT CHECKOUT LOGIC
   * Bypasses the cart and sends the user straight to Shopify Checkout
   */
  const handleBuyNow = () => {
    if (!selectedVariant) return;
    // Extract numerical ID from Shopify GID (e.g., gid://shopify/ProductVariant/12345 -> 12345)
    const variantId = selectedVariant.id.split('/').pop();
    const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
    const checkoutUrl = `https://${domain}/cart/${variantId}:${quantity}`;
    window.location.href = checkoutUrl;
  };

  // 1. LOADING / SKELETON VIEW
  if (loading || !product) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-white pt-24 md:pt-32 pb-44 px-4 md:px-8">
           <ProductDetailSkeleton />
        </main>
      </>
    );
  }

  // 2. ACTUAL PRODUCT INTERFACE
  return (
    <>
      <Header />
      <main className="min-h-screen bg-white pt-24 md:pt-32 pb-44 px-4 md:px-8">
        <div className="max-w-[1440px] mx-auto">
          
          {/* NAVIGATION */}
          <div className="mb-8 md:mb-12">
            <Breadcrumbs />
          </div>

          {/* PRODUCT GRID LAYOUT
              Using Nothing (R) inspired spacing and grid proportions
          */}
          <div className="grid grid-cols-1 lg:grid-cols-[80px_1fr_400px] xl:grid-cols-[100px_1fr_450px] gap-6 md:gap-8 xl:gap-20 items-start">
            
            {/* THUMBNAILS / GALLERY CONTROL */}
            <ProductGallery 
              product={product} 
              selectedVariant={selectedVariant} 
            />

            {/* PRIMARY PRODUCT INFO & DESCRIPTION */}
            <ProductInfo 
              product={product}
              selectedVariant={selectedVariant}
              setSelectedVariant={setSelectedVariant}
            />

          </div>
        </div>

        {/* STICKY ACTION MENU
            Dito natin pinasa ang 'product' prop para ma-fix ang 'id' undefined error.
        */}
        {selectedVariant && (
          <ProductActionMenu 
            product={product} // <--- ETO ANG KRITIKAL NA FIX
            quantity={quantity}
            setQuantity={setQuantity}
            selectedVariant={selectedVariant}
            isOnSale={isOnSale}
            savingsAmount={savingsAmount}
            price={price}
            handleBuyNow={handleBuyNow}
          />
        )}
      </main>
    </>
  );
}