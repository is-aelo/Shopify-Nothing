"use server";

const domain = process.env.SHOPIFY_STORE_DOMAIN;
const storefrontAccessToken = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;

// ============================================================
// CORE FETCHER
// ============================================================

export async function shopifyFetch({
  query,
  variables = {},
  tags = []
}: {
  query: string;
  variables?: any;
  tags?: string[];
}) {
  const endpoint = `https://${domain}/api/2024-01/graphql.json`;

  try {
    const result = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': storefrontAccessToken!,
      },
      body: JSON.stringify({ query, variables }),
      next: {
        revalidate: 0,
        tags
      }
    });

    const body = await result.json();

    if (body.errors) {
      console.error('[SHOPIFY_FETCH_ERROR]:', JSON.stringify(body.errors, null, 2));
    }

    return { status: result.status, body };
  } catch (error) {
    console.error('[CONNECTION_ERROR]:', error);
    return { status: 500, error: 'Error receiving data' };
  }
}

// ============================================================
// CART
// All cart state lives on Shopify's backend.
// We just store the cartId in a cookie on the frontend
// and pass it into these functions.
//
// Flow:
//   1. createCart()       → get cartId, store in cookie
//   2. addCartLines()     → add items using that cartId
//   3. updateCartLine()   → update quantity
//   4. removeCartLines()  → remove items
//   5. getCart()          → fetch current cart state
//   6. cart.checkoutUrl   → redirect here for checkout (Shopify handles the rest)
// ============================================================

/**
 * Create a new empty cart.
 * Call this once when the user first adds an item and no cartId cookie exists.
 * Store the returned cart.id in a cookie (e.g. 'shopify_cart_id').
 */
export async function createCart() {
  const res = await shopifyFetch({
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

  const data = res.body?.data?.cartCreate;

  if (data?.userErrors?.length > 0) {
    console.error('[CREATE_CART_ERROR]:', data.userErrors);
    return null;
  }

  return data?.cart ?? null;
}

/**
 * Add one or more items to an existing cart.
 * Always use this after createCart() has been called and cartId is stored.
 */
export async function addCartLines(
  cartId: string,
  lines: { variantId: string; quantity: number }[]
) {
  const res = await shopifyFetch({
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
                      product { title }
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
        quantity: item.quantity
      }))
    }
  });

  const data = res.body?.data?.cartLinesAdd;

  if (data?.userErrors?.length > 0) {
    console.error('[ADD_CART_LINES_ERROR]:', data.userErrors);
    return null;
  }

  return data?.cart ?? null;
}

/**
 * Update the quantity of a specific line item.
 * Set quantity to 0 to effectively remove it (or use removeCartLines instead).
 */
