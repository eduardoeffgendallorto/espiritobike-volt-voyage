import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase, SUPABASE_CONFIGURADO } from "@/lib/supabase";

export type AdminSession =
  | { status: "loading" }
  | { status: "out" } // sem login
  | { status: "denied"; email: string } // logou, mas não está na tabela admins
  | { status: "admin"; email: string };

/** Quem está logado e se é administrador (linha na tabela admins). */
export function useAdminSession(): AdminSession {
  const [state, setState] = useState<AdminSession>({ status: SUPABASE_CONFIGURADO ? "loading" : "out" });

  useEffect(() => {
    if (!SUPABASE_CONFIGURADO) return;
    let vivo = true;

    const conferir = async (session: Session | null) => {
      if (!session) {
        if (vivo) setState({ status: "out" });
        return;
      }
      const email = session.user.email ?? "";
      const { data } = await supabase.from("admins").select("user_id").eq("user_id", session.user.id).maybeSingle();
      if (vivo) setState(data ? { status: "admin", email } : { status: "denied", email });
    };

    void supabase.auth.getSession().then(({ data }) => conferir(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_evento, session) => {
      // Não chame o Supabase direto aqui dentro (pode travar): adiar resolve.
      setTimeout(() => void conferir(session), 0);
    });
    return () => {
      vivo = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return state;
}