import { getProductsByCollection } from '@/lib/shopify';
import { redirect } from 'next/navigation';

// Layout Components
import Header from '@/components/Header';
import Breadcrumbs from '@/components/Breadcrumbs'; 
import ProductCard from '@/components/ProductCard';
import Pagination from '@/components/Pagination';

// Dynamic Metadata base sa Category
export async function generateMetadata({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const title = category.charAt(0).toUpperCase() + category.slice(1);
  return {
    title: `${title} | REWIRED`,
    description: `Browse our ${title} collection. Technical assets by REWIRED.`,
  };
}

interface CategoryPageProps {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ page?: string }>;
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  // 1. UNWRAP params and searchParams (Next.js 15 requirement)
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  
  const category = resolvedParams.category;
  const currentPage = Number(resolvedSearchParams.page) || 1;

  // 2. Fetch products base sa Collection Handle
  const response = await getProductsByCollection(category);
  const allProducts = response?.body?.data?.collection?.products?.edges?.map((edge: any) => edge.node) || [];

  // 3. Pagination Configuration
  const ITEMS_PER_PAGE = 20; // Pwede mong gawing 20 kung gusto mong kaparehas ng main page
  const totalPages = Math.ceil(allProducts.length / ITEMS_PER_PAGE);

  // Security: Redirect kung lumampas sa page count
  if (allProducts.length > 0 && (currentPage < 1 || currentPage > totalPages)) {
    redirect(`/products/category/${category}?page=1`);
  }

  // 4. Slice logic para sa current page
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedProducts = allProducts.slice(startIndex, endIndex);

  return (
    <>
      <Header />

      <main className="min-h-screen bg-white pt-24 md:pt-32 pb-16 md:pb-20 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          
          {/* NAVIGATION */}
          <div className="mb-6 md:mb-8">
             <Breadcrumbs />
          </div>

          {/* CATALOG HEADER */}
          <div className="border-b border-black/[0.08] pb-8 md:pb-12 mb-8 md:mb-12 flex justify-between items-end">
            <div>
              <h1 className="font-ndot text-4xl sm:text-5xl md:text-7xl uppercase text-black tracking-tighter leading-none">
                {category.replace('-', ' ')}
              </h1>
            </div>
            
            <div className="text-right hidden sm:block leading-none">
              <p className="font-ntypeMono text-[9px] md:text-[10px] text-black/40 uppercase tracking-[0.2em]">
                {allProducts.length} <br /> 
                <span className="opacity-50 text-[7px] md:text-[8px]">Products</span>
              </p>
            </div>
          </div>

          {/* PRODUCT GRID */}
          {paginatedProducts.length > 0 ? (
            <div key={currentPage} className="animate-in fade-in duration-500">
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-px bg-black/[0.08] border border-black/[0.08]">
                {paginatedProducts.map((product: any) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* PAGINATION INTERFACE */}
              {totalPages > 1 && (
                <div className="mt-12">
                  <Pagination 
                    currentPage={currentPage} 
                    totalPages={totalPages} 
                  />
                </div>
              )}
            </div>
          ) : (
            /* EMPTY STATE */
            <div className="py-40 text-center border border-black/[0.08]">
              <p className="font-ndot text-black/20 uppercase tracking-widest text-sm">
                No_Products_Found_In_{category.replace('-', '_')}
              </p>
            </div>
          )}

          <div className="mt-20 border-t border-black/[0.05]" />
        </div>
      </main>
    </>
  );
}