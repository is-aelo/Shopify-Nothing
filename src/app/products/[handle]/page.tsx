import { getProductByHandle, getProductRecommendations } from '@/lib/shopify';
import ProductClientPage from './ProductClientPage';
import ProductRecommendations from '@/components/ProductRecommendations';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{ handle: string }>;
}

export default async function Page({ params }: PageProps) {
  const { handle } = await params;

  const response = await getProductByHandle(handle);
  const product = response?.body?.data?.productByHandle;

  if (!product) {
    console.error(`[SYSTEM_LOG] 404: Product "${handle}" not found.`);
    notFound();
  }

  const recoResponse = await getProductRecommendations(product.id);
  const related = recoResponse?.body?.data?.related || [];
  const complementary = recoResponse?.body?.data?.complementary || [];

  return (
    <main className="bg-white min-h-screen">
      {/* Main Product Section 
          Dito manggagaling ang padding-bottom para sa natural spacing 
      */}
      <ProductClientPage product={product} />

      {/* Recommendations Section
          Inalis natin ang extra wrapper div para hindi mag-clash ang max-widths 
      */}
      <ProductRecommendations 
        related={related} 
        complementary={complementary} 
      />
    </main>
  );
}

export async function generateMetadata({ params }: PageProps) {
  const { handle } = await params;
  const response = await getProductByHandle(handle);
  const product = response?.body?.data?.productByHandle;

  if (!product) return { title: 'Product Not Found' };

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