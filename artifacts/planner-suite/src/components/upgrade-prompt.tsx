"use client";

import { useRouter } from "next/navigation";
import { Crown, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface UpgradePromptProps {
  feature?: string;
  title?: string;
  description?: string;
  compact?: boolean;
}

export function UpgradePrompt({
  feature,
  title = "Upgrade to Pro",
  description = "This feature is available on the Pro plan. Upgrade to unlock unlimited plans, all planners, PDF/SVG export, 3D viewer, and more.",
  compact = false,
}: UpgradePromptProps) {
  const router = useRouter();

  if (compact) {
    return (
      <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
        <Crown className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-amber-900 dark:text-amber-200">
            {feature ? `${feature} requires Pro` : title}
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="shrink-0 border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-300 dark:hover:bg-amber-900"
          onClick={() => router.push("/settings/billing")}
        >
          Upgrade
        </Button>
      </div>
    );
  }

  return (
    <Card className="border-amber-200 dark:border-amber-800 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
      <CardContent className="flex flex-col items-center text-center py-12 px-6">
        <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center mb-4">
          <Crown className="w-8 h-8 text-amber-600 dark:text-amber-400" />
        </div>
        <h3 className="text-xl font-semibold text-amber-900 dark:text-amber-200 mb-2">
          {title}
        </h3>
        <p className="text-sm text-amber-700 dark:text-amber-400 max-w-md mb-6">
          {description}
        </p>
        <Button
          onClick={() => router.push("/settings/billing")}
          className="bg-amber-600 hover:bg-amber-700 text-white"
        >
          Upgrade
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
}
