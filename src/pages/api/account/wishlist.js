import {
  addCustomerWishlistProduct,
  getCustomerWishlist,
  removeCustomerWishlistProduct,
  setCustomerWishlistProducts,
} from "@/lib/customer-auth";
import { sendApiError } from "@/lib/api-error";
import { getProductsByIds } from "@/lib/woocommerce";
import { mapWooProducts } from "@/utils/mapWooProduct";

function getBearerToken(req) {
  const header = req.headers.authorization || "";
  return header.startsWith("Bearer ") ? header.slice(7) : "";
}

function entryProductId(entry) {
  return Number(entry?.product_id || entry?.productId || entry?.id);
}

async function mapEntriesToProducts(entries = []) {
  const ids = [...new Set(entries.map(entryProductId).filter(Boolean))];
  if (!ids.length) return [];

  const products = await getProductsByIds(ids);
  const mapped = mapWooProducts(products);
  const order = new Map(ids.map((id, index) => [String(id), index]));

  return mapped.sort((left, right) => {
    return (order.get(String(left.id)) ?? 0) - (order.get(String(right.id)) ?? 0);
  });
}

export default async function handler(req, res) {
  const token = getBearerToken(req);

  if (!token) {
    return res.status(401).json({ success: false, message: "Login is required." });
  }

  try {
    if (req.method === "GET") {
      const entries = await getCustomerWishlist(token);
      const products = await mapEntriesToProducts(entries);
      return res.status(200).json({ success: true, products, entries });
    }

    if (req.method === "POST") {
      const productIds = Array.isArray(req.body?.product_ids)
        ? req.body.product_ids
        : [req.body?.product_id];
      const entries = await setCustomerWishlistProducts(token, productIds);
      const products = await mapEntriesToProducts(entries);
      return res.status(200).json({ success: true, products, entries });
    }

    if (req.method === "DELETE") {
      const productId = Number(req.body?.product_id);
      if (!productId) {
        return res.status(400).json({ success: false, message: "Product id is required." });
      }

      const entries = await removeCustomerWishlistProduct(token, productId);
      const products = await mapEntriesToProducts(entries);
      return res.status(200).json({ success: true, products, entries });
    }

    res.setHeader("Allow", "GET,POST,DELETE");
    return res.status(405).json({ success: false, message: "Method not allowed" });
  } catch (error) {
    return sendApiError(res, error, "Wishlist could not be updated right now.");
  }
}
