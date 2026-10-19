"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ClipboardList,
  Package,
  Tag,
  Users,
  Settings,
  UsersRound,
} from "lucide-react";
import { useAdminAuthStore } from "@/stores/admin-auth-store";
import { AdminRole } from "@/types/admin";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

// Main navigation — only pages that exist in the (protected) route group.
// Add items here as new pages are implemented; the rendering loop handles
// the rest automatically.
const MAIN_NAV: NavItem[] = [
  { href: "/admin",            label: "Overview",   icon: LayoutDashboard },
  { href: "/admin/orders",     label: "Orders",     icon: ClipboardList   },
  { href: "/admin/products",   label: "Products",   icon: Package         },
  { href: "/admin/categories", label: "Categories", icon: Tag             },
  { href: "/admin/customers",  label: "Customers",  icon: Users           },
];

// Super Admin-only nav items — rendered only when the current admin has
// the SUPER_ADMIN role. Never shown to regular admins.
const SUPER_ADMIN_NAV: NavItem[] = [
  { href: "/admin/team", label: "Team", icon: UsersRound },
];

const SETTINGS_NAV: NavItem[] = [
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

interface AdminNavProps {
  /** Called after a link is clicked — closes the mobile Sheet overlay. */
  onNavigate?: () => void;
}

function NavLink({
  item,
  isActive,
  onNavigate,
}: {
  item: NavItem;
  isActive: boolean;
  onNavigate?: () => void;
}) {
  const Icon = item.icon;
  return (
    <li>
      <Link
        href={item.href}
        onClick={onNavigate}
        className="admin-nav-item flex items-center gap-3 px-3 py-2.5 w-full"
        aria-current={isActive ? "page" : undefined}
        data-active={isActive ? "true" : undefined}
      >
        <Icon
          className="w-4 h-4 flex-shrink-0"
          aria-hidden="true"
          strokeWidth={1.6}
        />
        <span className="text-[0.75rem] tracking-[0.1em] uppercase font-medium font-barlow">
          {item.label}
        </span>
      </Link>
    </li>
  );
}

export function AdminNav({ onNavigate }: AdminNavProps) {
  const pathname = usePathname();
  const admin = useAdminAuthStore((state) => state.admin);
  const isSuperAdmin = admin?.role === AdminRole.SUPER_ADMIN;

  // Exact match for /admin so sub-routes don't keep Overview active.
  // All other routes use startsWith so nested pages stay highlighted.
  function isActive(href: string) {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  }

  return (
    <nav aria-label="Admin navigation" className="space-y-4">

      {/* ── Main section ── */}
      <div>
        <p
          className="text-[0.55rem] tracking-[0.3em] uppercase px-3 mb-2 font-barlow"
          style={{ color: "rgba(255,255,255,0.22)" }}
        >
          Main
        </p>
        <ul className="space-y-0.5">
          {MAIN_NAV.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              isActive={isActive(item.href)}
              onNavigate={onNavigate}
            />
          ))}
        </ul>
      </div>

      {/* ── Super Admin section — hidden from regular admins ── */}
      {isSuperAdmin && (
        <div>
          <p
            className="text-[0.55rem] tracking-[0.3em] uppercase px-3 mb-2 font-barlow"
            style={{ color: "rgba(255,255,255,0.22)" }}
          >
            Super Admin
          </p>
          <ul className="space-y-0.5">
            {SUPER_ADMIN_NAV.map((item) => (
              <NavLink
                key={item.href}
                item={item}
                isActive={isActive(item.href)}
                onNavigate={onNavigate}
              />
            ))}
          </ul>
        </div>
      )}

      {/* ── Settings section ── */}
      <div>
        <p
          className="text-[0.55rem] tracking-[0.3em] uppercase px-3 mb-2 font-barlow"
          style={{ color: "rgba(255,255,255,0.22)" }}
        >
          Settings
        </p>
        <ul className="space-y-0.5">
          {SETTINGS_NAV.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              isActive={isActive(item.href)}
              onNavigate={onNavigate}
            />
          ))}
        </ul>
      </div>

    </nav>
  );
}
