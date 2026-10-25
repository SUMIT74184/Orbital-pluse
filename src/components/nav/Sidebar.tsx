"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Logo } from "@/components/Logo";
import { Avatar } from "@/components/Avatar";
import { logout } from "@/app/actions/auth";
import { Icon, type IconName } from "./Icons";
import { NAV_COOKIE, YEAR } from "./cookies";

export type NavChild = { href: string; label: string };
export type NavItem = { href: string; label: string; icon: IconName; exact?: boolean; children?: NavChild[] };

type SidebarUser = { id: string; name: string; isAdmin: boolean };


function parse(href: string) {
  const url = new URL(href, "http://x");
  return { path: url.pathname, query: [...url.searchParams], hash: url.hash };
}

const under = (pathname: string, path: string) => pathname === path || pathname.startsWith(`${path}/`);

function itemActive(item: NavItem, pathname: string) {
  const { path } = parse(item.href);
  if (item.exact ? pathname === path : under(pathname, path)) return true;
  return !!item.children?.some((c) => pathname === parse(c.href).path);
}

/**
 * The child matching the current URL: same path and every query param it sets, the most specific one winning.
 * Hash links (sections of a page) never highlight, since the server can't see the hash.
 */
function activeChild(children: NavChild[], pathname: string, params: URLSearchParams) {
  let best: string | null = null;
  let score = -1;
  for (const c of children) {
    const { path, query, hash } = parse(c.href);
    if (hash || !under(pathname, path) || !query.every(([k, v]) => params.get(k) === v)) continue;
    if (query.length > score) {
      best = c.href;
      score = query.length;
    }
  }
  return best;
}

export function Sidebar({
  items,
  initialCollapsed,
  logoHref,
  tag,
  user,
  backHref,
}: {
  items: NavItem[];
  initialCollapsed: boolean;
  logoHref: string;
  tag?: string;
  user?: SidebarUser;
  backHref?: string;
}) {
  const [collapsed, setCollapsed] = useState(initialCollapsed);
  const [drawer, setDrawer] = useState(false);

  function toggle() {
    const next = !collapsed;
    setCollapsed(next);
    document.cookie = `${NAV_COOKIE}=${next ? "collapsed" : "open"}; path=/; max-age=${YEAR}; samesite=lax`;
  }

  const close = () => setDrawer(false);

  return (
    <>
      {/* Phones and tablets: a top bar whose menu button slides the sidebar in. */}
      <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-line bg-bg px-4 py-3 lg:hidden">
        <button onClick={() => setDrawer(true)} aria-label="Open menu" className="-ml-1 rounded-lg p-1.5 text-muted hover:bg-panel-2 hover:text-ink">
          <Icon name="menu" />
        </button>
        <Logo href={logoHref} />
        {tag && <Tag>{tag}</Tag>}
        {user && (
          <Link href="/profile" className="ml-auto" aria-label="Your profile">
            <Avatar name={user.name} seed={user.id} size={30} />
          </Link>
        )}
      </header>
      <div
        className={`fixed inset-0 z-40 bg-black/60 transition-opacity lg:hidden ${drawer ? "opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={close}
        aria-hidden
      />
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col border-r border-line bg-panel transition-transform lg:hidden ${
          drawer ? "" : "-translate-x-full"
        }`}
        inert={!drawer}
        aria-label="Main menu"
      >
        <Panel items={items} compact={false} logoHref={logoHref} tag={tag} user={user} backHref={backHref} onNavigate={close} onClose={close} />
      </aside>

      {/* Desktop: sticky, collapsible to an icon rail. */}
      <aside
        className={`sticky top-0 z-20 hidden h-screen shrink-0 flex-col border-r border-line bg-panel transition-[width] duration-200 lg:flex ${
          collapsed ? "w-[68px]" : "w-60"
        }`}
        aria-label="Main menu"
      >
        <Panel items={items} compact={collapsed} logoHref={logoHref} tag={tag} user={user} backHref={backHref} onToggle={toggle} />
      </aside>
    </>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-md border border-topic/40 bg-topic/10 px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-topic">
      {children}
    </span>
  );
}

