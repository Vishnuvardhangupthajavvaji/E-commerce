import { createContext, useState, useEffect } from "react";
import API from "../api/axios";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  
  const [cartCount, setCartCount] = useState(0);

  const loadCartCount = () => {
    const token = localStorage.getItem("access");

    if (!token) return;
    
    API.get("cart/")
      .then(res => {
        let total = 0;
        res.data.forEach(i => total += i.quantity);
        setCartCount(total);
      })
      .catch(()=>{});

  };

  useEffect(() => {
    loadCartCount();
  }, []);

  return (
    <CartContext.Provider value={{ cartCount, loadCartCount }}>
      {children}
    </CartContext.Provider>
  );
};
