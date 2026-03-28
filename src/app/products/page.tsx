import { getAllProducts } from '@/lib/shopify';
import Link from 'next/link';
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";

/**
 * Main Inventory Page (Server Component)
 * Fetches and displays the full product catalog from Shopify
 */
export default async function ProductsPage() {
  // 1. Technical Fetch: Retrieve the first 10 products from the database
  const response = await getAllProducts();
  
  // 2. Data Normalization: Extract nodes from the GraphQL edges
  const products = response?.body?.data?.products?.edges?.map((edge: any) => edge.node) || [];

  return (
    <main className="min-h-screen bg-white pt-24 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section: System Status & Category Manifest */}
        <div className="border-b border-black/10 pb-10 mb-12 flex justify-between items-end">
          <div>
            <span className="font-ntypeMono text-[10px] uppercase tracking-[0.3em] text-black/40">
              Category: All_Units
            </span>
            <h1 className="font-ndot text-5xl md:text-7xl uppercase mt-2 text-black">
              Inventory
            </h1>
          </div>
          
          {/* Metadata: Real-time count of loaded units */}
          <div className="text-right hidden md:block">
            <p className="font-ntypeMono text-[10px] text-black/40 uppercase">
              System_Status: Online
            </p>
            <p className="font-ntypeMono text-[10px] text-black/40 uppercase">
              Total_Units: {products.length.toString().padStart(2, '0')}
            </p>
          </div>
        </div>

        {/* Product Grid: High-Contrast 1px Technical Border Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-black/10 border border-black/10">
          {products.map((product: any) => {
            const image = product.images?.edges?.[0]?.node;
            const price = product.priceRange?.minVariantPrice;

            return (
              <Link 
                key={product.id}
                href={`/products/${product.handle}`}
                className="group bg-white p-8 flex flex-col hover:bg-black transition-all duration-500 relative overflow-hidden"
              >
                {/* Visual Asset Container: Grayscale by default, Inverts on hover */}
                <div className="aspect-square w-full mb-12 flex items-center justify-center grayscale group-hover:grayscale-0 transition-all duration-700">
                  {image ? (
                    <img 
                      src={image.url} 
                      alt={product.title}
                      className="w-[80%] h-[80%] object-contain mix-blend-multiply group-hover:invert transition-all duration-700 scale-100 group-hover:scale-110"
                    />
                  ) : (
                    <span className="font-ndot text-[8px] opacity-20 uppercase tracking-widest">
                      Missing_Asset_Data
                    </span>
                  )}
                </div>

                {/* Technical Product Info */}
                <div className="mt-auto">
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="font-ndot text-2xl uppercase text-black group-hover:text-white transition-colors leading-tight max-w-[85%]">
                      {product.title}
                    </h2>
                    <ArrowRight 
                      size={24} 
                      weight="thin" 
                      className="text-black group-hover:text-white -rotate-45 group-hover:rotate-0 transition-all duration-500" 
                    />
                  </div>
                  
                  {/* Card Footer: Handle ID and Price Manifest */}
                  <div className="flex justify-between items-center border-t border-black/5 pt-4 group-hover:border-white/10 transition-colors">
                    <span className="font-ntypeMono text-[10px] text-black/40 group-hover:text-white/40 uppercase">
                      ID: {product.handle}
                    </span>
                    {price && (
                      <span className="font-ntypeMono text-xs text-brandRed group-hover:text-white font-bold transition-colors">
                        {Number(price.amount).toFixed(2)} {price.currencyCode}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}