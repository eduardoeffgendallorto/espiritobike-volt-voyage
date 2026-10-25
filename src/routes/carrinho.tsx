import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2 } from "lucide-react";
import { brl, getProduct, STORE } from "@/lib/products";
import { useStore } from "@/lib/store";
import { PageTransition } from "@/components/site/Chrome";

export const Route = createFileRoute("/carrinho")({
  head: () => ({
    meta: [
      { title: "Carrinho · EspiritoBike" },
      { name: "description", content: "Revise suas bikes elétricas e finalize pelo WhatsApp." },
      { property: "og:title", content: "Carrinho · EspiritoBike" },
      { property: "og:description", content: "Finalize seu pedido com a EspiritoBike." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Cart,
});

function Cart() {
  const { cart, setQty } = useStore();
  const items = Object.entries(cart).map(([s, q]) => ({ p: getProduct(s)!, q })).filter((i) => i.p);
  const total = items.reduce((a, i) => a + i.p.price * i.q, 0);
  const msg = `Olá! Quero finalizar meu pedido:\n${items.map((i) => `• ${i.q}x ${i.p.name} (${brl(i.p.price)})`).join("\n")}\nTotal: ${brl(total)}`;
  return (
    <PageTransition>
      <div className="mx-auto max-w-4xl px-6 pb-12 pt-32">
        <h1 className="mb-8 text-4xl font-black">Carrinho</h1>
        {!items.length ? (
          <div className="rounded-3xl border border-border bg-card p-12 text-center">
            <p className="text-muted-foreground">Seu carrinho está vazio.</p>
            <Link to="/" className="mt-6 inline-block rounded-full bg-ink px-6 py-3 font-semibold text-ink-foreground">Ver catálogo</Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-[1fr_300px]">
            <ul className="space-y-4">
              {items.map(({ p, q }) => (
                <li key={p.slug} className="flex items-center gap-4 rounded-3xl border border-border bg-card p-4">
                  <img src={p.image} alt={p.name} className="h-20 w-28 object-contain" />
                  <div className="flex-1">
                    <p className="font-bold">{p.name}</p>
                    <p className="text-sm text-muted-foreground">{brl(p.price)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setQty(p.slug, q - 1)} className="rounded-full bg-muted p-2" aria-label="Menos"><Minus className="h-4 w-4" /></button>
                    <span className="w-6 text-center font-semibold">{q}</span>
                    <button onClick={() => setQty(p.slug, q + 1)} className="rounded-full bg-muted p-2" aria-label="Mais"><Plus className="h-4 w-4" /></button>
                    <button onClick={() => setQty(p.slug, 0)} className="ml-2 p-2 text-destructive" aria-label="Remover"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </li>
              ))}
            </ul>
            <aside className="h-fit rounded-3xl bg-ink p-6 text-ink-foreground">
              <p className="text-sm opacity-70">Total</p>
              <p className="font-display text-3xl font-bold">{brl(total)}</p>
              <p className="mt-2 text-xs opacity-70">Pix, crédito ou débito · 6 brindes por bike</p>
              <a href={`https://wa.me/${STORE.whatsapp}?text=${encodeURIComponent(msg)}`} target="_blank" rel="noreferrer" className="mt-6 block rounded-full bg-gradient-brand py-3 text-center font-semibold text-ink">
                Finalizar no WhatsApp
              </a>
            </aside>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
