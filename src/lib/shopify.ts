"use server";

const domain = process.env.SHOPIFY_STORE_DOMAIN;
const storefrontAccessToken = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;

export async function shopifyFetch({ 
  query, 
  variables = {}, 
  tags = [] 
}: { 
  query: string, 
  variables?: any, 
  tags?: string[] 
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
        tags: tags 
      } 
    });

    const body = await result.json();

    if (body.errors) {
      console.error('[SHOPIFY_FETCH_ERROR]:', JSON.stringify(body.errors, null, 2));
    }

    return {
      status: result.status,
      body
    };
  } catch (error) {
    console.error('[CONNECTION_ERROR]:', error);
    return {
      status: 500,
      error: 'Error receiving data'
    };
  }
}

/**
 * Fetch Products by Collection Handle
 * Ginagamit para sa PHONES, AUDIO, WATCHES, etc. base sa Collections sa Shopify
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
                      price {
                        amount
                        currencyCode
                      }
                      compareAtPrice {
                        amount
                        currencyCode
                      }
                    }
                  }
                }
                images(first: 1) {
                  edges {
                    node {
                      url
                      altText
                    }
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
 * Get Cart Status
 */
export async function getCart(cartId: string) {
  const query = `
    query getCart($cartId: ID!) {
      cart(id: $cartId) {
        id
        totalQuantity
        lines(first: 10) {
          edges {
            node {
              id
              quantity
            }
          }
        }
      }
    }
  `;

  try {
    const res = await shopifyFetch({
      query,
      variables: { cartId },
    });
    return res.body?.data?.cart;
  } catch (error) {
    console.error('[GET_CART_ERROR]:', error);
    return null;
  }
}

/**
 * Create Checkout / Cart
 */
export async function createCheckout(lineItems: { variantId: string; quantity: number }[]) {
  const query = `
    mutation cartCreate($input: CartInput!) {
      cartCreate(input: $input) {
        cart {
          id
          checkoutUrl
        }
        userErrors {
          code
          field
          message
        }
      }
    }
  `;

  const formattedLineItems = lineItems.map(item => ({
    merchandiseId: item.variantId,
    quantity: Math.max(1, item.quantity)
  }));

  try {
    const res = await shopifyFetch({
      query,
      variables: { 
        input: { 
          lines: formattedLineItems,
          attributes: [
            { key: "checkout_origin", value: "nothing_headless_ph" }
          ]
        } 
      },
    });

    if (res.body?.data?.cartCreate?.userErrors?.length > 0) {
      console.error('[CART_USER_ERROR]:', res.body.data.cartCreate.userErrors);
      return null;
    }

    const cart = res.body?.data?.cartCreate?.cart;
    
    if (!cart || !cart.checkoutUrl) {
      console.error('[CART_NULL]: No checkout URL returned.');
      return null;
    }

    return {
      cartId: cart.id,
      webUrl: cart.checkoutUrl
    };
  } catch (error) {
    console.error('[CART_SYSTEM_ERROR]:', error);
    return null;
  }
}

/**
 * Fetch All Products
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
                  price {
                    amount
                    currencyCode
                  }
                  compareAtPrice {
                    amount
                    currencyCode
                  }
                }
              }
            }
            images(first: 1) {
              edges {
                node {
                  url
                  altText
                }
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
 * Fetch Products by Category (Product Type)
 * Optional fallback ito kung ayaw gumamit ng Collections
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
                    price {
                      amount
                      currencyCode
                    }
                    compareAtPrice {
                      amount
                      currencyCode
                    }
                  }
                }
              }
              images(first: 1) {
                edges {
                  node {
                    url
                    altText
                  }
                }
              }
            }
          }
        }
      }
    `,
    variables: {
      query: `product_type:${category}`
    },
    tags: ['products', `category-${category}`]
  });
}

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
                    price {
                      amount
                      currencyCode
                    }
                  }
                }
              }
              images(first: 1) {
                edges {
                  node {
                    url
                    altText
                  }
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

export async function getProductByHandle(handle: string) {
  return shopifyFetch({
    query: `
      query getProduct($handle: String!) {
        productByHandle(handle: $handle) {
          id
          title
          handle
          descriptionHtml
          options {
            name
            values
          }
          variants(first: 20) {
            edges {
              node {
                id
                title
                selectedOptions {
                  name
                  value
                }
                price {
                  amount
                  currencyCode
                }
                image {
                  url
                  altText
                }
              }
            }
          }
          images(first: 10) {
            edges {
              node {
                url
                altText
              }
            }
          }
        }
      }
    `,
    variables: { handle },
    tags: [`product-${handle}`]
  });
}

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
              price {
                amount
                currencyCode
              }
            }
          }
        }
        images(first: 1) {
          edges {
            node {
              url
              altText
            }
          }
        }
      }
    `,
    variables: { productId },
    tags: ['recommendations']
  });
}