import { Suspense } from "react";
import { cookies } from "next/headers";
import { AmbientBackground } from "@/components/AmbientBackground";
import { Sidebar, type NavItem } from "@/components/nav/Sidebar";
import { RightRail } from "@/components/nav/RightRail";
import { RailContent, RailSkeleton } from "@/components/nav/RailContent";
import { NAV_COOKIE, RAIL_COOKIE } from "@/components/nav/cookies";
import { requireUser } from "@/lib/auth";
import { getCatalog } from "@/lib/catalog";

export default async function AppLayout({ children }: LayoutProps<"/">) {
  const [user, cat, jar] = await Promise.all([requireUser(), getCatalog(), cookies()]);
  const items: NavItem[] = [
    { href: "/", label: "Home", icon: "home", exact: true },
    { href: "/dashboard", label: "Dashboard", icon: "dashboard" },
    {
      href: "/questions",
      label: "Questions",
      icon: "questions",
      children: [
        { href: "/questions", label: "All questions" },
        { href: "/questions?status=todo", label: "Unsolved" },
        { href: "/questions?status=solved", label: "Solved" },
        { href: "/questions?status=backlog", label: "Backlog" },
        { href: "/questions?status=due", label: "Revision due" },
      ],
    },
    {
      href: "/schedule",
      label: "Revision plan",
      icon: "revision",
      children: [
        { href: "/schedule#calendar", label: "Calendar" },
        { href: "/schedule#rotation", label: "Weekly rotation" },
      ],
    },
    { href: "/tracks", label: "Tracks", icon: "tracks", children: cat.tracks.map((t) => ({ href: `/tracks#${t.key}`, label: t.name })) },
    {
      href: "/settings",
      label: "Settings",
      icon: "settings",
      children: [
        { href: "/settings", label: "Study plan" },
        { href: "/profile", label: "Profile" },
        { href: "/profile#goal", label: "Goal" },
        { href: "/profile#reminders", label: "Email reminders" },
      ],
    },
  ];

  return (
    <>
      <AmbientBackground />
      <div className="relative z-10 flex flex-1 flex-col lg:flex-row">
        <Sidebar
          items={items}
          initialCollapsed={jar.get(NAV_COOKIE)?.value === "collapsed"}
          logoHref="/dashboard"
          user={{ id: user.id, name: user.name, isAdmin: user.isAdmin }}
        />
        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
        <RightRail initialCollapsed={jar.get(RAIL_COOKIE)?.value === "collapsed"}>
          <Suspense fallback={<RailSkeleton />}>
            <RailContent user={user} />
          </Suspense>
        </RightRail>
      </div>
    </>
  );
}
