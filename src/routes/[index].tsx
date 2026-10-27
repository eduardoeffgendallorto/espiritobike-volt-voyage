import { createFileRoute, redirect } from "@tanstack/react-router";

// O endereço /index leva para a página inicial.
export const Route = createFileRoute("/index")({
  beforeLoad: () => {
    throw redirect({ to: "/" });
  },
});
