"use server";

const domain = process.env.SHOPIFY_STORE_DOMAIN;
const storefrontAccessToken = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;

export async function shopifyFetch({ query, variables = {} }: { query: string, variables?: any }) {
  const endpoint = `https://${domain}/api/2024-01/graphql.json`;

  try {
    const result = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': storefrontAccessToken!,
      },
      body: JSON.stringify({ query, variables }),
      next: { revalidate: 10 } 
    });

    const body = await result.json();

    // Check for GraphQL errors (e.g., syntax errors in your query)
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

export async function getAllProducts() {
  return shopifyFetch({
    query: `{
      products(first: 10) {
        edges {
          node {
            id
            title
            handle
            description
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
            }
            images(first: 1) {
              edges {
                node {
                  url
                  altText
                  width
                  height
                }
              }
            }
          }
        }
      }
    }`
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
              description
              priceRange {
                minVariantPrice {
                  amount
                  currencyCode
                }
              }
              images(first: 1) {
                edges {
                  node {
                    url
                    altText
                    width
                    height
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
  // DEBUG LOGS - Check your terminal!
  console.log(`[SHOPIFY_DEBUG] Attempting fetch for handle: ${handle}`);

  const res = await shopifyFetch({
    query: `
      query getProduct($handle: String!) {
        productByHandle(handle: $handle) {
          id
          title
          handle
          description
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          images(first: 5) {
            edges {
              node {
                url
                altText
                width
                height
              }
            }
          }
        }
      }
    `,
    variables: {
      handle: handle
    }
  });

  if (res.body?.data?.productByHandle) {
    console.log(`[SHOPIFY_DEBUG] Success: Found ${res.body.data.productByHandle.title}`);
  } else {
    console.warn(`[SHOPIFY_DEBUG] Failed: No product found for handle: ${handle}`);
  }

  return res;
}