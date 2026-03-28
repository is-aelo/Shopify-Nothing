"use client";

import { useState, useEffect, useRef } from 'react';
import Header from '@/components/Header';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, CreditCard } from "@phosphor-icons/react";
import Zoom from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';

export default function ProductClientPage({ product }: { product: any }) {
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(product?.variants?.edges?.[0]?.node || null);

  // --- IMAGE GALLERY LOGIC ---
  const allImages = product.images?.edges?.map((edge: any) => edge.node.url) || [];
  const [currentMainImage, setCurrentMainImage] = useState(allImages[0]);
  const [mobileActiveIndex, setMobileActiveIndex] = useState(0);
  
  const mobileGalleryRef = useRef<HTMLDivElement>(null);
  const isInternalScrolling = useRef(false);

  const scrollToImage = (index: number) => {
    if (!mobileGalleryRef.current || index < 0 || index >= allImages.length) return;
    isInternalScrolling.current = true;
    const scrollLeft = mobileGalleryRef.current.offsetWidth * index;
    mobileGalleryRef.current.scrollTo({ left: scrollLeft, behavior: 'smooth' });
    setMobileActiveIndex(index);
    setCurrentMainImage(allImages[index]);
    setTimeout(() => { isInternalScrolling.current = false; }, 500);
  };

  useEffect(() => {
    const variantImageUrl = selectedVariant?.image?.url;
    if (variantImageUrl) {
      const index = allImages.indexOf(variantImageUrl);
      if (index !== -1 && index !== mobileActiveIndex) {
        scrollToImage(index);
      }
    }
  }, [selectedVariant]);

  const handleMobileScroll = () => {
    if (mobileGalleryRef.current && !isInternalScrolling.current) {
      const { scrollLeft, offsetWidth } = mobileGalleryRef.current;
      const index = Math.round(scrollLeft / offsetWidth);
      if (index !== mobileActiveIndex) {
        setMobileActiveIndex(index);
        setCurrentMainImage(allImages[index]);
      }
    }
  };

  // --- CHECKOUT LOGIC ---
  const handleBuyNow = () => {
    if (!selectedVariant) return;
    const variantId = selectedVariant.id.split('/').pop();
    const checkoutUrl = `https://${process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN}/cart/${variantId}:${quantity}`;
    window.location.href = checkoutUrl;
  };

  if (!product) return <div className="p-20 font-ndot uppercase text-center opacity-20 text-xs text-black">No Data Loaded</div>;

  const price = selectedVariant?.price;
  const compareAtPrice = selectedVariant?.compareAtPrice;
  const isOnSale = compareAtPrice && Number(compareAtPrice.amount) > Number(price?.amount);
  
  // Calculate Savings
  const savingsAmount = isOnSale ? (Number(compareAtPrice.amount) - Number(price.amount)) * quantity : 0;

  const formatPrice = (amt: string | number, code: string) => 
    new Intl.NumberFormat('en-PH', { 
      style: 'currency', 
      currency: code || 'PHP',
      maximumFractionDigits: 0 
    }).format(Number(amt));

  const handleOptionChange = (optionName: string, value: string) => {
    const updatedOptions = selectedVariant.selectedOptions.map((opt: any) => 
      opt.name === optionName ? { ...opt, value } : opt
    );
    const newVariant = product.variants.edges.find(({ node }: any) => 
      node.selectedOptions.every((opt: any) => updatedOptions.some((uo: any) => uo.name === opt.name && uo.value === opt.value)));
    if (newVariant) setSelectedVariant(newVariant.node);
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-white pt-16 md:pt-20 pb-44 px-4 md:px-8">
        <div className="max-w-[1440px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[80px_1fr_400px] xl:grid-cols-[100px_1fr_450px] gap-6 md:gap-8 xl:gap-20 items-start">
            
            {/* 1. DESKTOP THUMBNAILS */}
            <div className="hidden lg:flex lg:flex-col lg:gap-3 lg:sticky lg:top-32">
              {allImages.map((imgUrl: string, index: number) => (
                <button
                  key={imgUrl}
                  onClick={() => scrollToImage(index)}
                  className={`relative aspect-square bg-[#F9F9F9] rounded-sm overflow-hidden border transition-all duration-300
                    ${imgUrl === currentMainImage ? 'border-black' : 'border-black/[0.05] hover:border-black/20'}`}
                >
                  <img src={imgUrl} className="w-full h-full object-contain mix-blend-multiply p-2" alt="" />
                </button>
              ))}
            </div>

            {/* 2. GALLERY AREA WITH ZOOM */}
            <div className="lg:sticky lg:top-32">
              <div className="aspect-square bg-[#F9F9F9] border border-black/[0.03] rounded-sm overflow-hidden relative">
                <div 
                  ref={mobileGalleryRef}
                  onScroll={handleMobileScroll}
                  className="flex overflow-x-auto snap-x snap-mandatory lg:hidden h-full no-scrollbar scroll-smooth"
                >
                  {allImages.map((imgUrl: string, index: number) => (
                    <div key={`mobile-${index}`} className="flex-shrink-0 w-full h-full snap-center p-8 flex items-center justify-center">
                      <Zoom overlayBgColorEnd="rgba(255, 255, 255, 0.8)">
                        <img src={imgUrl} className="w-full h-full object-contain mix-blend-multiply cursor-zoom-in" alt="" />
                      </Zoom>
                    </div>
                  ))}
                </div>

                <AnimatePresence mode="wait">
                  <motion.div 
                    key={currentMainImage}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="hidden lg:flex w-full h-full items-center justify-center p-12 lg:p-20"
                  >
                    <Zoom overlayBgColorEnd="rgba(255, 255, 255, 0.8)">
                      <img 
                        src={currentMainImage} 
                        className="w-full h-full object-contain mix-blend-multiply cursor-zoom-in" 
                        alt={product.title} 
                      />
                    </Zoom>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* 3. PRODUCT INFO */}
            <div className="flex flex-col pt-2 md:pt-4 lg:pt-0">
              <h1 className="font-ndot text-3xl md:text-5xl xl:text-6xl uppercase mb-3 md:mb-4 tracking-tighter leading-[0.85] text-black">
                {product.title}
              </h1>
              
              <div className="flex items-baseline gap-3 mb-8 md:mb-10">
                <p className="font-ndot text-2xl md:text-4xl text-black">{formatPrice(price?.amount, price?.currencyCode)}</p>
                {isOnSale && (
                  <span className="font-ntypeMono text-black/20 line-through text-xs md:text-sm">{formatPrice(compareAtPrice.amount, compareAtPrice.currencyCode)}</span>
                )}
              </div>

              {/* VARIANT SELECTORS */}
              <div className="mb-10 md:mb-14 space-y-8 md:space-y-12">
                {product.options?.map((option: any) => {
                  if (option.name === "Title" && option.values.includes("Default Title")) return null;
                  return (
                    <div key={option.name} className="flex flex-col gap-3 md:gap-5">
                      <span className="font-ntypeMono text-[9px] md:text-[10px] uppercase tracking-[0.2em] text-black/30 italic">Select {option.name}</span>
                      <div className="flex flex-wrap gap-2">
                        {option.values.map((value: string) => {
                          const isSelected = selectedVariant?.selectedOptions.some((opt: any) => opt.name === option.name && opt.value === value);
                          return (
                            <button
                              key={value}
                              onClick={() => handleOptionChange(option.name, value)}
                              className={`px-4 py-2 md:px-6 md:py-2.5 rounded-full font-ntypeMono text-[10px] md:text-[11px] uppercase border transition-all duration-300
                                ${isSelected ? 'bg-black text-white border-black shadow-md scale-105' : 'bg-transparent text-black/40 border-black/10 hover:border-black/30'}`}
                            >
                              {value}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div 
                className="prose prose-sm max-w-none border-t border-black/[0.08] pt-8 md:pt-10
                  font-ntypeMono text-black/60 leading-snug text-[11px] md:text-[13px]
                  [&_b]:font-ndot [&_b]:text-black [&_b]:uppercase [&_b]:text-[10px] md:[&_b]:text-[11px] [&_b]:tracking-widest
                  [&_li]:list-disc [&_li]:ml-4 [&_li]:mb-1 [&_p]:mb-4" 
                dangerouslySetInnerHTML={{ __html: product.descriptionHtml }} 
              />
            </div>
          </div>
        </div>

        {/* BOTTOM ACTION BAR */}
        <div className="fixed bottom-6 md:bottom-8 left-0 right-0 z-50 px-4 pointer-events-none">
          <motion.div 
            initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
            className="max-w-[580px] mx-auto bg-white/80 backdrop-blur-2xl border border-black/10 rounded-full p-1.5 md:p-2 shadow-2xl flex items-center gap-1.5 md:gap-2 pointer-events-auto"
          >
            <div className="hidden sm:flex items-center px-4 gap-4 border-r border-black/5">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="hover:opacity-40 transition-opacity"><Minus size={14}/></button>
              <span className="font-ndot text-xs w-4 text-center tabular-nums">{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} className="hover:opacity-40 transition-opacity"><Plus size={14}/></button>
            </div>
            
            <button className="flex-1 bg-white border border-black/5 text-black h-10 md:h-12 rounded-full font-ndot uppercase text-[9px] md:text-[10px] tracking-[0.1em] hover:bg-black hover:text-white transition-all duration-500 shadow-sm">
              Basket
            </button>
            
            <button 
              onClick={handleBuyNow}
              className="flex-[1.5] md:flex-[2] bg-black text-white h-10 md:h-12 rounded-full font-ndot uppercase tracking-[0.1em] text-[9px] md:text-[10px] flex flex-col items-center justify-center leading-none px-6 md:px-10 shadow-xl active:scale-[0.98] transition-all overflow-hidden"
            >
              <div className="flex items-center gap-2">
                <CreditCard size={16} />
                <span>Buy Now</span>
              </div>
              
              {/* SAVINGS BADGE INSIDE BUTTON */}
              {isOnSale && (
                <motion.span 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-[8px] md:text-[9px] font-ntypeHeadline font-bold text-white/50 tracking-widest mt-0.5"
                >
                  SAVE {formatPrice(savingsAmount, price.currencyCode)}
                </motion.span>
              )}
            </button>
          </motion.div>
        </div>
      </main>
    </>
  );
}