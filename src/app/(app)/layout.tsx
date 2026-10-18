import Link from "next/link";
import { Logo } from "@/components/Logo";
import { NavLinks } from "@/components/NavLinks";
import { Avatar } from "@/components/Avatar";
import { requireUser } from "@/lib/auth";
import { logout } from "@/app/actions/auth";

export default async function AppLayout({ children }: LayoutProps<"/">) {
  const user = await requireUser();
  const profileLink = (
    <Link href="/profile" className="flex items-center gap-2 rounded-full py-0.5 pl-0.5 pr-3 text-sm hover:bg-panel-2" title="Your profile">
      <Avatar name={user.name} seed={user.id} size={28} />
      <span className="max-w-32 truncate text-muted">{user.name.split(" ")[0]}</span>
    </Link>
  );
  const adminLink = user.isAdmin && (
    <Link href="/admin" className="rounded-lg border border-topic/40 px-2.5 py-1 text-xs font-medium text-topic hover:bg-topic/10">
      Admin
    </Link>
  );
  return (
    <>
      <header className="sticky top-0 z-20 border-b border-line bg-bg/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:gap-6 sm:px-6">
          <div className="flex items-center justify-between">
            <Logo href="/dashboard" />
            <div className="flex items-center gap-2 sm:hidden">
              {adminLink}
              {profileLink}
              <form action={logout}>
                <button className="text-sm text-muted hover:text-ink">Log out</button>
              </form>
            </div>
          </div>
          <NavLinks />
          <div className="ml-auto hidden items-center gap-2 sm:flex">
            {adminLink}
            {profileLink}
            <form action={logout}>
              <button className="rounded-lg border border-line px-3 py-1.5 text-sm text-muted hover:border-muted hover:text-ink">Log out</button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6">{children}</main>
    </>
  );
}