export async function updateCartLine(
  cartId: string,
  lineId: string,
  quantity: number
) {
  const res = await shopifyFetch({
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
                      product { title }
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

  const data = res.body?.data?.cartLinesUpdate;

  if (data?.userErrors?.length > 0) {
    console.error('[UPDATE_CART_LINE_ERROR]:', data.userErrors);
    return null;
  }

  return data?.cart ?? null;
}

/**
 * Remove one or more line items from the cart by their line IDs.
 * Note: lineId is the cart line node ID, NOT the variant ID.
 */
export async function removeCartLines(cartId: string, lineIds: string[]) {
  const res = await shopifyFetch({
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
                      product { title }
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

  const data = res.body?.data?.cartLinesRemove;

  if (data?.userErrors?.length > 0) {
    console.error('[REMOVE_CART_LINES_ERROR]:', data.userErrors);
    return null;
  }

  return data?.cart ?? null;
}

/**
 * Fetch the current state of the cart.
 * Use this to hydrate your cart UI on page load.
 */
export async function getCart(cartId: string) {
  const res = await shopifyFetch({
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
                    product {
                      title
                      handle
                    }
                    image {
                      url
                      altText
                    }
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

  return res.body?.data?.cart ?? null;
}

// ============================================================
// PRODUCTS
// ============================================================

/**
 * Fetch all products (max 100).
 */
export async function getAllProducts() {
  return shopifyFetch({
    query: `{
      products(first: 100) {
        edges {
          node {
            id
            title
            handle
            descriptionHtml
            variants(first: 1) {
              edges {
                node {
                  id
                  price { amount currencyCode }
                  compareAtPrice { amount currencyCode }
                }
              }
            }
            images(first: 1) {
              edges {
                node { url altText }
              }
            }
          }
        }
      }
    }`,
    tags: ['products']
  });
}

/**
 * Fetch a single product by its handle.
 */
export async function getProductByHandle(handle: string) {
  return shopifyFetch({
    query: `
      query getProduct($handle: String!) {
        productByHandle(handle: $handle) {
          id
          title
          handle
          descriptionHtml
          options { name values }
          variants(first: 20) {
            edges {
              node {
                id
                title
                availableForSale
                selectedOptions { name value }
                price { amount currencyCode }
                compareAtPrice { amount currencyCode }
                image { url altText }
              }
            }
          }
          images(first: 10) {
            edges {
              node { url altText }
            }
          }
        }
      }
    `,
    variables: { handle },
    tags: [`product-${handle}`]
  });
}

/**
 * Fetch products by collection handle.
 */
export async function getProductsByCollection(handle: string) {
  return shopifyFetch({
    query: `
      query getCollection($handle: String!) {
        collection(handle: $handle) {
          title
          description
          products(first: 100) {
            edges {
              node {
                id
                title
                handle
                variants(first: 1) {
                  edges {
                    node {
                      id
                      price { amount currencyCode }
                      compareAtPrice { amount currencyCode }
                    }
                  }
                }
                images(first: 1) {
                  edges {
                    node { url altText }
                  }
                }
              }
            }
          }
        }
      }
    `,
    variables: { handle },
    tags: ['products', `collection-${handle}`]
  });
}

/**
 * Fetch products by product type (category).
 */
export async function getProductsByCategory(category: string) {
  return shopifyFetch({
    query: `
      query getProductsByCategory($query: String!) {
        products(first: 100, query: $query) {
          edges {
            node {
              id
              title
              handle
              variants(first: 1) {
                edges {
                  node {
                    id
                    price { amount currencyCode }
                    compareAtPrice { amount currencyCode }
                  }
                }
              }
              images(first: 1) {
                edges {
                  node { url altText }
                }
              }
            }
          }
        }
      }
    `,
    variables: { query: `product_type:${category}` },
    tags: ['products', `category-${category}`]
  });
}

/**
 * Search products by keyword.
 */
export async function getSearchResults(searchTerm: string) {
  return shopifyFetch({
    query: `
      query getProducts($query: String!) {
        products(first: 20, query: $query) {
          edges {
            node {
              id
              title
              handle
              variants(first: 1) {
                edges {
                  node {
                    id
                    price { amount currencyCode }
                  }
                }
              }
              images(first: 1) {
                edges {
                  node { url altText }
                }
              }
            }
          }
        }
      }
    `,
    variables: { query: searchTerm }
  });
}

/**
 * Fetch related and complementary product recommendations.
 */
export async function getProductRecommendations(productId: string) {
  return shopifyFetch({
    query: `
      query getRecommendations($productId: ID!) {
        related: productRecommendations(productId: $productId, intent: RELATED) {
          ...ProductFields
        }
        complementary: productRecommendations(productId: $productId, intent: COMPLEMENTARY) {
          ...ProductFields
        }
      }

      fragment ProductFields on Product {
        id
        title
        handle
        variants(first: 1) {
          edges {
            node {
              id
              price { amount currencyCode }
            }
          }
        }
        images(first: 1) {
          edges {
            node { url altText }
          }
        }
      }
    `,
    variables: { productId },
    tags: ['recommendations']
  });
}