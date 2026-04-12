"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileSignature, Library, LayoutTemplate, Loader2, Clock, ArrowUpRight } from "lucide-react";
import { adminGetStats } from "@/lib/admin-api";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

interface AdminStats {
  totalUsers: number;
  totalPlans: number;
  totalCatalogItems: number;
  totalTemplates: number;
  recentSignups: Array<{
    id: string;
    email: string;
    displayName: string | null;
    role: string;
    createdAt: string;
  }>;
}

const gradients = [
  "from-blue-500/10 to-blue-600/5",
  "from-emerald-500/10 to-emerald-600/5",
  "from-violet-500/10 to-violet-600/5",
  "from-amber-500/10 to-amber-600/5",
];

const iconBgs = [
  "bg-blue-500/10 text-blue-600",
  "bg-emerald-500/10 text-emerald-600",
  "bg-violet-500/10 text-violet-600",
  "bg-amber-500/10 text-amber-600",
];

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminGetStats()
      .then(setStats)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--text-subtle)]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20 text-destructive">
        <p>Failed to load stats: {error}</p>
      </div>
    );
  }

  if (!stats) return null;

  const metricCards = [
    { label: "Total Users", value: stats.totalUsers, icon: Users, link: "/admin/users" },
    { label: "Total Plans", value: stats.totalPlans, icon: FileSignature, link: null },
    { label: "Catalog Items", value: stats.totalCatalogItems, icon: Library, link: "/admin/catalog" },
    { label: "Templates", value: stats.totalTemplates, icon: LayoutTemplate, link: "/admin/templates" },
  ];

  return (
    <div className="space-y-8 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-heading)] tracking-tight">Dashboard</h1>
        <p className="text-[var(--text-muted)] mt-1">Platform overview and key metrics</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {metricCards.map((m, i) => (
          <Card key={m.label} className={`relative overflow-hidden border-[var(--border-soft)] bg-gradient-to-br ${gradients[i]} hover:shadow-[var(--shadow-soft)] transition-all duration-300`}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className={`flex items-center justify-center w-10 h-10 rounded-xl ${iconBgs[i]}`}>
                  <m.icon className="w-5 h-5" />
                </div>
                {m.link && (
                  <Link href={m.link} className="text-[var(--text-subtle)] hover:text-[var(--text-strong)] transition-colors">
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
              <div className="text-3xl font-bold text-[var(--text-heading)] tracking-tight">{m.value}</div>
              <p className="text-sm text-[var(--text-muted)] mt-1">{m.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-[var(--border-soft)]">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-[var(--color-primary)]/8">
                <Clock className="w-4 h-4 text-[var(--color-primary)]" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold text-[var(--text-heading)]">Recent Signups</CardTitle>
                <p className="text-xs text-[var(--text-subtle)] mt-0.5">Latest user registrations</p>
              </div>
            </div>
            <Link href="/admin/users" className="text-xs font-medium text-[var(--color-primary)] hover:underline underline-offset-2 flex items-center gap-1">
              View all
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {stats.recentSignups.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-8 h-8 mx-auto text-[var(--text-subtle)] mb-2" />
              <p className="text-[var(--text-muted)] text-sm">No users yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-[var(--border-soft)]">
              {stats.recentSignups.map((u) => (
                <div key={u.id} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-9 h-9 rounded-full bg-[var(--surface-accent-wash)] text-[var(--text-muted)] text-sm font-semibold">
                      {(u.displayName || u.email).charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-sm text-[var(--text-strong)]">{u.displayName || u.email.split("@")[0]}</p>
                      <p className="text-xs text-[var(--text-subtle)]">{u.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={u.role === "admin" ? "default" : "secondary"}
                      className={u.role === "admin"
                        ? "bg-[var(--color-primary)] text-white text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5"
                        : "text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5"}
                    >
                      {u.role}
                    </Badge>
                    <span className="text-xs text-[var(--text-subtle)] min-w-[80px] text-right">
                      {formatDistanceToNow(new Date(u.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
