import Image from 'next/image';
import { getAllProducts } from '@/lib/shopify';

export default async function Home() {
  const response = await getAllProducts();
  const products = response.body?.data?.products?.edges || [];

  return (
    <main className="p-10 font-mono">
      <h1 className="text-2xl mb-10 border-b pb-2">NOTHING STORE DATA & IMAGE TEST:</h1>
      
      {products.length > 0 ? (
        <ul className="space-y-10">
          {products.map((item: any) => {
            const product = item.node;
            const image = product.images.edges[0]?.node; // fetching product images 

            return (
              <li key={product.id} className="grid grid-cols-1 md:grid-cols-[100px,1fr] gap-6 border border-white/20 p-5 rounded-lg">
                
                {/* Image Section */}
                <div className="relative w-[100px] h-[100px] bg-neutral-900 flex items-center justify-center rounded-lg overflow-hidden border border-white/10">
                  {image ? (
                    <Image
                      src={image.url}
                      alt={image.altText || product.title}
                      width={image.width || 200}
                      height={image.height || 200}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    
                    <div className="text-[10px] text-white/40 uppercase">No Image</div>
                  )}
                </div>

                {/* Details Section */}
                <div className="flex flex-col justify-center gap-2">
                  <p className="font-bold text-2xl uppercase tracking-tight">{product.title}</p>
                  <p className="opacity-40 text-[10px] tracking-widest">{product.id}</p>
                  <p className="text-sm opacity-70 line-clamp-1">{product.description}</p>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-red-500">WALANG DATA. Check your .env or API keys!</p>
      )}
    </main>
  );
}