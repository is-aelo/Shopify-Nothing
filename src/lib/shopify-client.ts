/**
 * src/lib/shopify-client.ts
 *
 * Client-safe Shopify Storefront API calls.
 * No "use server" here — this runs in the browser.
 * Used by useCartStore (Zustand) which is a client-side store.
 */

const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
const storefrontAccessToken = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN;

async function shopifyClientFetch({
  query,
  variables = {},
}: {
  query: string;
  variables?: any;
}) {
  const endpoint = `https://${domain}/api/2024-01/graphql.json`;

  const result = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': storefrontAccessToken!,
    },
    body: JSON.stringify({ query, variables }),
  });

  const body = await result.json();

  if (body.errors) {
    console.error('[SHOPIFY_CLIENT_FETCH_ERROR]:', JSON.stringify(body.errors, null, 2));
  }

  return body;
}

// ============================================================
// CART — client-side versions
// ============================================================

export async function createCart() {
  const body = await shopifyClientFetch({
    query: `
      mutation cartCreate {
        cartCreate {
          cart {
            id
            checkoutUrl
            totalQuantity
          }
          userErrors { field message }
        }
      }
    `
  });

  const data = body?.data?.cartCreate;
  if (data?.userErrors?.length > 0) {
    console.error('[CREATE_CART_ERROR]:', data.userErrors);
    return null;
  }
  return data?.cart ?? null;
}

export async function addCartLines(
  cartId: string,
  lines: { variantId: string; quantity: number }[]
) {
  const body = await shopifyClientFetch({
    query: `
      mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
        cartLinesAdd(cartId: $cartId, lines: $lines) {
          cart {
            id
            checkoutUrl
            totalQuantity
            lines(first: 100) {
              edges {
                node {
                  id
                  quantity
                  merchandise {
                    ... on ProductVariant {
                      id
                      title
                      price { amount currencyCode }
                      compareAtPrice { amount currencyCode }
                      product { title handle }
                      image { url altText }
                    }
                  }
                }
              }
            }
            cost {
              totalAmount { amount currencyCode }
              subtotalAmount { amount currencyCode }
            }
          }
          userErrors { field message }
        }
      }
    `,
    variables: {
      cartId,
      lines: lines.map(item => ({
        merchandiseId: item.variantId,
        quantity: item.quantity,
      }))
    }
  });

  const data = body?.data?.cartLinesAdd;
  if (data?.userErrors?.length > 0) {
    console.error('[ADD_CART_LINES_ERROR]:', data.userErrors);
    return null;
  }
  return data?.cart ?? null;
}

export async function updateCartLine(
  cartId: string,
  lineId: string,
  quantity: number
) {
  const body = await shopifyClientFetch({
    query: `
      mutation cartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
        cartLinesUpdate(cartId: $cartId, lines: $lines) {
          cart {
            id
            checkoutUrl
            totalQuantity
            lines(first: 100) {
              edges {
                node {
                  id
                  quantity
                  merchandise {
                    ... on ProductVariant {
                      id
                      title
                      price { amount currencyCode }
                      compareAtPrice { amount currencyCode }
                      product { title handle }
                      image { url altText }
                    }
                  }
                }
              }
            }
            cost {
              totalAmount { amount currencyCode }
              subtotalAmount { amount currencyCode }
            }
          }
          userErrors { field message }
        }
      }
    `,
    variables: {
      cartId,
      lines: [{ id: lineId, quantity }]
    }
  });

  const data = body?.data?.cartLinesUpdate;
  if (data?.userErrors?.length > 0) {
    console.error('[UPDATE_CART_LINE_ERROR]:', data.userErrors);
    return null;
  }
  return data?.cart ?? null;
}

export async function removeCartLines(cartId: string, lineIds: string[]) {
  const body = await shopifyClientFetch({
    query: `
      mutation cartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
        cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
          cart {
            id
            checkoutUrl
            totalQuantity
            lines(first: 100) {
              edges {
                node {
                  id
                  quantity
                  merchandise {
                    ... on ProductVariant {
                      id
                      title
                      price { amount currencyCode }
                      compareAtPrice { amount currencyCode }
                      product { title handle }
                      image { url altText }
                    }
                  }
                }
              }
            }
            cost {
              totalAmount { amount currencyCode }
              subtotalAmount { amount currencyCode }
            }
          }
          userErrors { field message }
        }
      }
    `,
    variables: { cartId, lineIds }
  });

  const data = body?.data?.cartLinesRemove;
  if (data?.userErrors?.length > 0) {
    console.error('[REMOVE_CART_LINES_ERROR]:', data.userErrors);
    return null;
  }
  return data?.cart ?? null;
}

export async function getCart(cartId: string) {
  const body = await shopifyClientFetch({
    query: `
      query getCart($cartId: ID!) {
        cart(id: $cartId) {
          id
          checkoutUrl
          totalQuantity
          lines(first: 100) {
            edges {
              node {
                id
                quantity
                merchandise {
                  ... on ProductVariant {
                    id
                    title
                    price { amount currencyCode }
                    compareAtPrice { amount currencyCode }
                    product { title handle }
                    image { url altText }
                  }
                }
              }
            }
          }
          cost {
            totalAmount { amount currencyCode }
            subtotalAmount { amount currencyCode }
          }
        }
      }
    `,
    variables: { cartId }
  });

  return body?.data?.cart ?? null;
}