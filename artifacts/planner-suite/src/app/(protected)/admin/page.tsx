"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileSignature, Library, LayoutTemplate, Loader2 } from "lucide-react";
import { adminGetStats } from "@/lib/admin-api";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

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
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
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
    { label: "Total Users", value: stats.totalUsers, icon: Users, color: "text-blue-500" },
    { label: "Total Plans", value: stats.totalPlans, icon: FileSignature, color: "text-green-500" },
    { label: "Catalog Items", value: stats.totalCatalogItems, icon: Library, color: "text-purple-500" },
    { label: "Templates", value: stats.totalTemplates, icon: LayoutTemplate, color: "text-orange-500" },
  ];

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Platform overview and key metrics</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricCards.map((m) => (
          <Card key={m.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{m.label}</CardTitle>
              <m.icon className={`w-5 h-5 ${m.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{m.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Signups</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.recentSignups.length === 0 ? (
            <p className="text-muted-foreground text-sm">No users yet.</p>
          ) : (
            <div className="space-y-3">
              {stats.recentSignups.map((u) => (
                <div key={u.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="font-medium text-sm">{u.displayName || u.email}</p>
                    <p className="text-xs text-muted-foreground">{u.email}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={u.role === "admin" ? "default" : "secondary"}>
                      {u.role}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(u.createdAt), "MMM d, yyyy")}
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
