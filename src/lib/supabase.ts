import { createClient } from "@supabase/supabase-js";

// URL do projeto e chave PÚBLICA (publishable). Podem ficar no código: quem protege
// os dados são as regras (RLS) do banco. NUNCA coloque aqui a chave "secret" / service_role.
// Pegue os dois em Project Settings > API Keys (ou no botão Connect, no topo do Supabase).
export const SUPABASE_URL = "https://jijsvxcqkrlhgovyhvpv.supabase.co"; // confira com a "Project URL"
export const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_PsSfqQp6FbE5hVhG0qv_mQ_4-cU28WM"; // começa com sb_publishable_

export const SUPABASE_CONFIGURADO =
  !SUPABASE_URL.includes("SEU-PROJETO") && !SUPABASE_PUBLISHABLE_KEY.startsWith("COLE-AQUI");

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false },
});