// @lovable.dev/vite-tanstack-config já inclui os plugins do TanStack Start, React, Tailwind etc.
// NÃO adicione esses plugins à mão (ficam duplicados e o app quebra).
//
// Publicação no GitHub Pages: site 100% estático.
//  - nitro: false -> não gera o servidor do Cloudflare
//  - spa          -> gera um index.html "casca" que carrega o site no navegador
//  - pages        -> páginas que já saem prontas em HTML (melhor para o Google)
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  nitro: false,
  tanstackStart: {
    // Redireciona o servidor do TanStack Start para src/server.ts (nosso tratador de erros de SSR).
    server: { entry: "server" },
    spa: {
      enabled: true,
      prerender: { outputPath: "/index.html", crawlLinks: true },
    },
    pages: [
      { path: "/produto/urban-2026" },
      { path: "/produto/v9-max-ranger" },
      { path: "/produto/ouxi-v8-pro" },
    ],
    sitemap: { enabled: true, host: "https://espiritobike.eduardoeffgen.com.br" },
  },
});