import { useEffect, useRef, useState } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRouterState } from "@tanstack/react-router";
import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SmoothScroll() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const lenisRef = useRef<Lenis | null>(null);
  const [showTop, setShowTop] = useState(false);
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const setup = () => {
      if (reducedMotion.matches) return;
      lenisRef.current = new Lenis({
        duration: 1.1,
        smoothWheel: true,
        anchors: { offset: -100 },
        autoRaf: false,
      });
      lenisRef.current.on("scroll", ScrollTrigger.update);
    };
    const onPreferenceChange = () => {
      lenisRef.current?.destroy();
      lenisRef.current = null;
      setup();
      ScrollTrigger.refresh();
    };
    setup();
    const onScroll = () => setShowTop(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    reducedMotion.addEventListener("change", onPreferenceChange);
    onScroll();
    const tick = (t: number) => lenisRef.current?.raf(t * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(tick);
      window.removeEventListener("scroll", onScroll);
      reducedMotion.removeEventListener("change", onPreferenceChange);
      lenisRef.current?.destroy();
      lenisRef.current = null;
    };
  }, []);
  useEffect(() => {
    if (lenisRef.current) lenisRef.current.scrollTo(0, { immediate: true });
    else window.scrollTo({ top: 0, behavior: "instant" });
    setShowTop(false);
    const frame = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(frame);
  }, [path]);
  if (!showTop) return null;
  return (
    <Button
      variant="outline"
      size="icon"
      className="fixed bottom-6 left-4 z-50 h-11 w-11 rounded-full shadow-soft md:left-6"
      aria-label="Voltar ao topo"
      title="Voltar ao topo"
      onClick={() => {
        if (lenisRef.current) lenisRef.current.scrollTo(0);
        else window.scrollTo({ top: 0, behavior: "instant" });
      }}
    >
      <ArrowUp aria-hidden="true" />
    </Button>
  );
}
