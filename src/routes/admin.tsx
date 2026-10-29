import { createFileRoute } from "@tanstack/react-router";
import { PageTransition } from "@/components/site/Chrome.tsx";
import { AdminPanel } from "@/components/admin/AdminPanel";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Painel · EspiritoBike" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  return (
    <PageTransition>
      <div className="mx-auto max-w-5xl px-6 pb-12 pt-32">
        <AdminPanel />
      </div>
    </PageTransition>
  );
}