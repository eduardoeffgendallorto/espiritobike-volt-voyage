// Regras e acesso ao banco do painel /admin. A parte "pura" (preço, validação, endereço do
// produto) não depende do navegador e tem testes em src/test/admin.test.ts.
import { supabase } from "@/lib/supabase";

export const ADMIN_KEY = ["admin-products"] as const;
export const SEM_FOTO_CHAVE = "sem-foto"; // nome que o banco guarda quando o produto ainda não tem foto
const PASTA_FOTOS = "produtos";

export type AdminRow = {
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
  active: boolean;
  sort: number;
};

/** O que o formulário guarda: tudo como texto, do jeito que a pessoa digita. */
export type FormProduto = {
  name: string;
  brand: string;
  year: string;
  category: string;
  price: string;
  old_price: string;
  price_note: string;
  colors: string; // uma cor por linha
  motor: string;
  battery: string;
  range_label: string;
  range_max: string;
  wheel: string;
  image: string; // link https:// de uma foto (ou o nome de uma foto que já vem no site)
  highlight: string;
  active: boolean;
  sort: string;
};

/** Colunas da tabela products (sem o slug, que é a chave do produto). */
export type ProdutoPayload = {
  name: string;
  brand: string;
  year: string;
  category: string;
  price: number;
  old_price: number | null;
  price_note: string | null;
  colors: string[];
  motor: string;
  battery: string;
  range_label: string;
  range_max: number;
  wheel: string | null;
  image: string;
  highlight: string;
  active: boolean;
  sort: number;
};

// Mesmos limites das regras (CHECK) do banco: o painel avisa antes de o banco recusar.
export const LIMITES = {
  nome: 120,
  marca: 60,
  ano: 20,
  categoria: 80,
  observacaoPreco: 80,
  curto: 160,
  aro: 60,
  destaque: 40,
  imagem: 500,
  cor: 60,
  maxCores: 20,
} as const;

// ---------- preço ----------

export type ResultadoNumero = { ok: true; valor: number | null } | { ok: false };

/** Aceita "7420", "7.420", "7.420,50", "R$ 7.420,5". Vazio = sem valor. */
export function parsePreco(texto: string): ResultadoNumero {
  const t = texto.replace(/R\$/gi, "").replace(/\s/g, "");
  if (t === "") return { ok: true, valor: null };
  let n: string;
  if (t.includes(",")) n = t.replace(/\./g, "").replace(",", ".");
  else if (/^\d{1,3}(\.\d{3})+$/.test(t)) n = t.replace(/\./g, "");
  else n = t;
  if (!/^\d+(\.\d{1,2})?$/.test(n)) return { ok: false };
  const valor = Number(n);
  if (!Number.isFinite(valor) || valor >= 1_000_000) return { ok: false };
  return { ok: true, valor };
}

export const precoParaTexto = (n: number | string | null): string =>
  n == null || n === ""
    ? ""
    : Number(n).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// ---------- endereço do produto (slug) ----------

/** "Ouxi V8 Pro 2027!" -> "ouxi-v8-pro-2027" (vira o endereço /produto/ouxi-v8-pro-2027). */
export function gerarSlug(nome: string): string {
  return nome
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/g, "");
}

// ---------- formulário <-> banco ----------

export const formVazio = (): FormProduto => ({
  name: "",
  brand: "",
  year: "",
  category: "Elétrica",
  price: "",
  old_price: "",
  price_note: "",
  colors: "",
  motor: "",
  battery: "",
  range_label: "",
  range_max: "",
  wheel: "",
  image: "",
  highlight: "",
  active: true,
  sort: "0",
});

export const rowToForm = (r: AdminRow): FormProduto => ({
  name: r.name,
  brand: r.brand,
  year: r.year,
  category: r.category,
  price: precoParaTexto(r.price),
  old_price: precoParaTexto(r.old_price),
  price_note: r.price_note ?? "",
  colors: r.colors.join("\n"),
  motor: r.motor,
  battery: r.battery,
  range_label: r.range_label,
  range_max: r.range_max ? String(r.range_max) : "",
  wheel: r.wheel ?? "",
  image: r.image === SEM_FOTO_CHAVE ? "" : r.image,
  highlight: r.highlight,
  active: r.active,
  sort: String(r.sort),
});

export type ResultadoForm =
  | { slug: string; payload: ProdutoPayload }
  | { erros: string[] };

