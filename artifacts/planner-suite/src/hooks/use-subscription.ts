"use client";

import { useState, useEffect, useCallback } from "react";

export type PlanTier = "free" | "pro";
export type SubscriptionStatus = "active" | "cancelled" | "past_due" | "expired" | "pending" | null;

interface BillingInfo {
  planTier: PlanTier;
  subscriptionStatus: SubscriptionStatus;
  currentPeriodEnd: string | null;
  razorpaySubscriptionId: string | null;
}

interface UseSubscriptionReturn {
  planTier: PlanTier;
  isPro: boolean;
  subscriptionStatus: SubscriptionStatus;
  currentPeriodEnd: Date | null;
  isLoading: boolean;
  refetch: () => Promise<void>;
}

export function useSubscription(): UseSubscriptionReturn {
  const [billing, setBilling] = useState<BillingInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBilling = useCallback(async () => {
    try {
      const apiBase = typeof window !== "undefined"
        ? `${window.location.origin}/api`
        : "/api";

      const res = await fetch(`${apiBase}/billing`, {
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        setBilling(data);
      }
    } catch {
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBilling();
  }, [fetchBilling]);

  const periodEnd = billing?.currentPeriodEnd ? new Date(billing.currentPeriodEnd) : null;
  const isWithinPeriod = periodEnd ? periodEnd > new Date() : false;
  const hasProAccess =
    billing?.planTier === "pro" &&
    (billing?.subscriptionStatus === "active" ||
      (billing?.subscriptionStatus === "cancelled" && isWithinPeriod));

  return {
    planTier: billing?.planTier ?? "free",
    isPro: hasProAccess,
    subscriptionStatus: billing?.subscriptionStatus ?? null,
    currentPeriodEnd: periodEnd,
    isLoading,
    refetch: fetchBilling,
  };
}

export function isPremiumFeature(feature: string): boolean {
  const premiumFeatures = [
    "3d-viewer",
    "pdf-export",
    "svg-export",
    "quote-builder",
    "unlimited-plans",
    "all-planners",
    "priority-support",
  ];
  return premiumFeatures.includes(feature);
}
