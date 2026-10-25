import { useRef } from "react";
import { Link } from "@tanstack/react-router";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ShoppingBag, GitCompareArrows, MessageCircle, Instagram, MapPin, Phone, X } from "lucide-react";
import logo from "@/assets/logo.png";
import { useStore } from "@/lib/store";
import { getProduct, STORE } from "@/lib/products";

export function Header() {
  const { cart, compare } = useStore();
  const count = Object.values(cart).reduce((a, b) => a + b, 0);
  const links = [
    { to: "/", label: "Catálogo" },
    { to: "/comparar", label: "Comparar" },
    { to: "/carrinho", label: "Carrinho" },
  ] as const;
  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4">
      <div className="glass mx-auto flex max-w-6xl items-center justify-between rounded-full border border-border/60 px-4 py-2 shadow-soft">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="EspiritoBike" className="h-10 w-10 object-contain" />
          <span className="font-display text-sm font-bold tracking-tight">ESPIRITOBIKE</span>
        </Link>
        <nav className="hidden gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition hover:text-foreground"
              activeProps={{ className: "bg-ink text-ink-foreground hover:text-ink-foreground" }}
              activeOptions={{ exact: true }}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link to="/comparar" className="relative rounded-full p-2 hover:bg-muted" aria-label="Comparar">
            <GitCompareArrows className="h-5 w-5" />
            {compare.length > 0 && <Badge n={compare.length} />}
          </Link>
          <Link to="/carrinho" className="relative rounded-full p-2 hover:bg-muted" aria-label="Carrinho">
            <ShoppingBag className="h-5 w-5" />
            {count > 0 && <Badge n={count} />}
          </Link>
        </div>
      </div>
    </header>
  );
}

const Badge = ({ n }: { n: number }) => (
  <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
    {n}
  </span>
);

export function WhatsAppFloat() {
  const ref = useRef<HTMLAnchorElement>(null);
  useGSAP(() => {
    gsap.from(ref.current, { scale: 0, y: 60, duration: 1.4, delay: 1, ease: "elastic.out(1,0.45)" });
    gsap.to(ref.current, { y: -6, repeat: -1, yoyo: true, duration: 1.6, ease: "sine.inOut", delay: 2.4 });
  });
  return (
    <a
      ref={ref}
      href={`https://wa.me/${STORE.whatsapp}?text=${encodeURIComponent("Olá! Vim pelo site da EspiritoBike.")}`}
      target="_blank"
      rel="noreferrer"
      aria-label="Falar no WhatsApp"
      className="fixed bottom-6 right-6 z-50 grid h-14 w-14 place-items-center rounded-full bg-whatsapp text-primary-foreground shadow-glow"
    >
      <MessageCircle className="h-7 w-7" />
    </a>
  );
}

export function CompareBar() {
  const { compare, toggleCompare } = useStore();
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      if (compare.length) gsap.fromTo(ref.current, { y: 120 }, { y: 0, duration: 1, ease: "elastic.out(1,0.6)" });
    },
    { dependencies: [compare.length > 0] },
  );
  if (!compare.length) return null;
  return (
    <div ref={ref} className="fixed inset-x-0 bottom-6 z-40 flex justify-center px-4">
      <div className="glass flex items-center gap-3 rounded-full border border-border/60 py-2 pl-3 pr-2 shadow-soft">
        {compare.map((s) => {
          const p = getProduct(s)!;
          return (
            <button key={s} onClick={() => toggleCompare(s)} className="group relative" aria-label={`Remover ${p.name}`}>
              <img src={p.image} alt={p.name} className="h-10 w-14 rounded-lg bg-card object-contain" />
              <X className="absolute -right-1 -top-1 hidden h-4 w-4 rounded-full bg-ink p-0.5 text-ink-foreground group-hover:block" />
            </button>
          );
        })}
        <Link to="/comparar" className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-ink-foreground">
          Comparar ({compare.length})
        </Link>
      </div>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="mt-24 bg-ink text-ink-foreground">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-3">
            <img src={logo} alt="" className="h-14 w-14 object-contain" />
            <div>
              <p className="font-display font-bold">ESPIRITOBIKE</p>
              <p className="text-sm opacity-70">Revendedor Autorizado</p>
            </div>
          </div>
          <p className="mt-4 font-display text-lg text-gradient">{STORE.tagline}</p>
        </div>
        <div className="space-y-3 text-sm opacity-90">
          <p className="flex gap-2"><Phone className="h-4 w-4 shrink-0" /> {STORE.phoneSales} · Vendas</p>
          <p className="flex gap-2"><Phone className="h-4 w-4 shrink-0" /> {STORE.phoneService} · Manutenção</p>
          <a href={STORE.instagram} target="_blank" rel="noreferrer" className="flex gap-2 hover:text-electric">
            <Instagram className="h-4 w-4 shrink-0" /> @espiritobike027
          </a>
        </div>
        <div className="space-y-3 text-sm opacity-90">
          <p className="flex gap-2"><MapPin className="h-4 w-4 shrink-0" /> {STORE.address}</p>
          <p>Pagamento: Pix · Cartão de crédito · Cartão de débito</p>
        </div>
      </div>
      <p className="border-t border-ink-foreground/10 py-6 text-center text-xs opacity-60">
        © {new Date().getFullYear()} EspiritoBike
      </p>
    </footer>
  );
}

export function PageTransition({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    gsap.fromTo(
      ref.current,
      { clipPath: "inset(8% 4% 0% 4% round 32px)", opacity: 0 },
      { clipPath: "inset(0% 0% 0% 0% round 0px)", opacity: 1, duration: 0.9, ease: "power3.out", clearProps: "clipPath" },
    );
  });
  return <div ref={ref}>{children}</div>;
}
