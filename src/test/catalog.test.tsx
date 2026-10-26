import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

// Banco de mentira: devolve as linhas que o teste definir (ou um erro).
const banco = vi.hoisted(() => ({ rows: [] as unknown[], error: null as null | Error }));

vi.mock("@/lib/supabase", () => {
  const consulta = {
    select: () => consulta,
    eq: () => consulta,
    order: () => consulta,
    // a consulta é "esperada" (await) como no Supabase de verdade
    then: (ok: (v: unknown) => unknown, fail?: (e: unknown) => unknown) =>
      Promise.resolve({ data: banco.error ? null : banco.rows, error: banco.error }).then(ok, fail),
  };
  return { SUPABASE_CONFIGURADO: true, supabase: { from: () => consulta } };
});

import { loadCatalog, resolveImage, rowToProduct, SEM_FOTO, useCatalog, fetchProducts } from "@/lib/catalog";
import { products as bundled } from "@/lib/products";

const linha = (over: Record<string, unknown> = {}) => ({
  slug: "nova-bike",
  name: "Nova",
  brand: "Marca",
  year: "2027",
  category: "Elétrica",
  price: "9500.00", // o Postgres devolve numeric como texto
  old_price: null,
  price_note: null,
  colors: ["Preto"],
  motor: "",
  battery: "48V 20Ah",
  range_label: "Até 100 km",
  range_max: 100,
  wheel: null,
  image: "sem-foto",
  highlight: "",
  ...over,
});

const comProvider = () => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
};

describe("imagens", () => {
  it("usa a foto do site, o link https ou a imagem padrão", () => {
    expect(resolveImage("urban")).not.toBe(SEM_FOTO);
    expect(resolveImage("https://exemplo.com/a.webp")).toBe("https://exemplo.com/a.webp");
    expect(resolveImage("nome-que-nao-existe")).toBe(SEM_FOTO);
  });
});

describe("rowToProduct", () => {
  it("converte preço em número e trata campos em branco", () => {
    const p = rowToProduct(linha());
    expect(p.price).toBe(9500);
    expect(p.motor).toBe("Não informado");
    expect(p).not.toHaveProperty("oldPrice");
    expect(p).not.toHaveProperty("priceNote");
    expect(p.image).toBe(SEM_FOTO);
  });
  it("mantém preço antigo, observação de preço e aro quando existem", () => {
    const p = rowToProduct(linha({ old_price: "10000", price_note: "A partir de", wheel: 'Aro 20"' }));
    expect(p.oldPrice).toBe(10000);
    expect(p.priceNote).toBe("A partir de");
    expect(p.wheel).toBe('Aro 20"');
  });
});

describe("catálogo do banco", () => {
  it("lê os produtos do banco", async () => {
    banco.error = null;
    banco.rows = [linha(), linha({ slug: "outra", name: "Outra", price: 5000 })];
    const lista = await fetchProducts();
    expect(lista.map((p) => p.slug)).toEqual(["nova-bike", "outra"]);
  });

  it("cai para o catálogo do código se o banco falhar", async () => {
    banco.error = new Error("sem conexão");
    const lista = await loadCatalog(new QueryClient());
    expect(lista).toBe(bundled);
  });

  it("useCatalog: enquanto carrega usa os modelos do código; depois, os do banco (inclusive uma bike mais cara)", async () => {
    banco.error = null;
    banco.rows = [linha()]; // R$ 9.500, acima do antigo limite de R$ 8.000 dos filtros
    const { result } = renderHook(() => useCatalog(), { wrapper: comProvider() });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.getProduct("urban-2026")).toBeDefined(); // modelo do código, sem "piscar"

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.products.map((p) => p.slug)).toEqual(["nova-bike"]);
    expect(result.current.getProduct("nova-bike")?.price).toBe(9500);
    expect(result.current.getProduct("urban-2026")).toBeUndefined(); // saiu do banco = saiu da loja
    expect(result.current.isFallback).toBe(false);
  });

  it("useCatalog: se o banco falhar, usa o catálogo do código e avisa", async () => {
    banco.error = new Error("sem conexão");
    const { result } = renderHook(() => useCatalog(), { wrapper: comProvider() });
    // o catálogo tenta de novo 1 vez (cerca de 1 s) antes de assumir que o banco caiu
    await waitFor(() => expect(result.current.isFallback).toBe(true), { timeout: 5000 });
    expect(result.current.products).toBe(bundled);
  });
});