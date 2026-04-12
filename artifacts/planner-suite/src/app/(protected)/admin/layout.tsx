"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { LayoutDashboard, Users, Library, LayoutTemplate, ArrowLeft, Shield, ChevronRight } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

const adminNavItems = [
  { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/users", icon: Users, label: "Users" },
  { href: "/admin/catalog", icon: Library, label: "Catalog" },
  { href: "/admin/templates", icon: LayoutTemplate, label: "Templates" },
];

function getBreadcrumbs(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  const crumbs: { label: string; href: string }[] = [];
  if (segments[0] === "admin") {
    crumbs.push({ label: "Admin", href: "/admin" });
    if (segments[1]) {
      const sub = segments[1].charAt(0).toUpperCase() + segments[1].slice(1);
      crumbs.push({ label: sub, href: `/admin/${segments[1]}` });
    }
  }
  return crumbs;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAdmin, isLoaded, profileLoaded } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoaded && profileLoaded && !isAdmin) {
      router.replace("/");
    }
  }, [isLoaded, profileLoaded, isAdmin, router]);

  if (!isLoaded || !profileLoaded) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner className="w-8 h-8" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-2">
          <Shield className="w-12 h-12 mx-auto text-muted-foreground" />
          <h2 className="text-lg font-semibold">Access Denied</h2>
          <p className="text-muted-foreground">You need admin privileges to access this area.</p>
        </div>
      </div>
    );
  }

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname === href || pathname.startsWith(href + "/");
  };

  const breadcrumbs = getBreadcrumbs(pathname);

  return (
    <div className="flex flex-col h-full bg-[var(--surface-soft)]">
      <div className="border-b border-[var(--border-soft)] bg-white/80 backdrop-blur-md px-6 py-0">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--text-strong)] transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back to App
            </Link>
            <div className="h-5 w-px bg-[var(--border-soft)]" />
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-[var(--color-primary)] text-white">
                <Shield className="w-3.5 h-3.5" />
              </div>
              <span className="font-semibold text-sm text-[var(--text-heading)]">Admin Panel</span>
            </div>
          </div>
          <nav className="flex items-center gap-1">
            {adminNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive(item.href)
                    ? "bg-[var(--color-primary)] text-white shadow-sm"
                    : "text-[var(--text-muted)] hover:text-[var(--text-strong)] hover:bg-[var(--surface-hover)]"
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {breadcrumbs.length > 1 && (
        <div className="px-6 py-2.5 border-b border-[var(--border-soft)] bg-white/40">
          <nav className="flex items-center gap-1.5 text-sm">
            {breadcrumbs.map((crumb, i) => (
              <span key={crumb.href} className="flex items-center gap-1.5">
                {i > 0 && <ChevronRight className="w-3.5 h-3.5 text-[var(--text-subtle)]" />}
                {i === breadcrumbs.length - 1 ? (
                  <span className="font-medium text-[var(--text-strong)]">{crumb.label}</span>
                ) : (
                  <Link href={crumb.href} className="text-[var(--text-muted)] hover:text-[var(--text-strong)] transition-colors">
                    {crumb.label}
                  </Link>
                )}
              </span>
            ))}
          </nav>
        </div>
      )}

      <div className="flex-1 overflow-auto p-6">
        {children}
      </div>
    </div>
  );
}
