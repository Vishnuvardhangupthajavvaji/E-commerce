// frontend/src/context/WishlistContext.jsx

import { createContext, useContext, useEffect, useState } from "react";
import API from "../api/axios";
import { AuthContext } from "./AuthContext";

export const WishlistContext = createContext();

export function WishlistProvider({ children }) {
  const { token } = useContext(AuthContext);

  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(false);

  // Derived Set from items — always in sync, no separate state needed
  const wishlistedIds = new Set(items.map(i => i.product?.id).filter(Boolean));

  useEffect(() => {
    if (!token) { setItems([]); return; }
    setLoading(true);
    API.get("wishlist/")
      .then(res => setItems(res.data))
      .catch(err => console.log(err))
      .finally(() => setLoading(false));
  }, [token]);

  const toggleWishlist = async (productId) => {
    if (!token) return false;

    try {
      const res = await API.post("wishlist/toggle/", { product_id: productId });

      // After your backend fix, res.data will be:
      //   { wishlisted: true }  → product was ADDED
      //   { wishlisted: false } → product was REMOVED
      const nowWishlisted = res.data.wishlisted;

      if (nowWishlisted) {
        // Re-fetch to get the full product object (name, image, price)
        // needed to render the Wishlist page correctly
        API.get("wishlist/")
          .then(res => setItems(res.data));
      } else {
        // Remove instantly from local state — no re-fetch needed
        setItems(prev => prev.filter(i => i.product.id !== productId));
      }

      return nowWishlisted;
    } catch (err) {
      console.log(err);
      return false;
    }
  };

  const isWishlisted = (id) => wishlistedIds.has(id);

  return (
    <WishlistContext.Provider value={{
      items,
      wishlistedIds,
      toggleWishlist,
      isWishlisted,
      loading,
    }}>
      {children}
    </WishlistContext.Provider>
  );
}