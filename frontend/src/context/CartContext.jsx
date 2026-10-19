import { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext(null);
export const useCart = () => useContext(CartContext);

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem("cart")) || []; }
    catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(items));
  }, [items]);

  const add = (crop, n=1 ) =>
    setItems((prev) => {
      const found = prev.find((i) => i._id === crop._id);
      if (found) {
        return prev.map((i) =>
          i._id === crop._id ? { ...i, qty: Math.min(i.qty + 1, i.stock) } : i
        );
      }
      return [
        ...prev,
        {
          _id: crop._id,
          name: crop.name,
          price: crop.retailPrice,
          image: crop.images?.[0] || "",
          stock: crop.quantity,
          deliveryDays: crop.deliveryDays || 3,
          qty: 1,
          qty: Math.min(n, crop.quantity),
        },
      ];
    });

  const dec = (id) =>
    setItems((prev) =>
      prev
        .map((i) => (i._id === id ? { ...i, qty: i.qty - 1 } : i))
        .filter((i) => i.qty > 0)
    );

  const remove = (id) => setItems((prev) => prev.filter((i) => i._id !== id));
  const clear = () => setItems([]);

  const qtyOf = (id) => items.find((i) => i._id === id)?.qty || 0;
  const count = items.reduce((s, i) => s + i.qty, 0);
  const total = items.reduce((s, i) => s + i.qty * i.price, 0);

  return (
    <CartContext.Provider value={{ items, add, dec, remove, clear, qtyOf, count, total }}>
      {children}
    </CartContext.Provider>
  );
}