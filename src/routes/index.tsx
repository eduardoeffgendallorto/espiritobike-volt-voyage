import { useMemo, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowDown, Gift, CreditCard, ShieldCheck, Wrench, MapPin, Navigation, Instagram, Phone } from "lucide-react";
import heroBike from "@/assets/v8pro.webp";
import { products, STORE, brl } from "@/lib/products";
import { ProductCard } from "@/components/site/ProductCard";
import { Magnetic } from "@/components/site/Magnetic";
import { PageTransition } from "@/components/site/Chrome";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "EspiritoBike · Bikes elétricas em Vila Velha" },
      { name: "description", content: "Revendedor autorizado de bicicletas elétricas em Vila Velha - ES. Urban, V9 Max Ranger e V8 Pro com 6 brindes." },
      { property: "og:title", content: "EspiritoBike · Bikes elétricas" },
      { property: "og:description", content: "Catálogo de bicicletas elétricas. Pedale no seu espírito." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <PageTransition>
      <Hero />
      <Catalog />
      <Perks />
      <StoreLocation />
    </PageTransition>
  );
}

function Hero() {
  const root = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      gsap.registerPlugin(ScrollTrigger);
      gsap.from(".hero-in", { y: 60, opacity: 0, stagger: 0.12, duration: 1.1, ease: "power4.out", delay: 0.2 });
      gsap.from(".hero-bike", { x: 200, opacity: 0, duration: 1.6, ease: "power3.out", delay: 0.3 });
      const tl = gsap.timeline({
        scrollTrigger: { trigger: root.current, start: "top top", end: "+=120%", scrub: 1, pin: true },
      });
      tl.to(".hero-bike", { scale: 1.35, x: "-18vw", rotate: -4, ease: "none" }, 0)
        .to(".hero-copy", { y: -140, opacity: 0, ease: "none" }, 0)
        .to(".hero-word", { xPercent: -30, ease: "none" }, 0)
        .to(".hero-blob-a", { y: -200, ease: "none" }, 0)
        .to(".hero-blob-b", { y: 160, ease: "none" }, 0)
        .fromTo(".hero-specs", { opacity: 0, y: 60 }, { opacity: 1, y: 0, ease: "none" }, 0.5);
    },
    { scope: root },
  );

  return (
    <section ref={root} className="relative h-screen overflow-hidden grid-lines">
      <div className="hero-blob-a absolute -left-32 top-24 h-96 w-96 rounded-full bg-electric/40 blur-3xl" />
      <div className="hero-blob-b absolute -right-20 bottom-0 h-96 w-96 rounded-full bg-pinkish/50 blur-3xl" />
      <p className="hero-word pointer-events-none absolute bottom-6 left-0 whitespace-nowrap font-display text-[22vw] font-black leading-none text-ink/5">
        ELÉTRICA ELÉTRICA
      </p>

      <div className="relative mx-auto grid h-full max-w-6xl items-center gap-6 px-6 pt-24 md:grid-cols-2">
        <div className="hero-copy z-10">
          <p className="hero-in mb-4 inline-block rounded-full border border-border bg-card px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary">
            Revendedor autorizado · Vila Velha
          </p>
          <h1 className="hero-in text-5xl font-black leading-[0.95] md:text-7xl">
            Pedale <span className="text-gradient">no seu</span> espírito.
          </h1>
          <p className="hero-in mt-6 max-w-md text-lg text-muted-foreground">
            Bikes elétricas 2026/2027 com até 90 km de autonomia. Cada bike sai com 6 brindes.
          </p>
          <div className="hero-in mt-8 flex flex-wrap gap-3">
            <Magnetic>
              <a href="#catalogo" className="inline-flex items-center gap-2 rounded-full bg-ink px-7 py-4 font-semibold text-ink-foreground transition hover:bg-primary">
                Ver catálogo <ArrowDown className="h-4 w-4" />
              </a>
            </Magnetic>
            <Magnetic>
              <a href={`https://wa.me/${STORE.whatsapp}`} target="_blank" rel="noreferrer" className="inline-flex rounded-full border border-ink px-7 py-4 font-semibold transition hover:bg-ink hover:text-ink-foreground">
                Falar com vendedor
              </a>
            </Magnetic>
          </div>
        </div>
        <div className="relative">
          <img src={heroBike}alt="Ouxi V8 Pro" className="hero-bike w-full mix-blend-multiply" />
          <div className="hero-specs absolute -bottom-4 right-0 z-20 grid grid-cols-3 gap-2 rounded-2xl glass border border-border p-3 text-center shadow-soft">
            {[["1000W", "Motor"], ["48V", "Bateria"], ["90 km", "Autonomia"]].map(([v, l]) => (
              <div key={l} className="px-3">
                <p className="font-display text-lg font-bold">{v}</p>
                <p className="text-[11px] text-muted-foreground">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Catalog() {
  const root = useRef<HTMLElement>(null);
  const [maxPrice, setMaxPrice] = useState(8000);
  const [minRange, setMinRange] = useState(0);
  const [sort, setSort] = useState<"price" | "range">("price");

  const list = useMemo(
    () =>
      products
        .filter((p) => p.price <= maxPrice && p.rangeMax >= minRange)
        .sort((a, b) => (sort === "price" ? a.price - b.price : b.rangeMax - a.rangeMax)),
    [maxPrice, minRange, sort],
  );

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 1024px)", () => {
        ScrollTrigger.create({
          trigger: ".filters", start: "top 110px", endTrigger: ".products-grid", end: "bottom bottom", pin: true, pinSpacing: false,
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} id="catalogo" className="mx-auto max-w-6xl px-6 py-24">
      <div className="mb-12 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">Catálogo</p>
          <h2 className="text-4xl font-black md:text-5xl">Bikes elétricas</h2>
        </div>
        <p className="text-muted-foreground">{list.length} modelo(s)</p>
      </div>
      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside className="filters h-fit space-y-6 rounded-3xl border border-border bg-card p-6">
          <div>
            <p className="mb-2 text-sm font-semibold">Categoria</p>
            <span className="rounded-full bg-ink px-3 py-1 text-xs text-ink-foreground">Elétricas</span>
          </div>
          <label className="block">
            <span className="flex justify-between text-sm font-semibold">Preço máx. <span className="text-primary">{brl(maxPrice)}</span></span>
            <input type="range" min={6000} max={8000} step={100} value={maxPrice} onChange={(e) => setMaxPrice(+e.target.value)} className="mt-2 w-full accent-primary" />
          </label>
          <label className="block">
            <span className="flex justify-between text-sm font-semibold">Autonomia mín. <span className="text-primary">{minRange} km</span></span>
            <input type="range" min={0} max={90} step={10} value={minRange} onChange={(e) => setMinRange(+e.target.value)} className="mt-2 w-full accent-primary" />
          </label>
          <div>
            <p className="mb-2 text-sm font-semibold">Ordenar por</p>
            <div className="flex gap-2">
              {([["price", "Preço"], ["range", "Autonomia"]] as const).map(([k, l]) => (
                <button key={k} onClick={() => setSort(k)} className={`rounded-full px-3 py-1.5 text-xs font-semibold ${sort === k ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                  {l}
                </button>
              ))}
            </div>
          </div>
        </aside>
        <div className="products-grid grid gap-6 sm:grid-cols-2 xl:grid-cols-2">
          {list.map((p) => <ProductCard key={p.slug} p={p} />)}
          {!list.length && <p className="text-muted-foreground">Nenhum modelo com esses filtros.</p>}
        </div>
      </div>
    </section>
  );
}

function Perks() {
  const root = useRef<HTMLElement>(null);
  useGSAP(() => {
    gsap.from(".perk", { y: 80, opacity: 0, stagger: 0.1, duration: 0.9, ease: "power3.out", scrollTrigger: { trigger: root.current, start: "top 80%" } });
  }, { scope: root });
  const items = [
    { icon: Gift, t: "6 brindes", d: "Toda bike sai da loja com 6 brindes inclusos." },
    { icon: CreditCard, t: "Pagamento fácil", d: "Pix, cartão de crédito ou débito." },
    { icon: Wrench, t: "Manutenção", d: `Oficina própria: ${STORE.phoneService}` },
    { icon: ShieldCheck, t: "Revenda autorizada", d: "Garantia e procedência em cada modelo." },
  ];
  return (
    <section ref={root} className="mx-auto grid max-w-6xl gap-4 px-6 sm:grid-cols-2 lg:grid-cols-4">
      {items.map(({ icon: I, t, d }) => (
        <div key={t} className="perk rounded-3xl border border-border bg-card p-6">
          <div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-gradient-brand text-primary-foreground"><I className="h-6 w-6" /></div>
          <h3 className="text-lg font-bold">{t}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{d}</p>
        </div>
      ))}
    </section>
  );
}

const MAPS_EMBED =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14963.140610923845!2d-40.30336338196997!3d-20.35049243878097!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xb81604a269715f%3A0xf63aea9a4cdebf85!2sR.%20Vital%20Brasil%2C%20509%20-%20Boa%20Vista%20I%2C%20Vila%20Velha%20-%20ES%2C%2029102-770!5e0!3m2!1spt-BR!2sbr!4v1792900034762!5m2!1spt-BR!2sbr";

function StoreLocation() {
  const root = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      gsap.from(".loc-in", {
        y: 70,
        opacity: 0,
        stagger: 0.1,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: { trigger: root.current, start: "top 80%" },
      });
    },
    { scope: root },
  );
  const directions = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(STORE.address)}`;
  return (
    <section ref={root} id="localizacao" className="mx-auto max-w-6xl px-6 py-24">
      <div className="mb-10">
        <p className="loc-in text-sm font-semibold uppercase tracking-widest text-primary">Localização</p>
        <h2 className="loc-in text-4xl font-black md:text-5xl">Onde estamos</h2>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="loc-in overflow-hidden rounded-3xl border border-border bg-card p-2 shadow-soft">
          <iframe
            title="Mapa da EspiritoBike em Vila Velha - ES"
            src={MAPS_EMBED}
            width="100%"
            height="450"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
            className="h-[340px] w-full rounded-2xl md:h-[480px]"
          />
        </div>
        <div className="loc-in flex flex-col justify-center gap-8 rounded-3xl border border-border bg-card p-8">
          <div className="space-y-5 text-sm">
            <p className="flex gap-3"><MapPin className="h-5 w-5 shrink-0 text-primary" /> <span>{STORE.address}</span></p>
            <p className="flex gap-3"><Phone className="h-5 w-5 shrink-0 text-primary" /> <span>{STORE.phoneSales} · Vendas</span></p>
            <p className="flex gap-3"><Phone className="h-5 w-5 shrink-0 text-primary" /> <span>{STORE.phoneService} · Manutenção</span></p>
            <a href={STORE.instagram} target="_blank" rel="noreferrer" className="flex gap-3 hover:text-primary">
              <Instagram className="h-5 w-5 shrink-0 text-primary" /> <span>@espiritobike027</span>
            </a>
            <p className="border-t border-border pt-4 text-xs uppercase tracking-widest text-muted-foreground">
              Pagamento: Pix · Cartão de crédito · Cartão de débito
            </p>
          </div>
          <Magnetic>
            <a
              href={directions}
              target="_blank"
              rel="noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-ink px-7 py-4 font-semibold text-ink-foreground transition hover:bg-primary"
            >
              Como chegar <Navigation className="h-4 w-4" />
            </a>
          </Magnetic>
        </div>
      </div>
    </section>
  );
}
