import { Logo } from "@/components/Logo";
import { NavLinks } from "@/components/NavLinks";
import { requireUser } from "@/lib/auth";
import { logout } from "@/app/actions/auth";

export default async function AppLayout({ children }: LayoutProps<"/">) {
  const user = await requireUser();
  return (
    <>
      <header className="sticky top-0 z-20 border-b border-line bg-bg/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:gap-6 sm:px-6">
          <div className="flex items-center justify-between">
            <Logo href="/dashboard" />
            <form action={logout} className="sm:hidden">
              <button className="text-sm text-muted hover:text-ink">Log out</button>
            </form>
          </div>
          <NavLinks />
          <div className="ml-auto hidden items-center gap-3 text-sm sm:flex">
            <span className="max-w-40 truncate text-muted" title={user.email}>
              {user.name}
            </span>
            <form action={logout}>
              <button className="rounded-lg border border-line px-3 py-1.5 text-muted hover:border-muted hover:text-ink">Log out</button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6">{children}</main>
    </>
  );
}
