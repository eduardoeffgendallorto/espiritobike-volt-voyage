import { Link } from "@tanstack/react-router";
import { Battery, Gauge, Zap, Check, Plus } from "lucide-react";
import { toast } from "sonner";
import { brl, type Product } from "@/lib/products";
import { useStore } from "@/lib/store";
import { Magnetic } from "./Magnetic";
import { Button } from "@/components/ui/button";

export function ProductCard({ p }: { p: Product }) {
  const { addToCart, toggleCompare, compare } = useStore();
  const inCompare = compare.includes(p.slug);
  return (
    <article className="product-card group relative overflow-hidden rounded-3xl border border-border bg-card p-5 transition duration-500 hover:scale-[1.02] hover:border-electric hover:shadow-glow">
      <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-electric/0 blur-3xl transition duration-700 group-hover:bg-electric/30" />
      <div className="flex items-center justify-between">
        <span className="rounded-full bg-pinkish/30 px-3 py-1 text-xs font-semibold">{p.highlight}</span>
        <span className="text-xs text-muted-foreground">{p.year}</span>
      </div>
      <Link to="/produto/$slug" params={{ slug: p.slug }} className="block">
        <img src={p.image} alt={p.name} loading="lazy" className="mx-auto my-4 aspect-[4/3] w-full object-contain transition duration-700 group-hover:-translate-y-2" />
        <p className="text-xs uppercase tracking-widest text-primary">{p.brand}</p>
        <h3 className="text-xl font-bold">{p.name}</h3>
      </Link>
      <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
        <Spec icon={<Zap className="h-3.5 w-3.5" />} v={p.motor === "Não informado" ? p.motor : (p.motor.split(" ")[0] ?? "")} />
        <Spec icon={<Battery className="h-3.5 w-3.5" />} v={(p.battery.split(" (")[0] ?? "").replace("Lítio ", "")} />
        <Spec icon={<Gauge className="h-3.5 w-3.5" />} v={`${p.rangeMax} km`} />
      </div>
      <div className="mt-5 flex items-end justify-between">
        <div>
          {p.oldPrice && <p className="text-xs text-muted-foreground line-through">{brl(p.oldPrice)}</p>}
          <p className="font-display text-2xl font-bold">{brl(p.price)}</p>
          {p.priceNote && <p className="text-[11px] text-muted-foreground">{p.priceNote}</p>}
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Magnetic>
          <Button
            onClick={() => { addToCart(p.slug); toast.success(`${p.name} adicionada ao carrinho`); }}
            className="h-auto rounded-full bg-ink px-5 py-3 text-sm font-semibold text-ink-foreground transition hover:bg-primary"
          >
            Adicionar
          </Button>
        </Magnetic>
        <Magnetic>
          <Button
            variant="outline"
            onClick={() => toggleCompare(p.slug)}
            className={`flex h-auto items-center gap-1 rounded-full border px-4 py-3 text-sm font-semibold transition ${inCompare ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-ink"}`}
          >
            {inCompare ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />} Comparar
          </Button>
        </Magnetic>
      </div>
    </article>
  );
}

const Spec = ({ icon, v }: { icon: React.ReactNode; v: string }) => (
  <div className="flex min-w-0 items-center gap-1 rounded-xl bg-muted px-2 py-2 font-medium [&>svg]:shrink-0">{icon}<span className="break-words" title={v}>{v}</span></div>
);
