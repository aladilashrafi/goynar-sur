import { createSlice } from "@reduxjs/toolkit";
import { getLocalStorage, setLocalStorage } from "@/utils/localstorage";
import { notifyError, notifySuccess } from "@/utils/toast";

const initialState = {
  wishlist: [],
  isSyncing: false,
};

function productId(product = {}) {
  return Number(product.product_id || product.id || product._id);
}

function authHeaders(getState) {
  const token = getState()?.auth?.accessToken;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function syncWishlist(getState, method, body) {
  const headers = authHeaders(getState);
  if (!headers.Authorization) return null;

  const response = await fetch("/api/account/wishlist", {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || "Wishlist could not be synced.");
  }

  return data.products || [];
}

export const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    addWishlistLocal: (state, { payload }) => {
      const isExist = state.wishlist.some((item) => String(item._id) === String(payload._id));
      if (!isExist) {
        state.wishlist.push(payload);
        notifySuccess(`${payload.title} added to wishlist`);
      } else {
        state.wishlist = state.wishlist.filter(
          (item) => String(item._id) !== String(payload._id)
        );
        notifyError(`${payload.title} removed from wishlist`);
      }
      setLocalStorage("wishlist_items", state.wishlist);
    },
    removeWishlistLocal: (state, { payload }) => {
      state.wishlist = state.wishlist.filter((item) => String(item._id) !== String(payload.id));
      notifyError(`${payload.title} removed from wishlist`);
      setLocalStorage("wishlist_items", state.wishlist);
    },
    get_wishlist_products: (state, { payload }) => {
      state.wishlist = getLocalStorage("wishlist_items");
    },
    setWishlistProducts: (state, { payload }) => {
      state.wishlist = Array.isArray(payload) ? payload : [];
      setLocalStorage("wishlist_items", state.wishlist);
    },
    setWishlistSyncing: (state, { payload }) => {
      state.isSyncing = Boolean(payload);
    },
  },
});

export const {
  addWishlistLocal,
  removeWishlistLocal,
  get_wishlist_products,
  setWishlistProducts,
  setWishlistSyncing,
} = wishlistSlice.actions;

export const sync_wishlist_from_account = () => async (dispatch, getState) => {
  const token = getState()?.auth?.accessToken;
  if (!token) {
    dispatch(get_wishlist_products());
    return;
  }

  dispatch(setWishlistSyncing(true));
  try {
    const localItems = getLocalStorage("wishlist_items");
    const productIds = localItems.map(productId).filter(Boolean);
    const products = await syncWishlist(getState, "POST", { product_ids: productIds });
    dispatch(setWishlistProducts(products));
  } catch (error) {
    dispatch(get_wishlist_products());
  } finally {
    dispatch(setWishlistSyncing(false));
  }
};

export const add_to_wishlist = (product) => async (dispatch, getState) => {
  const existed = getState().wishlist.wishlist.some((item) => String(item._id) === String(product._id));
  dispatch(addWishlistLocal(product));

  try {
    if (existed) {
      await syncWishlist(getState, "DELETE", { product_id: productId(product) });
    } else {
      await syncWishlist(getState, "POST", { product_id: productId(product) });
    }
  } catch (error) {
    notifyError("Wishlist saved locally. Login sync could not be updated.");
  }
};

export const remove_wishlist_product = (product) => async (dispatch, getState) => {
  dispatch(removeWishlistLocal(product));

  try {
    await syncWishlist(getState, "DELETE", { product_id: Number(product.id) });
  } catch (error) {
    notifyError("Wishlist saved locally. Login sync could not be updated.");
  }
};

export default wishlistSlice.reducer;
