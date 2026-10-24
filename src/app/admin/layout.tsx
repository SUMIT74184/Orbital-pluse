import { cookies } from "next/headers";
import { Sidebar, type NavItem } from "@/components/nav/Sidebar";
import { NAV_COOKIE } from "@/components/nav/cookies";
import { requireAdmin } from "@/lib/auth";
import { getCatalog } from "@/lib/catalog";

export const metadata = { title: { default: "Admin", template: "%s · Admin · Orbit-Plus" } };

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  await requireAdmin();
  const [cat, jar] = await Promise.all([getCatalog(), cookies()]);
  const items: NavItem[] = [
    { href: "/admin", label: "Overview", icon: "overview", exact: true },
    { href: "/admin/users", label: "Users", icon: "users" },
    {
      href: "/admin/content",
      label: "Content",
      icon: "content",
      children: [
        { href: "/admin/content", label: "All content" },
        { href: "/admin/content/dsa", label: "DSA questions" },
        ...cat.allTracks.map((t) => ({ href: `/admin/content/tracks/${t.key}`, label: t.archived ? `${t.name} (archived)` : t.name })),
      ],
    },
  ];

  return (
    <div className="flex flex-1 flex-col lg:flex-row">
      <Sidebar items={items} initialCollapsed={jar.get(NAV_COOKIE)?.value === "collapsed"} logoHref="/admin" tag="Admin" backHref="/dashboard" />
      <main className="min-w-0 flex-1 px-4 py-6 sm:px-6">
        <div className="mx-auto w-full max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
