import Image from 'next/image';
import { getAllProducts } from '@/lib/shopify';

export default async function Home() {
  const response = await getAllProducts();
  const products = response.body?.data?.products?.edges || [];

  return (
    <main className="p-10 font-ntype">
      {/* Nothing Aesthetic Header */}
      <div className="mb-20">
        <h1 className="font-ndot text-6xl tracking-tighter uppercase leading-none">
          Nothing <span className="text-brandRed">(R)</span>
        </h1>
        <p className="font-ntype opacity-40 text-xs tracking-[0.2em] mt-2 uppercase">
          Inventory Status: System Connected
        </p>
      </div>
      
      {products.length > 0 ? (
        <ul className="grid grid-cols-1 gap-1 border-t border-white/10">
          {products.map((item: any) => {
            const product = item.node;
            const image = product.images.edges[0]?.node;

            return (
              <li key={product.id} className="group grid grid-cols-1 md:grid-cols-[150px,1fr,auto] items-center gap-10 py-8 border-b border-white/10 hover:bg-white/[0.02] transition-colors px-4">
                
                {/* Image Section - High Contrast */}
                <div className="relative aspect-square w-full bg-[#111] flex items-center justify-center overflow-hidden border border-white/5 grayscale group-hover:grayscale-0 transition-all duration-500">
                  {image ? (
                    <Image
                      src={image.url}
                      alt={image.altText || product.title}
                      width={300}
                      height={300}
                      className="object-contain w-[80%] h-[80%]"
                    />
                  ) : (
                    <div className="font-ndot text-[10px] text-white/20">NO_IMG</div>
                  )}
                </div>

                {/* Details Section */}
                <div className="flex flex-col gap-1">
                  <p className="font-ndot text-3xl uppercase tracking-tight">{product.title}</p>
                  <p className="font-ntype text-sm opacity-50 max-w-md line-clamp-2">{product.description}</p>
                </div>

                {/* Technical Meta - Pure Nothing Vibes */}
                <div className="text-right hidden md:block">
                  <p className="font-ndot text-xs text-white/30 tracking-widest uppercase">ID: {product.handle}</p>
                  <button className="mt-4 font-ndot border border-white px-6 py-2 text-xs hover:bg-white hover:text-black transition-all uppercase">
                    View Specs
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="font-ndot text-red-500 animate-pulse">
          ERROR: CONNECTION_FAILED // CHECK_API_KEYS
        </div>
      )}
    </main>
  );
}