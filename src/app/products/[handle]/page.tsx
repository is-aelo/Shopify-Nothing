import { getProductByHandle, getProductRecommendations } from '@/lib/shopify';
import ProductClientPage from './ProductClientPage';
import ProductRecommendations from '@/components/ProductRecommendations';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{ handle: string }>;
}

/**
 * PRODUCT SERVER PAGE
 * Fetching happens here on the server for SEO and Performance.
 */
export default async function Page({ params }: PageProps) {
  const { handle } = await params;

  // 1. Fetch Product Data from Shopify Storefront API
  const response = await getProductByHandle(handle);
  const product = response?.body?.data?.productByHandle;

  // 2. 404 Check: If product handle doesn't exist in Shopify
  if (!product) {
    console.error(`[SYSTEM_LOG] 404: Product "${handle}" not found.`);
    notFound();
  }

  // 3. Fetch Recommendations (Related & Complementary)
  const recoResponse = await getProductRecommendations(product.id);
  
  // Extracting recommendations based on Shopify's algorithm
  const related = recoResponse?.body?.data?.related || [];
  const complementary = recoResponse?.body?.data?.complementary || [];

  return (
    <main className="bg-white min-h-screen">
      {/* MAIN PRODUCT CLIENT COMPONENT 
          This handles the Gallery, Variant Selection, and the Sticky Action Menu.
          We MUST pass the 'product' object here.
      */}
      <ProductClientPage product={product} />

      {/* RECOMMENDATIONS SECTION
          Product-to-product suggestions.
      */}
      <ProductRecommendations 
        related={related} 
        complementary={complementary} 
      />
      
      {/* SPACING FOR FIXED MOBILE ELEMENTS */}
      <div className="h-32 md:h-40" />
    </main>
  );
}

/**
 * SEO & METADATA
 * Generates dynamic titles, descriptions, and OG images for social sharing.
 */
export async function generateMetadata({ params }: PageProps) {
  const { handle } = await params;
  const response = await getProductByHandle(handle);
  const product = response?.body?.data?.productByHandle;

  if (!product) return { title: 'Product Not Found' };

  // Remove HTML tags from Shopify description for clean meta tags
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