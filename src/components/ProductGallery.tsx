"use client";

import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Zoom from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';

interface ProductGalleryProps {
  product: any;
  selectedVariant: any;
}

export default function ProductGallery({ product, selectedVariant }: ProductGalleryProps) {
  const allVariantImageUrls = useMemo(() => {
    return product.variants.edges
      .map((edge: any) => edge.node.image?.url)
      .filter(Boolean);
  }, [product]);

  const filteredImages = useMemo(() => {
    const allImages = product.images?.edges?.map((edge: any) => edge.node.url) || [];
    const selectedVariantUrl = selectedVariant?.image?.url;

    return allImages.filter((url: string) => {
      if (url === selectedVariantUrl) return true;
      if (!allVariantImageUrls.includes(url)) return true;
      return false;
    });
  }, [product, selectedVariant, allVariantImageUrls]);

  const [currentMainImage, setCurrentMainImage] = useState(filteredImages[0]);
  const [mobileActiveIndex, setMobileActiveIndex] = useState(0);
  const [zoomKey, setZoomKey] = useState(0); 
  
  const mobileGalleryRef = useRef<HTMLDivElement>(null);
  const isInternalScrolling = useRef(false);

  // --- SMOOTH AUTO-CLOSE ON RESIZE ---
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const handleResize = () => {
      // Re-trigger zoomKey to unmount zoom portal
      setZoomKey(prev => prev + 1);

      if (mobileGalleryRef.current) {
        const scrollLeft = mobileGalleryRef.current.offsetWidth * mobileActiveIndex;
        mobileGalleryRef.current.scrollTo({ left: scrollLeft });
      }
    };

    const debouncedResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleResize, 50); // Faster response for smoothness
    };

    window.addEventListener('resize', debouncedResize);
    return () => {
      window.removeEventListener('resize', debouncedResize);
      clearTimeout(timeoutId);
    };
  }, [mobileActiveIndex]);

  useEffect(() => {
    const variantUrl = selectedVariant?.image?.url;
    if (variantUrl && filteredImages.includes(variantUrl)) {
      setCurrentMainImage(variantUrl);
      const index = filteredImages.indexOf(variantUrl);
      if (index !== -1) scrollToImage(index);
    } else {
      setCurrentMainImage(filteredImages[0]);
    }
  }, [selectedVariant, filteredImages]);

  const scrollToImage = (index: number) => {
    if (!mobileGalleryRef.current || index < 0) return;
    isInternalScrolling.current = true;
    const scrollLeft = mobileGalleryRef.current.offsetWidth * index;
    mobileGalleryRef.current.scrollTo({ left: scrollLeft, behavior: 'smooth' });
    setMobileActiveIndex(index);
    setCurrentMainImage(filteredImages[index]);
    setTimeout(() => { isInternalScrolling.current = false; }, 500);
  };

  const handleMobileScroll = () => {
    if (mobileGalleryRef.current && !isInternalScrolling.current) {
      const { scrollLeft, offsetWidth } = mobileGalleryRef.current;
      const index = Math.round(scrollLeft / offsetWidth);
      if (index !== mobileActiveIndex && filteredImages[index]) {
        setMobileActiveIndex(index);
        setCurrentMainImage(filteredImages[index]);
      }
    }
  };

  return (
    <>
      {/* DESKTOP THUMBNAILS */}
      <div className="hidden lg:flex lg:flex-col lg:gap-3 lg:sticky lg:top-32">
        {filteredImages.map((imgUrl, index) => (
          <button
            key={imgUrl}
            onClick={() => scrollToImage(index)}
            className={`relative aspect-square bg-white rounded-sm overflow-hidden border transition-all duration-300
              ${imgUrl === currentMainImage ? 'border-[#07080F]' : 'border-[#E1E2E3] hover:border-[#07080F]/20'}`}
          >
            <img src={imgUrl} className="w-full h-full object-contain mix-blend-multiply p-2" alt="" />
          </button>
        ))}
      </div>

      {/* MAIN VIEWPORT */}
      <div className="lg:sticky lg:top-32 w-full">
        <div className="aspect-square bg-[#E1E2E3]/20 backdrop-blur-xl border border-[#E1E2E3] rounded-sm overflow-hidden relative">
          
          {/* MOBILE SLIDER */}
          <div 
            ref={mobileGalleryRef}
            onScroll={handleMobileScroll}
            className="flex overflow-x-auto snap-x snap-mandatory lg:hidden h-full no-scrollbar scroll-smooth"
          >
            {filteredImages.map((imgUrl) => (
              <div key={`mobile-${imgUrl}`} className="flex-shrink-0 w-full h-full snap-center flex items-center justify-center p-6 md:p-10">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${imgUrl}-${zoomKey}`}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.05 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="w-full h-full flex items-center justify-center"
                  >
                    <Zoom overlayBgColorEnd="rgba(255, 255, 255, 0.95)">
                      <img 
                        src={imgUrl} 
                        className="max-w-[85%] max-h-[85%] w-auto h-auto object-contain mix-blend-multiply cursor-zoom-in" 
                        alt="Product focus" 
                      />
                    </Zoom>
                  </motion.div>
                </AnimatePresence>
              </div>
            ))}
          </div>

          {/* DESKTOP MAIN VIEW */}
          <div className="hidden lg:flex w-full h-full items-center justify-center p-8 lg:p-16">
            <AnimatePresence mode="wait">
              <motion.div 
                key={`${currentMainImage}-${zoomKey}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="w-full h-full flex items-center justify-center"
              >
                <Zoom overlayBgColorEnd="rgba(255, 255, 255, 0.95)">
                  <img 
                    src={currentMainImage} 
                    className="w-full h-full object-contain mix-blend-multiply cursor-zoom-in" 
                    alt={product.title} 
                  />
                </Zoom>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* MOBILE PAGINATION */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-[#E1E2E3]/40 backdrop-blur-md border border-white/20 rounded-full flex justify-center gap-1.5 lg:hidden pointer-events-none">
            {filteredImages.map((_, i) => (
              <motion.div 
                key={i} 
                animate={{ width: i === mobileActiveIndex ? 16 : 4 }}
                className={`h-1 rounded-full ${
                  i === mobileActiveIndex ? 'bg-[#07080F]' : 'bg-[#07080F]/20'
                }`} 
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}