import { NextRequest, NextResponse } from 'next/server';
import { trackKlaviyoEvent } from '@/lib/klaviyo';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, eventName, productName, price, itemID } = body;

    if (!email || !productName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // FORCE standard name para sa abandonment flow
    // Kahit ano pang i-pasa ng frontend, gagawin nating standard "Added to Cart"
    const finalEventName = eventName.includes('Cart') ? 'Added to Cart' : eventName;

    const result = await trackKlaviyoEvent(finalEventName, email, {
      product_name: productName,
      price: price,
      value: price, // Importante: 'value' ang trigger ng flows
      item_id: itemID,
      source: 'Headless Storefront'
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error("❌ API TRACKING ERROR:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}