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
      console.error('[SHOPIFY_ERROR]:', JSON.stringify(body.errors, null, 2));
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
 * CHECKOUT CREATION
 * Converts Zustand cart items into a Shopify Checkout URL
 */
export async function createCheckout(lineItems: { variantId: string; quantity: number }[]) {
  const query = `
    mutation checkoutCreate($input: CheckoutCreateInput!) {
      checkoutCreate(input: $input) {
        checkout {
          id
          webUrl
        }
        checkoutUserErrors {
          code
          field
          message
        }
      }
    }
  `;

  const variables = {
    input: {
      lineItems: lineItems.map(item => ({
        variantId: item.variantId,
        quantity: item.quantity
      }))
    }
  };

  const res = await shopifyFetch({
    query,
    variables,
  });

  // I-return ang checkout object (nandoon ang webUrl)
  return res.body.data?.checkoutCreate?.checkout;
}

export async function getAllProducts() {
  return shopifyFetch({
    query: `{
      products(first: 10) {
        edges {
          node {
            id
            title
            handle
            descriptionHtml
            variants(first: 1) {
              edges {
                node {
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

export async function getSearchResults(searchTerm: string) {
  return shopifyFetch({
    query: `
      query getProducts($query: String!) {
        products(first: 10, query: $query) {
          edges {
            node {
              id
              title
              handle
              descriptionHtml
              variants(first: 1) {
                edges {
                  node {
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
      query: searchTerm
    }
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
                compareAtPrice {
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
    variables: {
      handle: handle
    },
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
    `,
    variables: {
      productId: productId
    },
    tags: ['recommendations']
  });
}