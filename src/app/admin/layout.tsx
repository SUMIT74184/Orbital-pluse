import Link from "next/link";
import { Logo } from "@/components/Logo";
import { AdminNav } from "@/components/admin/AdminNav";
import { requireAdmin } from "@/lib/auth";

export const metadata = { title: { default: "Admin", template: "%s · Admin · Orbit-Plus" } };

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  await requireAdmin();
  return (
    <>
      <header className="sticky top-0 z-20 border-b border-line bg-bg/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:gap-6 sm:px-6">
          <div className="flex items-center gap-2">
            <Logo href="/admin" />
            <span className="rounded-md border border-topic/40 bg-topic/10 px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-topic">
              Admin
            </span>
          </div>
          <AdminNav />
          <Link href="/dashboard" className="text-sm text-muted hover:text-ink sm:ml-auto">
            ← Back to app
          </Link>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6">{children}</main>
    </>
  );
}
