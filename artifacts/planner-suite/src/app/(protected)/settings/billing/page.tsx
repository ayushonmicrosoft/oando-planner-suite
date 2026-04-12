"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Crown, CreditCard, Calendar, AlertTriangle, Loader2, Check, X, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useSubscription } from "@/hooks/use-subscription";

const planFeatures = [
  { feature: "Saved plans", free: "Up to 3", pro: "Unlimited", included: true },
  { feature: "Planner types", free: "Basic 2D", pro: "All types", included: true },
  { feature: "Export formats", free: "PNG", pro: "PNG, PDF, SVG", included: true },
  { feature: "Quote builder", free: false, pro: true, included: false },
  { feature: "3D Viewer", free: false, pro: true, included: false },
  { feature: "Support", free: "Community", pro: "Priority", included: true },
];

export default function BillingPage() {
  const { planTier, isPro, subscriptionStatus, currentPeriodEnd, isLoading, refetch } = useSubscription();
  const [cancelling, setCancelling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const router = useRouter();

  const handleCancel = async () => {
    setCancelling(true);
    try {
      const apiBase = `${window.location.origin}/api`;
      const res = await fetch(`${apiBase}/billing/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
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
        return (
          <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold px-2.5 py-0.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
            Active
          </Badge>
        );
      case "cancelled":
        return <Badge variant="secondary" className="text-xs font-semibold px-2.5 py-0.5">Cancelled</Badge>;
      case "past_due":
        return <Badge variant="destructive" className="text-xs font-semibold px-2.5 py-0.5">Past Due</Badge>;
      case "expired":
        return <Badge variant="secondary" className="text-xs font-semibold px-2.5 py-0.5">Expired</Badge>;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--text-subtle)]" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <div className="mb-10">
        <h1 className="text-2xl font-bold text-[var(--text-heading)] tracking-tight mb-1">Billing & Subscription</h1>
        <p className="text-[var(--text-muted)]">Manage your subscription plan and billing details.</p>
      </div>

      <Card className="mb-8 border-[var(--border-soft)] overflow-hidden">
        <div className={isPro ? "bg-gradient-to-r from-[var(--color-primary)]/5 to-amber-500/5" : ""}>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`flex items-center justify-center w-11 h-11 rounded-xl ${isPro ? "bg-amber-100 text-amber-600" : "bg-[var(--surface-accent-wash)] text-[var(--text-muted)]"}`}>
                  {isPro ? <Crown className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
                </div>
                <div>
                  <CardTitle className="text-lg font-bold text-[var(--text-heading)]">
                    {planTier === "pro" ? "Pro Plan" : "Free Plan"}
                  </CardTitle>
                  <CardDescription className="text-sm mt-0.5">
                    {isPro
                      ? "You have access to all premium features"
                      : "Upgrade to Pro for unlimited access"}
                  </CardDescription>
                </div>
              </div>
              {getStatusBadge()}
            </div>
          </CardHeader>
        </div>
        <CardContent className="pt-2">
          {isPro ? (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-4 rounded-xl bg-[var(--surface-soft)] border border-[var(--border-soft)]">
                  <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-white shadow-sm">
                    <CreditCard className="w-4 h-4 text-[var(--text-muted)]" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Billing</p>
                    <p className="text-sm font-bold text-[var(--text-heading)] mt-0.5">&#8377;999/month</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-xl bg-[var(--surface-soft)] border border-[var(--border-soft)]">
                  <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-white shadow-sm">
                    <Calendar className="w-4 h-4 text-[var(--text-muted)]" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Next billing</p>
                    <p className="text-sm font-bold text-[var(--text-heading)] mt-0.5">{formatDate(currentPeriodEnd)}</p>
                  </div>
                </div>
              </div>

              <Separator className="bg-[var(--border-soft)]" />

              {subscriptionStatus === "cancelled" ? (
                <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200">
                  <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-amber-900">Subscription cancelled</p>
                    <p className="text-sm text-amber-700 mt-0.5">
                      Your Pro access continues until {formatDate(currentPeriodEnd)}. After that, you&apos;ll be moved to the Free plan.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {!showCancelConfirm ? (
                    <Button
                      variant="outline"
                      className="text-destructive border-destructive/30 hover:bg-destructive/10 rounded-xl"
                      onClick={() => setShowCancelConfirm(true)}
                    >
                      Cancel Subscription
                    </Button>
                  ) : (
                    <div className="p-5 rounded-xl border border-destructive/20 bg-destructive/5">
                      <p className="text-sm font-semibold text-[var(--text-heading)] mb-1">Are you sure you want to cancel?</p>
                      <p className="text-sm text-[var(--text-muted)] mb-4">
                        You&apos;ll lose access to Pro features at the end of your billing period.
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={cancelling}
                          onClick={handleCancel}
                          className="rounded-xl"
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
                          className="rounded-xl"
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
            <div className="text-center py-6">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-100 to-amber-50 mb-4">
                <Crown className="w-7 h-7 text-amber-600" />
              </div>
              <p className="text-sm text-[var(--text-muted)] mb-5 max-w-sm mx-auto">
                Upgrade to Pro to unlock unlimited plans, all planners, PDF/SVG export, and more.
              </p>
              <Button onClick={() => router.push("/pricing")} className="gap-2 rounded-xl shadow-sm">
                <Crown className="w-4 h-4" />
                Upgrade to Pro &mdash; &#8377;999/mo
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-[var(--border-soft)]">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold text-[var(--text-heading)]">Plan Comparison</CardTitle>
          <CardDescription className="text-sm">See what&apos;s included in each plan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border border-[var(--border-soft)] overflow-hidden">
            <div className="grid grid-cols-3 bg-[var(--surface-soft)] px-5 py-3 border-b border-[var(--border-soft)]">
              <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Feature</span>
              <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider text-center">Free</span>
              <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider text-center">
                Pro
                {isPro && <span className="ml-1.5 text-[var(--color-primary)]">(Current)</span>}
              </span>
            </div>
            {planFeatures.map((row, i) => (
              <div key={row.feature} className={`grid grid-cols-3 px-5 py-3.5 items-center ${i < planFeatures.length - 1 ? "border-b border-[var(--border-soft)]" : ""}`}>
                <span className="text-sm font-medium text-[var(--text-strong)]">{row.feature}</span>
                <span className="text-sm text-center">
                  {typeof row.free === "boolean" ? (
                    row.free ? (
                      <Check className="w-4 h-4 text-emerald-500 mx-auto" />
                    ) : (
                      <X className="w-4 h-4 text-[var(--text-subtle)] mx-auto" />
                    )
                  ) : (
                    <span className="text-[var(--text-muted)]">{row.free}</span>
                  )}
                </span>
                <span className="text-sm text-center">
                  {typeof row.pro === "boolean" ? (
                    row.pro ? (
                      <Check className="w-4 h-4 text-emerald-500 mx-auto" />
                    ) : (
                      <X className="w-4 h-4 text-[var(--text-subtle)] mx-auto" />
                    )
                  ) : (
                    <span className="font-medium text-[var(--text-strong)]">{row.pro}</span>
                  )}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
