import { useRef, useState, type FormEvent, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ImagePlus, LogOut, Pencil, Plus, Trash2, X } from "lucide-react";
import { supabase, SUPABASE_CONFIGURADO } from "@/lib/supabase";
import { CATALOG_KEY, resolveImage } from "@/lib/catalog";
import { brl } from "@/lib/products";
import { useAdminSession } from "@/lib/useAdminSession";
import {
  ADMIN_KEY,
  LIMITES,
  createProduct,
  deleteProduct,
  enviarFoto,
  formVazio,
  gerarSlug,
  listAllProducts,
  mensagemDeErro,
  rowToForm,
  setActive,
  updateProduct,
  validar,
  type AdminRow,
  type FormProduto,
} from "@/lib/admin";

const campo =
  "w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20";
const botaoEscuro =
  "inline-flex items-center justify-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-ink-foreground transition hover:bg-primary disabled:opacity-50";
const botaoClaro =
  "inline-flex items-center justify-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-semibold transition hover:bg-muted disabled:opacity-50";

export function AdminPanel() {
  const sessao = useAdminSession();

  if (!SUPABASE_CONFIGURADO)
    return (
      <Cartao titulo="Painel ainda não conectado">
        <p className="text-sm text-muted-foreground">
          O site está em modo de demonstração. Para usar o painel, conecte o projeto do Supabase em{" "}
          <code>src/lib/supabase.ts</code>.
        </p>
      </Cartao>
    );
  if (sessao.status === "loading") return <p className="text-muted-foreground">Carregando...</p>;
  if (sessao.status === "out") return <Login />;
  if (sessao.status === "denied")
    return (
      <Cartao titulo="Sem acesso ao painel">
        <p className="mb-6 text-sm text-muted-foreground">
          A conta <strong>{sessao.email}</strong> entrou, mas não é administradora. Peça para incluí-la na tabela
          <code> admins</code> do Supabase.
        </p>
        <button className={botaoClaro} onClick={() => void supabase.auth.signOut()}>
          Sair
        </button>
      </Cartao>
    );
  return <Painel email={sessao.email} />;
}

function Cartao({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <div className="mx-auto max-w-md rounded-3xl border border-border bg-card p-8">
      <h1 className="mb-4 text-2xl font-black">{titulo}</h1>
      {children}
    </div>
  );
}

// ---------------------------------------------------------------- login

const MAX_TENTATIVAS = 5;
const BLOQUEIO_MS = 60_000;

function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);
  const tentativas = useRef(0);
  const bloqueadoAte = useRef(0);

  const entrar = async (e: FormEvent) => {
    e.preventDefault();
    const restante = bloqueadoAte.current - Date.now();
    if (restante > 0) {
      setErro(`Muitas tentativas. Aguarde ${Math.ceil(restante / 1000)} s e tente de novo.`);
      return;
    }
    setErro(null);
    setCarregando(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: senha });
    setCarregando(false);
    if (error) {
      tentativas.current += 1;
      if (tentativas.current >= MAX_TENTATIVAS) {
        bloqueadoAte.current = Date.now() + BLOQUEIO_MS;
        tentativas.current = 0;
        setErro("Muitas tentativas. Aguarde 1 minuto e tente de novo.");
      } else setErro(mensagemDeErro(error));
      return;
    }
    tentativas.current = 0; // o painel abre sozinho quando a sessão chega
  };

  return (
    <Cartao titulo="Painel da loja">
      <p className="mb-6 text-sm text-muted-foreground">Entre para gerenciar os produtos.</p>
      <form onSubmit={entrar} className="space-y-4">
        <Campo id="login-email" rotulo="E-mail">
          <input id="login-email" type="email" autoComplete="username" required className={campo} value={email} onChange={(e) => setEmail(e.target.value)} />
        </Campo>
        <Campo id="login-senha" rotulo="Senha">
          <input id="login-senha" type="password" autoComplete="current-password" required className={campo} value={senha} onChange={(e) => setSenha(e.target.value)} />
        </Campo>
        {erro && (
          <p role="alert" className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {erro}
          </p>
        )}
        <button type="submit" disabled={carregando} className={`${botaoEscuro} w-full`}>
          {carregando ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </Cartao>
  );
}

