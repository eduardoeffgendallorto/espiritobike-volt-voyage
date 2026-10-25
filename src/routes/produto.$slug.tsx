import { useRef } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ArrowLeft, Gift } from "lucide-react";
import { toast } from "sonner";
import { brl, getProduct, STORE } from "@/lib/products";
import { useStore } from "@/lib/store";
import { Magnetic } from "@/components/site/Magnetic";
import { PageTransition } from "@/components/site/Chrome";

export const Route = createFileRoute("/produto/$slug")({
  loader: ({ params }) => {
    const p = getProduct(params.slug);
    if (!p) throw notFound();
    return p;
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.name} ${loaderData.year} · EspiritoBike` },
          { name: "description", content: `${loaderData.name}: motor ${loaderData.motor}, bateria ${loaderData.battery}, ${loaderData.range}.` },
          { property: "og:title", content: `${loaderData.name} · EspiritoBike` },
          { property: "og:description", content: `Bike elétrica ${loaderData.name} por ${brl(loaderData.price)}.` },
          { property: "og:type", content: "website" },
          { name: "twitter:card", content: "summary_large_image" },
        ]
      : [{ title: "Indisponível · EspiritoBike" }, { name: "robots", content: "noindex" }],
  }),
  component: ProductPage,
});

function ProductPage() {
  const p = Route.useLoaderData();
  const { addToCart, toggleCompare, compare } = useStore();
  const root = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    gsap.from(".pd-img", { x: -120, opacity: 0, duration: 1.2, ease: "power3.out" });
    gsap.from(".pd-in", { y: 40, opacity: 0, stagger: 0.08, duration: 0.8, ease: "power3.out", delay: 0.2 });
  }, { scope: root });
  const specs = [["Categoria", p.category], ["Motor", p.motor], ["Bateria", p.battery], ["Autonomia", p.range], ["Cores", p.colors.join(", ")]];
  return (
    <PageTransition>
      <div ref={root} className="mx-auto max-w-6xl px-6 pb-12 pt-32">
        <Link to="/" className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Catálogo</Link>
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div className="relative rounded-[2.5rem] bg-card p-8 grid-lines">
            <div className="absolute inset-10 rounded-full bg-electric/30 blur-3xl" />
            <img src={p.image} alt={p.name} className="pd-img relative w-full object-contain mix-blend-multiply" />
          </div>
          <div>
            <p className="pd-in text-sm font-semibold uppercase tracking-widest text-primary">{p.brand} · {p.year}</p>
            <h1 className="pd-in text-5xl font-black">{p.name}</h1>
            <div className="pd-in mt-4">
              {p.oldPrice && <span className="mr-2 text-muted-foreground line-through">{brl(p.oldPrice)}</span>}
              <span className="font-display text-3xl font-bold">{brl(p.price)}</span>
              {p.priceNote && <p className="text-sm text-muted-foreground">{p.priceNote}</p>}
            </div>
            <dl className="pd-in mt-8 divide-y divide-border rounded-2xl border border-border bg-card">
              {specs.map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 px-5 py-3 text-sm"><dt className="text-muted-foreground">{k}</dt><dd className="text-right font-medium">{v}</dd></div>
              ))}
            </dl>
            <p className="pd-in mt-4 flex items-center gap-2 text-sm"><Gift className="h-4 w-4 text-primary" /> Acompanha 6 brindes · Pix, crédito ou débito</p>
            <div className="pd-in mt-8 flex flex-wrap gap-3">
              <Magnetic><button onClick={() => { addToCart(p.slug); toast.success("Adicionada ao carrinho"); }} className="rounded-full bg-ink px-7 py-4 font-semibold text-ink-foreground hover:bg-primary">Adicionar ao carrinho</button></Magnetic>
              <Magnetic><button onClick={() => toggleCompare(p.slug)} className="rounded-full border border-ink px-7 py-4 font-semibold">{compare.includes(p.slug) ? "Na comparação ✓" : "Comparar"}</button></Magnetic>
              <a href={`https://wa.me/${STORE.whatsapp}?text=${encodeURIComponent(`Olá! Tenho interesse na ${p.name}.`)}`} target="_blank" rel="noreferrer" className="rounded-full bg-whatsapp px-7 py-4 font-semibold text-primary-foreground">WhatsApp</a>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
