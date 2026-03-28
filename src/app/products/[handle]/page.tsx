import { getProductByHandle, getProductRecommendations } from '@/lib/shopify';
import ProductClientPage from './ProductClientPage';
import ProductRecommendations from '@/components/ProductRecommendations';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{ handle: string }>;
}

export default async function Page({ params }: PageProps) {
  // 1. Await the params (Next.js 15 requirement)
  const { handle } = await params;

  // 2. Fetch Main Product Data
  const response = await getProductByHandle(handle);
  const product = response?.body?.data?.productByHandle;

  // 3. 404 Guard
  if (!product) {
    console.error(`[SYSTEM_LOG] 404: Product "${handle}" not found.`);
    notFound();
  }

  /**
   * 4. Fetch Hybrid Recommendations
   * Kukunin natin ang 'related' at 'complementary' arrays
   * base sa in-update nating shopifyFetch logic.
   */
  const recoResponse = await getProductRecommendations(product.id);
  const related = recoResponse?.body?.data?.related || [];
  const complementary = recoResponse?.body?.data?.complementary || [];

  return (
    <div className="bg-white">
      {/* Main Product Section */}
      <ProductClientPage product={product} />

      {/* Recommendations Section - Bottom Area */}
      <div className="max-w-[1440px] mx-auto px-4 md:px-8">
        {/* Ipinapasa na natin ang dalawang arrays para ma-render ng component */}
        <ProductRecommendations 
          related={related} 
          complementary={complementary} 
        />
      </div>
    </div>
  );
}

export async function generateMetadata({ params }: PageProps) {
  const { handle } = await params;
  const response = await getProductByHandle(handle);
  const product = response?.body?.data?.productByHandle;

  if (!product) return { title: 'Product Not Found' };

  // SEO: Clean HTML tags from description
  const cleanDescription = product.descriptionHtml
    ?.replace(/<[^>]*>?/gm, '')
    .slice(0, 160);

  return {
    title: `${product.title} | REWIRED`,
    description: cleanDescription,
    openGraph: {
      title: product.title,
      description: cleanDescription,
      images: [product.images?.edges?.[0]?.node?.url].filter(Boolean),
    },
  };
}