import { createContext, useEffect, useState } from "react";

export const CartContext = createContext({});

export function CartContextProvider({ children }) {
  const ls = typeof window !== "undefined" ? window.localStorage : null;
  const [cartProducts, setCartProducts] = useState({});

  useEffect(() => {
    if (Object.keys(cartProducts).length > 0) {
      ls?.setItem('cart', JSON.stringify(cartProducts));
    }
  }, [cartProducts]);

  useEffect(() => {
    if (ls && ls.getItem('cart')) {
      setCartProducts(JSON.parse(ls.getItem('cart')));
    }
  }, []);

  function addProduct(productId) {
    setCartProducts(prev => {
      const updatedCart = { ...prev };
      if (updatedCart[productId]) {
        updatedCart[productId] += 1;
      } else {
        updatedCart[productId] = 1;
      }
      return updatedCart;
    });
  }

  function removeProduct(productId) {
    setCartProducts(prev => {
      const updatedCart = { ...prev };
      if (updatedCart[productId]) {
        if (updatedCart[productId] > 1) {
          updatedCart[productId] -= 1;
        } else {
          delete updatedCart[productId];
        }
      }
      return updatedCart;
    });
  }

  function clearCart() {
    setCartProducts({});
    ls?.removeItem('cart');
  }

  return (
    <CartContext.Provider value={{ cartProducts, setCartProducts, addProduct, removeProduct, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}