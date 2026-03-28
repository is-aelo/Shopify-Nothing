import { getProductByHandle } from '@/lib/shopify';
import ProductClientPage from './ProductClientPage';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{ handle: string }>;
}

export default async function Page({ params }: PageProps) {
  // 1. Await the params (Next.js 15 requirement)
  const { handle } = await params;

  // 2. Fetch data from Shopify
  const response = await getProductByHandle(handle);

  // 3. Extract the actual product object from the GraphQL body
  // Ang structure ng shopifyFetch ay { status, body: { data: { productByHandle: ... } } }
  const product = response?.body?.data?.productByHandle;

  // 4. If product doesn't exist, show 404
  if (!product) {
    console.error(`[SYSTEM_LOG] 404: Product "${handle}" not found.`);
    notFound();
  }

  // 5. Pass the clean product object to the Client Component
  return <ProductClientPage product={product} />;
}

export async function generateMetadata({ params }: PageProps) {
  const { handle } = await params;
  const response = await getProductByHandle(handle);
  const product = response?.body?.data?.productByHandle;

  if (!product) return { title: 'Product Not Found' };

  return {
    title: `${product.title} | REWIRED`,
    description: product.descriptionHtml?.replace(/<[^>]*>?/gm, '').slice(0, 160),
  };
}