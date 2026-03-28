"use client";

interface ProductInfoProps {
  product: any;
  selectedVariant: any;
  setSelectedVariant: (variant: any) => void;
}

export default function ProductInfo({ product, selectedVariant, setSelectedVariant }: ProductInfoProps) {
  
  const price = selectedVariant?.price;
  const compareAtPrice = selectedVariant?.compareAtPrice;
  const isOnSale = compareAtPrice && Number(compareAtPrice.amount) > Number(price?.amount);

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
      node.selectedOptions.every((opt: any) => 
        updatedOptions.some((uo: any) => uo.name === opt.name && uo.value === opt.value)
      )
    );

    if (newVariant) setSelectedVariant(newVariant.node);
  };

  return (
    <div className="flex flex-col pt-2 md:pt-4 lg:pt-0">
      {/* 1. TITLE & BRANDING */}
      <h1 className="font-ndot text-3xl md:text-5xl xl:text-6xl uppercase mb-3 md:mb-4 tracking-tighter leading-[0.85] text-[#07080F]">
        {product.title}
      </h1>
      
      {/* 2. PRICING SECTION */}
      <div className="flex items-baseline gap-3 mb-8 md:mb-10">
        <p className="font-ndot text-2xl md:text-4xl text-[#07080F]">
          {formatPrice(price?.amount, price?.currencyCode)}
        </p>
        {isOnSale && (
          <span className="font-ntypeMono text-[#373B3B] opacity-20 line-through text-xs md:text-sm">
            {formatPrice(compareAtPrice.amount, compareAtPrice.currencyCode)}
          </span>
        )}
      </div>

      {/* 3. VARIANT SELECTORS */}
      <div className="mb-10 md:mb-14 space-y-8 md:space-y-12">
        {product.options?.map((option: any) => {
          // Skip rendering if it's the default Shopify title
          if (option.name === "Title" && option.values.includes("Default Title")) return null;
          
          return (
            <div key={option.name} className="flex flex-col gap-3 md:gap-5">
              <span className="font-ntypeMono text-[9px] md:text-[10px] uppercase tracking-[0.2em] text-[#373B3B] opacity-40 italic">
                Select {option.name}
              </span>
              <div className="flex flex-wrap gap-2">
                {option.values.map((value: string) => {
                  const isSelected = selectedVariant?.selectedOptions.some(
                    (opt: any) => opt.name === option.name && opt.value === value
                  );
                  
                  return (
                    <button
                      key={value}
                      onClick={() => handleOptionChange(option.name, value)}
                      className={`px-4 py-2 md:px-6 md:py-2.5 rounded-full font-ntypeMono text-[10px] md:text-[11px] uppercase border transition-all duration-300
                        ${isSelected 
                          ? 'bg-[#07080F] text-white border-[#07080F] shadow-md scale-105' 
                          : 'bg-transparent text-[#07080F]/40 border-[#E1E2E3] hover:border-[#07080F]/30'
                        }`}
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

      {/* 4. PRODUCT DESCRIPTION (Rich Text) */}
      <div 
        className="prose prose-sm max-w-none border-t border-[#E1E2E3] pt-8 md:pt-10
          font-ntypeMono text-[#373B3B] opacity-70 leading-snug text-[11px] md:text-[13px]
          [&_b]:font-ndot [&_b]:text-[#07080F] [&_b]:uppercase [&_b]:text-[10px] md:[&_b]:text-[11px] [&_b]:tracking-widest
          [&_li]:list-disc [&_li]:ml-4 [&_li]:mb-1 [&_p]:mb-4" 
        dangerouslySetInnerHTML={{ __html: product.descriptionHtml }} 
      />
    </div>
  );
}