import { getSearchResults, getFeaturedProducts } from '@/lib/shopify';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  try {
    let response;

    // 1. Logic Switch: If query is empty or just whitespace, get Top Searches
    if (!query || query.trim().length === 0) {
      response = await getFeaturedProducts();
    } else {
      // 2. Otherwise, run the predictive search
      response = await getSearchResults(query);
    }

    // 3. Check for Shopify data existence before mapping
    const productsData = response?.body?.data?.products?.edges || [];
    const products = productsData.map((edge: any) => edge.node);

    return NextResponse.json({ products });
    
  } catch (error) {
    console.error('Search Route Error:', error);
    // Return empty array instead of 500 to keep the UI from crashing
    return NextResponse.json({ products: [], error: 'Failed to fetch' }, { status: 500 });
  }
}