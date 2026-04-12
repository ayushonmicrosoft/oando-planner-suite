"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { LayoutDashboard, Users, Library, LayoutTemplate, ArrowLeft, Shield } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

const adminNavItems = [
  { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/users", icon: Users, label: "Users" },
  { href: "/admin/catalog", icon: Library, label: "Catalog" },
  { href: "/admin/templates", icon: LayoutTemplate, label: "Templates" },
];

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

  return (
    <div className="flex flex-col h-full">
      <div className="border-b bg-background px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back to App
            </Link>
            <div className="h-5 w-px bg-border" />
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              <span className="font-semibold text-sm">Admin Panel</span>
            </div>
          </div>
          <nav className="flex items-center gap-1">
            {adminNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${
                  isActive(item.href)
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
      <div className="flex-1 overflow-auto p-6">
        {children}
      </div>
    </div>
  );
}
