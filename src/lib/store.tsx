import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type Ctx = {
  cart: Record<string, number>;
  compare: string[];
  addToCart: (slug: string) => void;
  setQty: (slug: string, qty: number) => void;
  toggleCompare: (slug: string) => void;
  clearCompare: () => void;
};

const StoreCtx = createContext<Ctx | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Record<string, number>>({});
  const [compare, setCompare] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      setCart(JSON.parse(localStorage.getItem("eb-cart") || "{}"));
      setCompare(JSON.parse(localStorage.getItem("eb-compare") || "[]"));
    } catch {}
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    localStorage.setItem("eb-cart", JSON.stringify(cart));
    localStorage.setItem("eb-compare", JSON.stringify(compare));
  }, [cart, compare, ready]);

  const value: Ctx = {
    cart,
    compare,
    addToCart: (s) => setCart((c) => ({ ...c, [s]: (c[s] || 0) + 1 })),
    setQty: (s, q) =>
      setCart((c) => {
        const n = { ...c };
        if (q <= 0) delete n[s];
        else n[s] = q;
        return n;
      }),
    toggleCompare: (s) =>
      setCompare((c) => (c.includes(s) ? c.filter((x) => x !== s) : [...c, s].slice(-3))),
    clearCompare: () => setCompare([]),
  };
  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export function useStore() {
  const c = useContext(StoreCtx);
  if (!c) throw new Error("useStore outside provider");
  return c;
}
