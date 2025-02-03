import { shopifyApi } from '@shopify/shopify-api';
import '@shopify/shopify-api/adapters/node';

const API_KEY = "Your API KEY";
const API_SECRET = "API Secret";
const SCOPES = ["read_products"];
const HOST_NAME = "anatta-test-store.myshopify.com";
const ADMIN_TOKEN = "admin token";

const shopify = shopifyApi({
  apiKey: API_KEY,
  apiSecretKey: API_SECRET,
  scopes: SCOPES,
  hostName: HOST_NAME,
  isEmbeddedApp: false,
  apiVersion: "2023-01",
});

async function fetchProductsByName(productName) {
  const queryString = `
    query ($productName: String!) {
      products(first: 10, query: $productName) {
        edges {
          node {
            title
          }
        }
      }
    }
  `;

  const session = {
    shop: "anatta-test-store.myshopify.com",
    accessToken: ADMIN_TOKEN,
  };

  const client = new shopify.clients.Graphql({ session });

  try {
    const response = await client.query({
      data: queryString,
      variables: { productName },
    });

    const products = response.body.data.products.edges;

    if (products.length === 0) {
      console.log("No products found for the given name.");
      return;
    }

    const result = [];

    products.forEach((product) => {
      const title = product.node.title;
      const variants = product.node.variants.edges.map((variant) => ({
        title: variant.node.title,
        price: parseFloat(variant.node.price),
      }));

      variants.sort((a, b) => a.price - b.price);

      variants.forEach((variant) => {
        result.push(`${title} - ${variant.title} - price $${variant.price}`);
      });
    });

    result.forEach((line) => console.log(line));
  } catch (error) {
    console.error("Error fetching products:", error.response?.data || error.message);
  }
}

const args = process.argv.slice(2);
const nameArgIndex = args.indexOf("--name");
if (nameArgIndex !== -1 && args[nameArgIndex + 1]) {
  const productName = args[nameArgIndex + 1];
  console.log(productName)
  fetchProductsByName(productName);
} else {
  console.log("Usage: node app.js --name <product-name>");
}