/** `slugAtual`: endereço do produto que está sendo editado; vazio ao criar um produto novo. */
export function validar(f: FormProduto, slugAtual: string): ResultadoForm {
  const erros: string[] = [];
  const limite = (campo: string, valor: string, max: number) => {
    if (valor.length > max) erros.push(`${campo}: no máximo ${max} caracteres.`);
  };

  const name = f.name.trim();
  if (!name) erros.push("Nome é obrigatório.");
  limite("Nome", name, LIMITES.nome);

  const slug = slugAtual || gerarSlug(name);
  if (!slugAtual && name && !slug) erros.push("O nome precisa ter pelo menos uma letra ou número.");

  const brand = f.brand.trim();
  const year = f.year.trim();
  const category = f.category.trim() || "Elétrica";
  limite("Marca", brand, LIMITES.marca);
  limite("Ano", year, LIMITES.ano);
  limite("Categoria", category, LIMITES.categoria);

  const preco = parsePreco(f.price);
  let price = 0;
  if (!preco.ok || preco.valor === null) erros.push("Preço inválido. Exemplo: 7420 ou 7.420,00.");
  else price = preco.valor;

  const antigo = parsePreco(f.old_price);
  let old_price: number | null = null;
  if (!antigo.ok) erros.push("Preço antigo inválido. Deixe em branco se não houver.");
  else if (antigo.valor !== null) {
    old_price = antigo.valor;
    if (preco.ok && preco.valor !== null && antigo.valor <= preco.valor)
      erros.push("O preço antigo precisa ser maior que o preço atual (ele aparece riscado).");
  }

  const price_note = f.price_note.trim();
  limite("Observação do preço", price_note, LIMITES.observacaoPreco);

  const cores: string[] = [];
  for (const linha of f.colors.split("\n")) {
    const cor = linha.trim();
    if (cor && !cores.some((c) => c.toLowerCase() === cor.toLowerCase())) cores.push(cor);
  }
  if (!cores.length) erros.push("Informe pelo menos uma cor (uma por linha).");
  if (cores.length > LIMITES.maxCores) erros.push(`No máximo ${LIMITES.maxCores} cores.`);
  if (cores.some((c) => c.length > LIMITES.cor)) erros.push(`Cada cor: no máximo ${LIMITES.cor} caracteres.`);

  const motor = f.motor.trim();
  const battery = f.battery.trim();
  const range_label = f.range_label.trim();
  limite("Motor", motor, LIMITES.curto);
  limite("Bateria", battery, LIMITES.curto);
  limite("Autonomia (texto)", range_label, LIMITES.curto);

  let range_max = 0;
  const rm = f.range_max.trim();
  if (rm) {
    if (!/^\d+$/.test(rm) || Number(rm) > 500) erros.push("Autonomia máxima: número de 0 a 500 (em km).");
    else range_max = Number(rm);
  }

  const wheel = f.wheel.trim();
  limite("Aro", wheel, LIMITES.aro);

  const image = f.image.trim() || SEM_FOTO_CHAVE;
  limite("Foto", image, LIMITES.imagem);
  if (!/^[a-z0-9-]+$/.test(image) && !/^https:\/\//.test(image))
    erros.push("Foto: use um link que comece com https:// (ou envie uma foto pelo botão).");

  const highlight = f.highlight.trim();
  limite("Selo de destaque", highlight, LIMITES.destaque);

  const sortTxt = f.sort.trim();
  let sort = 0;
  if (sortTxt) {
    if (!/^-?\d{1,4}$/.test(sortTxt)) erros.push("Ordem: um número inteiro (menor aparece primeiro).");
    else sort = Number(sortTxt);
  }

  if (erros.length) return { erros };
  return {
    slug,
    payload: {
      name,
      brand,
      year,
      category,
      price,
      old_price,
      price_note: price_note || null,
      colors: cores,
      motor,
      battery,
      range_label,
      range_max,
      wheel: wheel || null,
      image,
      highlight,
      active: f.active,
      sort,
    },
  };
}

// ---------- mensagens de erro em português ----------

export function mensagemDeErro(e: unknown): string {
  const err = e as { message?: string; code?: string; status?: number } | null;
  const m = (err?.message ?? "").toLowerCase();
  const code = err?.code ?? "";
  if (m.includes("invalid login credentials")) return "E-mail ou senha incorretos.";
  if (m.includes("email not confirmed")) return "Este e-mail ainda não foi confirmado no Supabase.";
  if (err?.status === 429 || m.includes("rate limit") || m.includes("too many"))
    return "Muitas tentativas. Aguarde alguns minutos e tente de novo.";
  if (m.includes("failed to fetch") || m.includes("networkerror") || m.includes("network request failed"))
    return "Sem conexão com o servidor. Verifique a internet e tente de novo.";
  if (code === "23505" || m.includes("duplicate key"))
    return "Já existe um produto com esse nome (mesmo endereço). Mude o nome.";
  if (code === "42501" || m.includes("row-level security") || m.includes("permission denied") || m.includes("sem permissão"))
    return "Sem permissão para isso. Entre com uma conta de administrador.";
  if (code === "23514" || m.includes("check constraint")) return "Algum campo está fora do limite permitido.";
  if (m.includes("mime") || m.includes("not supported")) return "Tipo de arquivo não aceito. Use JPG, PNG ou WebP.";
  if (m.includes("exceeded") || m.includes("too large") || m.includes("payload")) return "A foto é grande demais (máximo 5 MB).";
  return "Não foi possível concluir. Tente de novo.";
}

// ---------- banco ----------

export async function listAllProducts(): Promise<AdminRow[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("sort", { ascending: true })
    .order("name", { ascending: true });
  if (error) throw error;
  return data as AdminRow[];
}

const SEM_PERMISSAO = new Error("Sem permissão para salvar.");

export async function createProduct(slug: string, payload: ProdutoPayload): Promise<void> {
  const { data, error } = await supabase.from("products").insert({ slug, ...payload }).select("slug");
  if (error) throw error;
  if (!data?.length) throw SEM_PERMISSAO;
}

export async function updateProduct(slug: string, payload: ProdutoPayload): Promise<void> {
  const { data, error } = await supabase.from("products").update(payload).eq("slug", slug).select("slug");
  if (error) throw error;
  if (!data?.length) throw SEM_PERMISSAO;
}

export async function setActive(slug: string, active: boolean): Promise<void> {
  const { data, error } = await supabase.from("products").update({ active }).eq("slug", slug).select("slug");
  if (error) throw error;
  if (!data?.length) throw SEM_PERMISSAO;
}

/** Foto do produto no Storage (se for uma das nossas), para apagar junto com o produto. */
export const caminhoDaFoto = (url: string): string | null => {
  const m = url.match(new RegExp(`/object/public/${PASTA_FOTOS}/(.+)$`));
  return m?.[1] ? decodeURIComponent(m[1]) : null;
};

export async function deleteProduct(row: Pick<AdminRow, "slug" | "image">): Promise<void> {
  const { data, error } = await supabase.from("products").delete().eq("slug", row.slug).select("slug");
  if (error) throw error;
  if (!data?.length) throw SEM_PERMISSAO;
  const caminho = caminhoDaFoto(row.image);
  if (caminho) await supabase.storage.from(PASTA_FOTOS).remove([caminho]).catch(() => undefined);
}

// ---------- fotos ----------

/** Reduz a foto (lado maior 1400 px) e converte para WebP: leve para o site e dentro dos 5 MB. */
export async function prepararFoto(file: File, ladoMaximo = 1400): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const escala = Math.min(1, ladoMaximo / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * escala));
  canvas.height = Math.max(1, Math.round(bitmap.height * escala));
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const blob = await new Promise<Blob | null>((ok) => canvas.toBlob(ok, "image/webp", 0.88));
  if (!blob) throw new Error("Não foi possível preparar a foto.");
  return blob; // alguns navegadores devolvem PNG se não souberem gerar WebP: tudo bem, o banco aceita os dois
}

export async function enviarFoto(file: File, slugBase: string): Promise<string> {
  const blob = await prepararFoto(file);
  const extensao = blob.type === "image/png" ? "png" : blob.type === "image/jpeg" ? "jpg" : "webp";
  const caminho = `${slugBase || "produto"}-${Date.now()}.${extensao}`;
  const { error } = await supabase.storage
    .from(PASTA_FOTOS)
    .upload(caminho, blob, { contentType: blob.type || "image/webp", cacheControl: "31536000" });
  if (error) throw error;
  return supabase.storage.from(PASTA_FOTOS).getPublicUrl(caminho).data.publicUrl;
}