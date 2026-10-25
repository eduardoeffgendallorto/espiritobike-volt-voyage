import { createFileRoute, Link } from "@tanstack/react-router";
import { X } from "lucide-react";
import { brl, getProduct, type Product } from "@/lib/products";
import { useStore } from "@/lib/store";
import { PageTransition } from "@/components/site/Chrome";

export const Route = createFileRoute("/comparar")({
  head: () => ({
    meta: [
      { title: "Comparar bikes · EspiritoBike" },
      { name: "description", content: "Compare motor, bateria e autonomia das bikes elétricas lado a lado." },
      { property: "og:title", content: "Comparar bikes · EspiritoBike" },
      { property: "og:description", content: "Compare as bikes elétricas da EspiritoBike." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Compare,
});

const rows: [string, (p: Product) => string][] = [
  ["Preço", (p) => brl(p.price)],
  ["Categoria", (p) => p.category],
  ["Motor", (p) => p.motor],
  ["Bateria", (p) => p.battery],
  ["Autonomia", (p) => p.range],
  ["Cores", (p) => p.colors.join(", ")],
];

function Compare() {
  const { compare, toggleCompare } = useStore();
  const list = compare.map(getProduct).filter(Boolean) as Product[];
  return (
    <PageTransition>
      <div className="mx-auto max-w-6xl px-6 pb-12 pt-32">
        <h1 className="mb-8 text-4xl font-black">Comparar</h1>
        {!list.length ? (
          <div className="rounded-3xl border border-border bg-card p-12 text-center">
            <p className="text-muted-foreground">Adicione até 3 bikes para comparar.</p>
            <Link to="/" className="mt-6 inline-block rounded-full bg-ink px-6 py-3 font-semibold text-ink-foreground">Ver catálogo</Link>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-3xl border border-border bg-card">
            <table className="w-full min-w-[600px] text-sm">
              <thead>
                <tr>
                  <th className="w-36" />
                  {list.map((p) => (
                    <th key={p.slug} className="p-4 text-left align-top">
                      <div className="relative">
                        <button onClick={() => toggleCompare(p.slug)} className="absolute right-0 top-0 rounded-full bg-muted p-1" aria-label="Remover"><X className="h-4 w-4" /></button>
                        <img src={p.image} alt={p.name} className="h-28 w-full object-contain" />
                        <p className="mt-2 font-display text-lg">{p.name}</p>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map(([l, f]) => (
                  <tr key={l} className="border-t border-border">
                    <td className="p-4 font-semibold text-muted-foreground">{l}</td>
                    {list.map((p) => <td key={p.slug} className="p-4">{f(p)}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
