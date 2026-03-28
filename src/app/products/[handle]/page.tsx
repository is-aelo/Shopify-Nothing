import { getProductByHandle } from '@/lib/shopify';
import ProductClientPage from './ProductClientPage';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{ handle: string }>; // In Next.js 15, params is a Promise
}

/**
 * Server-side Page Component
 * Handles the async extraction of the handle and data fetching
 */
export default async function Page({ params }: PageProps) {
  // 1. MUST AWAIT: This is the fix for the 404 error
  const resolvedParams = await params;
  const handle = resolvedParams.handle;

  // 2. Fetch the product from Shopify using the handle
  const response = await getProductByHandle(handle);
  const product = response?.body?.data?.productByHandle;

  // 3. Technical Guard: If Shopify returns nothing, go to 404
  if (!product) {
    console.error(`[SYSTEM_LOG] 404: Product handle "${handle}" not found.`);
    notFound();
  }

  // 4. Pass data to the Client Component
  return <ProductClientPage product={product} />;
}

/**
 * Optional: SEO Metadata for the product
 */
export async function generateMetadata({ params }: PageProps) {
  const { handle } = await params;
  const response = await getProductByHandle(handle);
  const product = response?.body?.data?.productByHandle;

  if (!product) return { title: 'Product_Not_Found' };

  return {
    title: `${product.title} | REWIRED`,
    description: product.description,
  };
}