function Panel({
  items,
  compact,
  logoHref,
  tag,
  user,
  backHref,
  onNavigate,
  onToggle,
  onClose,
}: {
  items: NavItem[];
  compact: boolean;
  logoHref: string;
  tag?: string;
  user?: SidebarUser;
  backHref?: string;
  onNavigate?: () => void;
  onToggle?: () => void;
  onClose?: () => void;
}) {
  const pathname = usePathname();
  const params = useSearchParams();
  // Groups the user opened or closed by hand; the rest open when they hold the current page.
  const [open, setOpen] = useState<Record<string, boolean>>({});

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className={`flex h-14 shrink-0 items-center gap-2 border-b border-line ${compact ? "justify-center" : "px-4"}`}>
        <Logo href={logoHref} compact={compact} />
        {tag && !compact && <Tag>{tag}</Tag>}
        {onClose && (
          <button onClick={onClose} aria-label="Close menu" className="ml-auto rounded-lg p-1.5 text-muted hover:bg-panel-2 hover:text-ink">
            <Icon name="close" />
          </button>
        )}
      </div>

      <nav className={`min-h-0 flex-1 py-4 ${compact ? "px-2" : "overflow-y-auto px-3"}`}>
        <ul className="space-y-1">
          {items.map((item) => {
            const active = itemActive(item, pathname);
            const child = item.children ? activeChild(item.children, pathname, params) : null;
            return compact ? (
              <CompactRow key={item.href} item={item} active={active} activeChild={child} />
            ) : (
              <Row
                key={item.href}
                item={item}
                active={active}
                activeChild={child}
                open={open[item.label] ?? active}
                onToggle={() => setOpen((o) => ({ ...o, [item.label]: !(o[item.label] ?? active) }))}
                onNavigate={onNavigate}
              />
            );
          })}
        </ul>
      </nav>

      <div className={`shrink-0 space-y-1 border-t border-line py-3 ${compact ? "px-2" : "px-3"}`}>
        {backHref && (
          <FooterLink href={backHref} icon="back" label="Back to app" compact={compact} onNavigate={onNavigate} />
        )}
        {user?.isAdmin && <FooterLink href="/admin" icon="shield" label="Admin panel" compact={compact} onNavigate={onNavigate} accent />}
        {user && (
          <div className={`flex items-center gap-1 ${compact ? "flex-col" : ""}`}>
            <Link
              href="/profile"
              onClick={onNavigate}
              title={compact ? user.name : "Your profile"}
              className={`flex min-w-0 items-center gap-2.5 rounded-lg p-1.5 hover:bg-panel-2 ${compact ? "" : "flex-1"}`}
            >
              <Avatar name={user.name} seed={user.id} size={30} />
              {!compact && (
                <span className="min-w-0">
                  <span className="block truncate text-sm">{user.name}</span>
                  <span className="block text-xs text-muted">View profile</span>
                </span>
              )}
            </Link>
            <form action={logout}>
              <button title="Log out" aria-label="Log out" className="rounded-lg p-2 text-muted hover:bg-panel-2 hover:text-hard">
                <Icon name="logout" />
              </button>
            </form>
          </div>
        )}
        {onToggle && (
          <button
            onClick={onToggle}
            title={compact ? "Expand sidebar" : "Collapse sidebar"}
            aria-label={compact ? "Expand sidebar" : "Collapse sidebar"}
            className={`flex w-full items-center gap-3 rounded-lg py-2 text-sm text-muted hover:bg-panel-2 hover:text-ink ${compact ? "justify-center" : "px-3"}`}
          >
            <Icon name={compact ? "sidebarOpen" : "sidebarClose"} />
            {!compact && "Collapse"}
          </button>
        )}
      </div>
    </div>
  );
}

