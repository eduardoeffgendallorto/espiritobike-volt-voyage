// Catálogo vindo do Supabase, com o catálogo do código (src/lib/products.ts) como reserva.
import { useQuery, type QueryClient } from "@tanstack/react-query";
import { products as bundled, type Product } from "@/lib/products";
import { supabase, SUPABASE_CONFIGURADO } from "@/lib/supabase";
import urban from "@/assets/urban.png";
import v9 from "@/assets/v9-maxx.png";
import v8 from "@/assets/v8pro.webp";

// Fotos que já vêm dentro do site. No banco, o campo "image" guarda o nome (ex.: urban)
// ou um link https:// de uma foto enviada. Nome desconhecido = imagem padrão.
const FOTOS_DO_SITE: Record<string, string> = { urban, "v9-maxx": v9, v8pro: v8 };
export const SEM_FOTO = "/placeholder.svg";

export const resolveImage = (key: string): string =>
  key.startsWith("https://") ? key : (FOTOS_DO_SITE[key] ?? SEM_FOTO);

type ProductRow = {
  slug: string;
  name: string;
  brand: string;
  year: string;
  category: string;
  price: number | string;
  old_price: number | string | null;
  price_note: string | null;
  colors: string[];
  motor: string;
  battery: string;
  range_label: string;
  range_max: number;
  wheel: string | null;
  image: string;
  highlight: string;
};

const NAO_INFORMADO = "Não informado";

export const rowToProduct = (r: ProductRow): Product => ({
  slug: r.slug,
  name: r.name,
  brand: r.brand,
  year: r.year,
  category: r.category,
  price: Number(r.price),
  ...(r.old_price != null && { oldPrice: Number(r.old_price) }),
  ...(r.price_note != null && r.price_note !== "" && { priceNote: r.price_note }),
  colors: r.colors ?? [],
  motor: r.motor || NAO_INFORMADO,
  battery: r.battery || NAO_INFORMADO,
  range: r.range_label || NAO_INFORMADO,
  rangeMax: r.range_max ?? 0,
  ...(r.wheel != null && r.wheel !== "" && { wheel: r.wheel }),
  image: resolveImage(r.image),
  highlight: r.highlight,
});

export async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("active", true)
    .order("sort", { ascending: true })
    .order("name", { ascending: true });
  if (error) throw error;
  return (data as ProductRow[]).map(rowToProduct);
}

export const CATALOG_KEY = ["catalog"] as const;

/** Para os loaders das rotas: catálogo do banco, ou o do código se o banco não responder. */
export async function loadCatalog(queryClient: QueryClient): Promise<Product[]> {
  if (!SUPABASE_CONFIGURADO) return bundled;
  try {
    return await queryClient.ensureQueryData({
      queryKey: CATALOG_KEY,
      queryFn: fetchProducts,
      staleTime: 60_000,
    });
  } catch {
    return bundled;
  }
}

/**
 * Catálogo para os componentes.
 * - isLoading: o banco ainda não respondeu (mostre um esqueleto na lista).
 * - isFallback: o banco falhou e estamos usando a cópia do código (preços podem estar velhos).
 * - getProduct: enquanto carrega, resolve pelos modelos do código para não "piscar".
 */
export function useCatalog() {
  const q = useQuery({
    queryKey: CATALOG_KEY,
    queryFn: fetchProducts,
    staleTime: 60_000,
    retry: 1,
    enabled: SUPABASE_CONFIGURADO,
  });
  const demo = !SUPABASE_CONFIGURADO;
  const isLoading = !demo && q.isPending;
  const isFallback = !demo && q.isError && !q.data;
  const products: Product[] = demo ? bundled : (q.data ?? (isFallback ? bundled : []));
  const getProduct = (slug: string): Product | undefined =>
    products.find((p) => p.slug === slug) ??
    (isLoading ? bundled.find((p) => p.slug === slug) : undefined);
  return { products, isLoading, isFallback, getProduct };
}