// ---------------------------------------------------------------- lista

function Painel({ email }: { email: string }) {
  const queryClient = useQueryClient();
  const { data, isPending, isError, refetch } = useQuery({ queryKey: ADMIN_KEY, queryFn: listAllProducts });
  const [editando, setEditando] = useState<AdminRow | "novo" | null>(null);
  const [ocupado, setOcupado] = useState<string | null>(null);

  const atualizar = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ADMIN_KEY }),
      queryClient.invalidateQueries({ queryKey: CATALOG_KEY }),
    ]);

  const alternar = async (p: AdminRow) => {
    setOcupado(p.slug);
    try {
      await setActive(p.slug, !p.active);
      await atualizar();
      toast.success(p.active ? `${p.name} agora está oculto da loja` : `${p.name} voltou para a loja`);
    } catch (e) {
      toast.error(mensagemDeErro(e));
    } finally {
      setOcupado(null);
    }
  };

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black">Painel da loja</h1>
          <p className="mt-1 text-sm text-muted-foreground">{email}</p>
        </div>
        <div className="flex gap-2">
          <button className={botaoEscuro} onClick={() => setEditando("novo")}>
            <Plus className="h-4 w-4" /> Novo produto
          </button>
          <button className={botaoClaro} onClick={() => void supabase.auth.signOut()}>
            <LogOut className="h-4 w-4" /> Sair
          </button>
        </div>
      </div>

      {isPending && <p className="text-muted-foreground">Carregando produtos...</p>}
      {isError && (
        <p className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
          Não foi possível carregar os produtos.{" "}
          <button className="underline" onClick={() => void refetch()}>
            Tentar de novo
          </button>
        </p>
      )}
      {data && !data.length && (
        <p className="rounded-3xl border border-border bg-card p-8 text-center text-muted-foreground">
          Nenhum produto ainda. Clique em “Novo produto” para começar.
        </p>
      )}

      <ul className="space-y-3">
        {(data ?? []).map((p) => (
          <li key={p.slug} className="flex flex-wrap items-center gap-4 rounded-3xl border border-border bg-card p-4">
            <img src={resolveImage(p.image)} alt="" className="h-16 w-24 rounded-xl bg-muted object-contain" />
            <div className="min-w-0 flex-1">
              <p className="truncate font-bold">{p.name}</p>
              <p className="text-sm text-muted-foreground">
                {brl(Number(p.price))}
                {!p.active && <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs font-semibold">Oculto</span>}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button className={botaoClaro} disabled={ocupado === p.slug} onClick={() => void alternar(p)}>
                {p.active ? "Ocultar" : "Mostrar"}
              </button>
              <button className={botaoClaro} onClick={() => setEditando(p)}>
                <Pencil className="h-4 w-4" /> Editar
              </button>
            </div>
          </li>
        ))}
      </ul>

      {editando && (
        <Editor
          key={editando === "novo" ? "novo" : editando.slug}
          row={editando === "novo" ? null : editando}
          onClose={() => setEditando(null)}
          onSaved={async () => {
            await atualizar();
            setEditando(null);
          }}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------- formulário

function Campo({ id, rotulo, dica, children }: { id: string; rotulo: string; dica?: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-sm font-semibold">
        {rotulo}
      </label>
      {children}
      {dica && <p className="text-xs text-muted-foreground">{dica}</p>}
    </div>
  );
}

function Editor({ row, onClose, onSaved }: { row: AdminRow | null; onClose: () => void; onSaved: () => Promise<void> }) {
  const criando = row === null;
  const [form, setForm] = useState<FormProduto>(() => (row ? rowToForm(row) : formVazio()));
  const [erros, setErros] = useState<string[]>([]);
  const [salvando, setSalvando] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const arquivo = useRef<HTMLInputElement>(null);

  const set = <K extends keyof FormProduto>(k: K, v: FormProduto[K]) => setForm((f) => ({ ...f, [k]: v }));
  const texto = (k: keyof FormProduto, id: string, max?: number) => (
    <input
      id={id}
      className={campo}
      value={String(form[k])}
      {...(max ? { maxLength: max } : {})}
      onChange={(e) => set(k, e.target.value as never)}
    />
  );

  const slug = row?.slug ?? gerarSlug(form.name);

  const escolherFoto = async (file: File | undefined) => {
    if (!file) return;
    setEnviando(true);
    try {
      set("image", await enviarFoto(file, slug));
      toast.success("Foto enviada. Salve o produto para publicar.");
    } catch (e) {
      toast.error(mensagemDeErro(e));
    } finally {
      setEnviando(false);
      if (arquivo.current) arquivo.current.value = "";
    }
  };

  const salvar = async (e: FormEvent) => {
    e.preventDefault();
    const r = validar(form, row?.slug ?? "");
    if ("erros" in r) {
      setErros(r.erros);
      return;
    }
    setErros([]);
    setSalvando(true);
    try {
      if (criando) await createProduct(r.slug, r.payload);
      else await updateProduct(r.slug, r.payload);
      toast.success(criando ? "Produto criado" : "Produto salvo", { description: r.payload.name });
      await onSaved();
    } catch (err) {
      setErros([mensagemDeErro(err)]);
    } finally {
      setSalvando(false);
    }
  };

  const apagar = async () => {
    if (!row) return;
    if (!window.confirm(`Apagar "${row.name}" de vez? Isso não pode ser desfeito.\n\nPara só tirar da loja por um tempo, use "Ocultar".`)) return;
    setSalvando(true);
    try {
      await deleteProduct(row);
      toast.success("Produto apagado", { description: row.name });
      await onSaved();
    } catch (err) {
      setErros([mensagemDeErro(err)]);
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div data-lenis-prevent className="fixed inset-0 z-[70] overflow-y-auto bg-ink/60 p-4">
      <form onSubmit={salvar} className="mx-auto my-6 max-w-2xl space-y-5 rounded-3xl bg-card p-6 shadow-soft md:p-8" aria-label={criando ? "Novo produto" : "Editar produto"}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black">{criando ? "Novo produto" : "Editar produto"}</h2>
            <p className="text-xs text-muted-foreground">
              Endereço no site: /produto/{slug || "…"}
              {criando ? " (definido pelo nome, não muda depois)" : ""}
            </p>
          </div>
          <button type="button" onClick={onClose} className="rounded-full p-2 hover:bg-muted" aria-label="Fechar" disabled={salvando}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <Campo id="ed-name" rotulo="Nome">{texto("name", "ed-name", LIMITES.nome)}</Campo>

        <div className="grid gap-4 sm:grid-cols-3">
          <Campo id="ed-brand" rotulo="Marca">{texto("brand", "ed-brand", LIMITES.marca)}</Campo>
          <Campo id="ed-year" rotulo="Ano" dica="Ex.: 2026/2027">{texto("year", "ed-year", LIMITES.ano)}</Campo>
          <Campo id="ed-category" rotulo="Categoria">{texto("category", "ed-category", LIMITES.categoria)}</Campo>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Campo id="ed-price" rotulo="Preço (R$)" dica="Ex.: 7.420,00">
            <input id="ed-price" inputMode="decimal" className={campo} value={form.price} onChange={(e) => set("price", e.target.value)} />
          </Campo>
          <Campo id="ed-old" rotulo="Preço antigo (opcional)" dica="Aparece riscado.">
            <input id="ed-old" inputMode="decimal" className={campo} value={form.old_price} onChange={(e) => set("old_price", e.target.value)} />
          </Campo>
          <Campo id="ed-note" rotulo="Observação do preço" dica="Ex.: A partir de">{texto("price_note", "ed-note", LIMITES.observacaoPreco)}</Campo>
        </div>

        <Campo id="ed-colors" rotulo="Cores" dica="Uma cor por linha.">
          <textarea id="ed-colors" rows={3} className={campo} value={form.colors} onChange={(e) => set("colors", e.target.value)} />
        </Campo>

        <div className="grid gap-4 sm:grid-cols-2">
          <Campo id="ed-motor" rotulo="Motor" dica="Em branco = “Não informado”.">{texto("motor", "ed-motor", LIMITES.curto)}</Campo>
          <Campo id="ed-battery" rotulo="Bateria" dica="Em branco = “Não informado”.">{texto("battery", "ed-battery", LIMITES.curto)}</Campo>
          <Campo id="ed-range" rotulo="Autonomia (texto)" dica="Ex.: Até 60 km">{texto("range_label", "ed-range", LIMITES.curto)}</Campo>
          <Campo id="ed-rangemax" rotulo="Autonomia máxima (km)" dica="Número, para o filtro do catálogo.">
            <input id="ed-rangemax" inputMode="numeric" className={campo} value={form.range_max} onChange={(e) => set("range_max", e.target.value)} />
          </Campo>
          <Campo id="ed-wheel" rotulo="Aro (opcional)">{texto("wheel", "ed-wheel", LIMITES.aro)}</Campo>
          <Campo id="ed-highlight" rotulo="Selo de destaque (opcional)" dica="Ex.: Lançamento">{texto("highlight", "ed-highlight", LIMITES.destaque)}</Campo>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-semibold">Foto</p>
          <div className="flex flex-wrap items-center gap-4">
            <img src={resolveImage(form.image.trim() || "sem-foto")} alt="Prévia da foto" className="h-24 w-36 rounded-xl bg-muted object-contain" />
            <div className="space-y-2">
              <input ref={arquivo} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => void escolherFoto(e.target.files?.[0])} />
              <button type="button" className={botaoClaro} disabled={enviando} onClick={() => arquivo.current?.click()}>
                <ImagePlus className="h-4 w-4" /> {enviando ? "Enviando..." : "Escolher foto"}
              </button>
              <p className="text-xs text-muted-foreground">Prefira bike inteira, de lado, com fundo limpo. JPG, PNG ou WebP.</p>
            </div>
          </div>
          <Campo id="ed-image" rotulo="Ou cole o link da foto" dica="Começa com https://. Em branco = imagem padrão.">
            <input id="ed-image" className={campo} value={form.image} maxLength={LIMITES.imagem} onChange={(e) => set("image", e.target.value)} />
          </Campo>
        </div>

        <div className="grid items-end gap-4 sm:grid-cols-2">
          <Campo id="ed-sort" rotulo="Ordem na loja" dica="Menor número aparece primeiro.">
            <input id="ed-sort" inputMode="numeric" className={campo} value={form.sort} onChange={(e) => set("sort", e.target.value)} />
          </Campo>
          <label className="flex items-center gap-3 pb-3 text-sm font-semibold">
            <input type="checkbox" className="h-5 w-5 accent-primary" checked={form.active} onChange={(e) => set("active", e.target.checked)} />
            Visível na loja
          </label>
        </div>

        {erros.length > 0 && (
          <ul role="alert" className="list-inside list-disc space-y-1 rounded-2xl bg-destructive/10 p-4 text-sm text-destructive">
            {erros.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          {criando ? (
            <span />
          ) : (
            <button type="button" className={`${botaoClaro} text-destructive`} disabled={salvando} onClick={() => void apagar()}>
              <Trash2 className="h-4 w-4" /> Apagar
            </button>
          )}
          <div className="flex gap-2">
            <button type="button" className={botaoClaro} onClick={onClose} disabled={salvando}>
              Cancelar
            </button>
            <button type="submit" className={botaoEscuro} disabled={salvando || enviando}>
              {salvando ? "Salvando..." : criando ? "Criar produto" : "Salvar"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}