function Row({
  item,
  active,
  activeChild,
  open,
  onToggle,
  onNavigate,
}: {
  item: NavItem;
  active: boolean;
  activeChild: string | null;
  open: boolean;
  onToggle: () => void;
  onNavigate?: () => void;
}) {
  return (
    <li>
      <div className={`flex items-center rounded-lg transition ${active ? "bg-panel-2 text-ink" : "text-muted hover:bg-panel-2/60 hover:text-ink"}`}>
        <Link href={item.href} onClick={onNavigate} className="flex min-w-0 flex-1 items-center gap-3 px-3 py-2 text-sm">
          <Icon name={item.icon} className={`size-[18px] ${active ? "text-pulse" : ""}`} />
          <span className="truncate">{item.label}</span>
        </Link>
        {item.children && (
          <button
            onClick={onToggle}
            aria-expanded={open}
            aria-label={`${open ? "Collapse" : "Expand"} ${item.label}`}
            className="mr-1 rounded-md p-1.5 text-muted hover:text-ink"
          >
            <Icon name="chevron" className={`size-3.5 transition-transform ${open ? "rotate-90" : ""}`} />
          </button>
        )}
      </div>
      {item.children && (
        <div className={`grid transition-[grid-template-rows] duration-200 ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`} inert={!open}>
          <ul className="ml-[21px] space-y-0.5 overflow-hidden border-l border-line pl-3">
            {item.children.map((c, i) => (
              <li key={c.href} className={i === 0 ? "pt-1" : ""}>
                <Link
                  href={c.href}
                  onClick={onNavigate}
                  className={`block truncate rounded-md px-2 py-1.5 text-[13px] transition ${
                    c.href === activeChild ? "bg-panel-2 text-ink" : "text-muted hover:text-ink"
                  }`}
                >
                  {c.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </li>
  );
}

/** Icon-only row; hovering or focusing it opens a flyout with the label and any sub-pages. */
function CompactRow({ item, active, activeChild }: { item: NavItem; active: boolean; activeChild: string | null }) {
  return (
    <li className="group relative">
      <Link
        href={item.href}
        aria-label={item.label}
        className={`mx-auto flex size-10 items-center justify-center rounded-lg transition ${
          active ? "bg-panel-2 text-pulse" : "text-muted hover:bg-panel-2/60 hover:text-ink"
        }`}
      >
        <Icon name={item.icon} />
      </Link>
      <div className="invisible absolute left-full top-0 z-50 pl-3 opacity-0 transition group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
        <div className="min-w-48 rounded-xl border border-line bg-panel p-1.5 shadow-xl shadow-black/40">
          <Link href={item.href} className="block rounded-md px-2.5 py-1.5 text-sm font-medium hover:bg-panel-2">
            {item.label}
          </Link>
          {item.children?.map((c) => (
            <Link
              key={c.href}
              href={c.href}
              className={`block rounded-md px-2.5 py-1.5 text-[13px] hover:bg-panel-2 hover:text-ink ${c.href === activeChild ? "text-ink" : "text-muted"}`}
            >
              {c.label}
            </Link>
          ))}
        </div>
      </div>
    </li>
  );
}

function FooterLink({
  href,
  icon,
  label,
  compact,
  accent,
  onNavigate,
}: {
  href: string;
  icon: IconName;
  label: string;
  compact: boolean;
  accent?: boolean;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      title={compact ? label : undefined}
      aria-label={compact ? label : undefined}
      className={`flex items-center gap-3 rounded-lg py-2 text-sm transition hover:bg-panel-2 ${compact ? "justify-center" : "px-3"} ${
        accent ? "text-topic" : "text-muted hover:text-ink"
      }`}
    >
      <Icon name={icon} />
      {!compact && label}
    </Link>
  );
}
