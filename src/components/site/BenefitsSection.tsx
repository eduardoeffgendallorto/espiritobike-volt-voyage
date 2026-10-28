import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Wallet, Timer, Plug, Zap } from "lucide-react";

const ITEMS = [
  { icon: Wallet, t: "Economia Direta", d: "Adeus IPVA e gasolina. Recarga por centavos na conta de luz." },
  { icon: Timer, t: "Agilidade no Trânsito", d: "Fuja dos congestionamentos pelas ciclovias." },
  { icon: Plug, t: "Praticidade na Recarga", d: "Bateria removível, carregue em qualquer tomada." },
  { icon: Zap, t: "Esforço Sob Medida", d: "Pedal assistido para encarar subidas e chegar sem suar." },
];

export function BenefitsSection() {
  const root = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      gsap.registerPlugin(ScrollTrigger);
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".benefit-card", {
          y: 40,
          opacity: 0,
          stagger: 0.12,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: { trigger: root.current, start: "top 80%", once: true },
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} className="mx-auto max-w-6xl px-6 py-20">
      <h2 className="mx-auto mb-12 max-w-3xl text-center text-3xl font-black md:text-5xl">
        Por que escolher uma e-bike para o seu dia a dia?
      </h2>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {ITEMS.map(({ icon: I, t, d }) => (
          <div
            key={t}
            className="benefit-card flex flex-col gap-4 rounded-3xl border border-border bg-card p-6 transition-transform duration-300 hover:-translate-y-2"
          >
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-secondary text-primary">
              <I className="h-6 w-6" aria-hidden="true" />
            </div>
            <h3 className="text-lg font-bold">{t}</h3>
            <p className="text-sm text-muted-foreground">{d}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
