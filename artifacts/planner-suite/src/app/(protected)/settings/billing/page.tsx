"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Crown, CreditCard, Calendar, AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useSubscription } from "@/hooks/use-subscription";
import { createClient } from "@/lib/supabase/client";

export default function BillingPage() {
  const { planTier, isPro, subscriptionStatus, currentPeriodEnd, isLoading, refetch } = useSubscription();
  const [cancelling, setCancelling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleCancel = async () => {
    setCancelling(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const apiBase = `${window.location.origin}/api`;
      const res = await fetch(`${apiBase}/billing/cancel`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
      });

      if (res.ok) {
        await refetch();
        setShowCancelConfirm(false);
      } else {
        const err = await res.json();
        alert(err.error || "Failed to cancel subscription");
      }
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setCancelling(false);
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "N/A";
    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusBadge = () => {
    switch (subscriptionStatus) {
      case "active":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">Active</Badge>;
      case "cancelled":
        return <Badge variant="secondary">Cancelled</Badge>;
      case "past_due":
        return <Badge variant="destructive">Past Due</Badge>;
      case "expired":
        return <Badge variant="secondary">Expired</Badge>;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">Billing & Subscription</h1>
        <p className="text-muted-foreground">Manage your subscription plan and billing details.</p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {isPro && <Crown className="w-5 h-5 text-amber-500" />}
                {planTier === "pro" ? "Pro Plan" : "Free Plan"}
              </CardTitle>
              <CardDescription>
                {isPro
                  ? "You have access to all premium features"
                  : "Upgrade to Pro for unlimited access"}
              </CardDescription>
            </div>
            {getStatusBadge()}
          </div>
        </CardHeader>
        <CardContent>
          {isPro ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <CreditCard className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Monthly billing</p>
                    <p className="text-sm text-muted-foreground">₹999/month</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Next billing date</p>
                    <p className="text-sm text-muted-foreground">{formatDate(currentPeriodEnd)}</p>
                  </div>
                </div>
              </div>

              <Separator />

              {subscriptionStatus === "cancelled" ? (
                <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                  <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-900 dark:text-amber-200">Subscription cancelled</p>
                    <p className="text-sm text-amber-700 dark:text-amber-400">
                      Your Pro access continues until {formatDate(currentPeriodEnd)}. After that, you'll be moved to the Free plan.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {!showCancelConfirm ? (
                    <Button
                      variant="outline"
                      className="text-destructive border-destructive/30 hover:bg-destructive/10"
                      onClick={() => setShowCancelConfirm(true)}
                    >
                      Cancel Subscription
                    </Button>
                  ) : (
                    <div className="p-4 rounded-lg border border-destructive/30 bg-destructive/5">
                      <p className="text-sm font-medium mb-2">Are you sure you want to cancel?</p>
                      <p className="text-sm text-muted-foreground mb-4">
                        You'll lose access to Pro features at the end of your billing period.
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={cancelling}
                          onClick={handleCancel}
                        >
                          {cancelling ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Cancelling...
                            </>
                          ) : (
                            "Yes, Cancel"
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowCancelConfirm(false)}
                        >
                          Keep Subscription
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground mb-4">
                You're on the Free plan. Upgrade to Pro to unlock unlimited plans, all planners, PDF/SVG export, and more.
              </p>
              <Button onClick={() => router.push("/pricing")}>
                <Crown className="w-4 h-4 mr-2" />
                Upgrade to Pro — ₹999/mo
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Plan Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            {[
              { feature: "Saved plans", free: "Up to 3", pro: "Unlimited" },
              { feature: "Planner types", free: "Basic 2D", pro: "All types" },
              { feature: "Export formats", free: "PNG", pro: "PNG, PDF, SVG" },
              { feature: "Quote builder", free: "—", pro: "Included" },
              { feature: "3D Viewer", free: "—", pro: "Included" },
              { feature: "Support", free: "Community", pro: "Priority" },
            ].map((row) => (
              <div key={row.feature} className="grid grid-cols-3 gap-4 py-2 border-b border-border last:border-0">
                <span className="font-medium">{row.feature}</span>
                <span className="text-muted-foreground">{row.free}</span>
                <span className="text-foreground">{row.pro}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
