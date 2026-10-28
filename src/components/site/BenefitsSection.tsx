import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Wallet, Timer, Plug, Zap } from "lucide-react";

const ITEMS = [
  { icon: Wallet, t: "Economia Direta", d: "Adeus IPVA e gasolina. Recarga por centavos na conta de luz.", tag: "R$ 0 de IPVA" },
  { icon: Timer, t: "Agilidade no Trânsito", d: "Fuja dos congestionamentos pelas ciclovias.", tag: "Sem trânsito" },
  { icon: Plug, t: "Praticidade na Recarga", d: "Bateria removível, carregue em qualquer tomada.", tag: "Tomada comum" },
  { icon: Zap, t: "Esforço Sob Medida", d: "Pedal assistido para encarar subidas e chegar sem suar.", tag: "Pedal assistido" },
];

export function BenefitsSection() {
  const root = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      gsap.registerPlugin(ScrollTrigger);
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const st = { trigger: root.current, start: "top 75%" };
        gsap.from(".benefit-head", { y: 40, opacity: 0, stagger: 0.1, duration: 0.8, ease: "power3.out", scrollTrigger: st });
        gsap.from(".benefit-card", { y: 60, opacity: 0, stagger: 0.12, duration: 0.9, delay: 0.2, ease: "power3.out", scrollTrigger: st });
        gsap.from(".benefit-icon", { scale: 0, rotate: -45, stagger: 0.12, duration: 0.6, delay: 0.5, ease: "back.out(2)", scrollTrigger: st });
        gsap.to(".benefit-blob", { y: -60, ease: "none", scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: 1 } });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  };

  return (
    <section ref={root} className="relative overflow-hidden py-24">
      <div className="benefit-blob pointer-events-none absolute left-1/2 top-1/3 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,var(--electric)_0%,transparent_65%)] opacity-25" />
      <div className="relative mx-auto max-w-6xl px-6">
        <div className="mb-14 text-center">
          <p className="benefit-head mb-3 inline-block rounded-full border border-border bg-card px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary">
            Mobilidade elétrica
          </p>
          <h2 className="benefit-head mx-auto max-w-3xl text-3xl font-black leading-tight md:text-5xl">
            Por que escolher uma <span className="text-gradient whitespace-nowrap">e‑bike</span> para o seu dia a dia?
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {ITEMS.map(({ icon: I, t, d, tag }, i) => (
            <div
              key={t}
              onPointerMove={onMove}
              className="benefit-card group relative rounded-3xl bg-border p-px transition-[translate,box-shadow] duration-300 hover:-translate-y-2 hover:bg-gradient-brand hover:shadow-glow"
            >
              <div className="relative flex h-full flex-col gap-4 overflow-hidden rounded-[calc(1.75rem-1px)] bg-card p-6">
                <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-[radial-gradient(220px_circle_at_var(--mx)_var(--my),color-mix(in_oklab,var(--electric)_18%,transparent),transparent_70%)]" />
                <span className="pointer-events-none absolute -right-2 -top-4 font-display text-7xl font-black text-ink/5 transition-colors duration-300 group-hover:text-primary/10">
                  0{i + 1}
                </span>
                <div className="benefit-icon relative grid h-14 w-14 place-items-center rounded-2xl bg-gradient-brand text-primary-foreground shadow-glow transition-transform duration-500 group-hover:rotate-[-8deg] group-hover:scale-110">
                  <I className="h-7 w-7" aria-hidden="true" />
                </div>
                <h3 className="relative text-lg font-bold">{t}</h3>
                <p className="relative flex-1 text-sm text-muted-foreground">{d}</p>
                <span className="relative w-fit rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-primary">{tag}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
