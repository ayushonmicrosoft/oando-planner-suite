"use client";

import { useListPlans, useDeletePlan, useDuplicatePlan, getListPlansQueryKey, useGetPlan, getGetPlanQueryKey } from '@workspace/api-client-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Trash2, Box, Clock, LayoutGrid, Loader2, Copy, Grid3X3, Pencil, Shapes, ImagePlus, FileSignature, AlertCircle, RefreshCw, FileSpreadsheet, ArrowRight, Share2, MessageSquare, CheckCircle2, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { PlansListSkeleton } from '@/components/skeletons';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { PlanThumbnail } from '@/components/plan-thumbnail';
import { ShareDialog } from '@/components/share-dialog';
import { useState, useEffect } from 'react';

function PlanShareStatus({ planId }: { planId: number }) {
  const [data, setData] = useState<{ shares: any[]; comments: any[] } | null>(null);

  useEffect(() => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    fetch(`${baseUrl}/api/plans/${planId}/shares`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setData(d))
      .catch(() => {});
  }, [planId]);

  if (!data) return null;

  const activeShares = data.shares.filter((s: any) => s.isActive);
  if (activeShares.length === 0) return null;

  const approved = activeShares.filter((s: any) => s.status === 'approved');
  const changesRequested = activeShares.filter((s: any) => s.status === 'changes_requested');
  const pending = activeShares.filter((s: any) => s.status === 'pending');
  const totalComments = data.comments.length;

  return (
    <div className="flex flex-wrap items-center gap-1.5 mt-1">
      {approved.length > 0 && (
        <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200 gap-1">
          <CheckCircle2 className="w-3 h-3" /> {approved.length} approved
        </Badge>
      )}
      {changesRequested.length > 0 && (
        <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-700 border-amber-200 gap-1">
          <XCircle className="w-3 h-3" /> {changesRequested.length} changes
        </Badge>
      )}
      {pending.length > 0 && (
        <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-700 border-blue-200 gap-1">
          <Share2 className="w-3 h-3" /> {pending.length} pending
        </Badge>
      )}
      {totalComments > 0 && (
        <Badge variant="outline" className="text-[10px] gap-1">
          <MessageSquare className="w-3 h-3" /> {totalComments}
        </Badge>
      )}
    </div>
  );
}

const plannerTypeRoutes: Record<string, string> = {
  canvas: '/planner/canvas',
  blueprint: '/planner/blueprint',
  cad: '/tools/cad',
  floorplan: '/tools/floor-plan',
  shapes: '/tools/shapes',
  import: '/tools/import',
};

const plannerTypeLabels: Record<string, string> = {
  canvas: '2D Canvas Planner',
  blueprint: 'Blueprint Wizard',
  cad: 'CAD Drawing',
  floorplan: 'Floor Plan Creator',
  shapes: 'Custom Shapes',
  import: 'Import & Scale',
};

const plannerTypeIcons: Record<string, React.ReactNode> = {
  canvas: <Grid3X3 className="w-4 h-4 text-primary" />,
  blueprint: <FileSignature className="w-4 h-4 text-blue-500" />,
  cad: <Pencil className="w-4 h-4 text-blue-500" />,
  floorplan: <LayoutGrid className="w-4 h-4 text-emerald-500" />,
  shapes: <Shapes className="w-4 h-4 text-purple-500" />,
  import: <ImagePlus className="w-4 h-4 text-orange-500" />,
};

function PlanCardThumbnail({ planId, roomWidthCm, roomDepthCm }: { planId: number; roomWidthCm: number; roomDepthCm: number }) {
  const { data: plan } = useGetPlan(planId, {
    query: {
      queryKey: getGetPlanQueryKey(planId),
      staleTime: 60000,
    },
  });

  const items = (() => {
    try {
      if (!plan?.documentJson) return [];
      const doc = JSON.parse(plan.documentJson);
      return Array.isArray(doc?.items) ? doc.items : [];
    } catch {
      return [];
    }
  })();

  return (
    <div className="rounded-lg border overflow-hidden bg-muted/10">
      <PlanThumbnail
        roomWidthCm={roomWidthCm}
        roomDepthCm={roomDepthCm}
        items={items}
        width={300}
        height={140}
        className="w-full"
      />
    </div>
  );
}

export default function Plans() {
  const router = useRouter();
  const { data: plans, isLoading, isError, refetch } = useListPlans();
  const deletePlan = useDeletePlan();
  const duplicatePlan = useDuplicatePlan();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [sharePlanId, setSharePlanId] = useState<number | null>(null);
  const [sharePlanName, setSharePlanName] = useState("");

  const handleDelete = (id: number) => {
    deletePlan.mutate({ id }, {
      onSuccess: () => {
        toast({
          title: "Plan deleted",
          description: "The floor plan has been permanently removed.",
        });
        queryClient.invalidateQueries({ queryKey: getListPlansQueryKey() });
      },
    });
  };

  const handleDuplicate = (id: number, name: string) => {
    duplicatePlan.mutate({ id, data: { name: `${name} (Copy)` } }, {
      onSuccess: (data) => {
        toast({
          title: "Plan duplicated",
          description: `Created "${data.name}" successfully.`,
        });
        queryClient.invalidateQueries({ queryKey: getListPlansQueryKey() });
      },
    });
  };

  const totalPlans = (plans || []).length;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.12em] font-semibold text-muted-foreground mb-1">Data</p>
          <h1 className="text-3xl font-bold tracking-tight">Saved Plans</h1>
          <p className="text-muted-foreground mt-1.5 text-sm">
            {totalPlans > 0 ? `${totalPlans} workspace layout${totalPlans !== 1 ? 's' : ''}` : 'Manage your workspace layouts'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="shadow-sm" onClick={() => router.push('/planner/blueprint')}>New Blueprint</Button>
          <Button className="shadow-sm" onClick={() => router.push('/planner/canvas')}>New Canvas</Button>
        </div>
      </div>

      {isLoading ? (
        <PlansListSkeleton />
      ) : isError ? (
        <Card className="bg-destructive/5 border-destructive/20">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-destructive/[0.06] flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-destructive/60" />
            </div>
            <p className="text-lg font-semibold">Failed to load plans</p>
            <p className="text-sm text-muted-foreground max-w-sm">We couldn't fetch your saved plans. Please try again.</p>
            <Button variant="outline" onClick={() => refetch()} className="gap-2">
              <RefreshCw className="w-4 h-4" /> Retry
            </Button>
          </CardContent>
        </Card>
      ) : plans?.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/[0.06] flex items-center justify-center mb-5">
              <LayoutGrid className="w-8 h-8 text-primary/40" />
            </div>
            <p className="text-lg font-semibold">No plans yet</p>
            <p className="text-sm text-muted-foreground mt-1.5 max-w-sm">Create your first floor plan to get started designing workspaces.</p>
            <div className="flex gap-3 mt-6">
              <Button onClick={() => router.push('/planner/canvas')}>Start 2D Canvas</Button>
              <Button variant="outline" onClick={() => router.push('/planner/blueprint')}>Start Blueprint</Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <TooltipProvider>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {plans?.map((plan) => (
              <Card key={plan.id} className="flex flex-col group hover:shadow-md transition-all duration-200 border-border/60 hover:border-border">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                        {plannerTypeIcons[plan.plannerType] || <Box className="w-4 h-4" />}
                      </div>
                      <div className="min-w-0">
                        <CardTitle className="text-base truncate">{plan.name}</CardTitle>
                        <CardDescription className="text-xs">
                          {plannerTypeLabels[plan.plannerType] || plan.plannerType}
                        </CardDescription>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono bg-muted px-1.5 py-0.5 rounded text-muted-foreground shrink-0">#{plan.id}</span>
                  </div>
                </CardHeader>
                <CardContent className="py-3 space-y-3 flex-1">
                  <PlanCardThumbnail planId={plan.id} roomWidthCm={plan.roomWidthCm} roomDepthCm={plan.roomDepthCm} />

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-muted/30 rounded-lg p-2.5">
                      <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground mb-0.5">Dimensions</p>
                      <p className="text-sm font-mono font-medium">
                        {Math.round(plan.roomWidthCm / 100)}m × {Math.round(plan.roomDepthCm / 100)}m
                      </p>
                    </div>
                    <div className="bg-muted/30 rounded-lg p-2.5">
                      <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground mb-0.5">Items</p>
                      <p className="text-sm font-medium flex items-center gap-1.5">
                        <Box className="w-3.5 h-3.5 text-primary opacity-60" /> {plan.itemCount}
                      </p>
                    </div>
                  </div>

                  <PlanShareStatus planId={plan.id} />

                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3 h-3 opacity-60" />
                      {format(new Date(plan.updatedAt), 'MMM d, yyyy h:mm a')}
                    </span>
                  </div>
                </CardContent>
                <CardFooter className="pt-0 pb-3 px-4">
                  <Separator className="mb-3" />
                  <div className="flex items-center gap-2 w-full">
                    <Button
                      className="flex-1 text-xs gap-1.5"
                      variant="secondary"
                      size="sm"
                      onClick={() => router.push(`${plannerTypeRoutes[plan.plannerType] || '/planner/canvas'}?id=${plan.id}`)}
                      data-testid={`button-open-${plan.id}`}
                    >
                      Open Plan
                      <ArrowRight className="w-3 h-3" />
                    </Button>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          onClick={() => { setSharePlanId(plan.id); setSharePlanName(plan.name); }}
                        >
                          <Share2 className="w-3.5 h-3.5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Share with Client</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          onClick={() => router.push(`/plans/${plan.id}/quote`)}
                        >
                          <FileSpreadsheet className="w-3.5 h-3.5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Generate Quote</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          onClick={() => handleDuplicate(plan.id, plan.name)}
                          disabled={duplicatePlan.isPending}
                        >
                          {duplicatePlan.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Copy className="w-3.5 h-3.5" />}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Duplicate</TooltipContent>
                    </Tooltip>

                    <AlertDialog>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </AlertDialogTrigger>
                        </TooltipTrigger>
                        <TooltipContent>Delete</TooltipContent>
                      </Tooltip>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete the plan "{plan.name}" and remove its layout data from our servers. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(plan.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete Plan
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TooltipProvider>
      )}

      {sharePlanId && (
        <ShareDialog
          open={!!sharePlanId}
          onOpenChange={(open) => { if (!open) setSharePlanId(null); }}
          planId={sharePlanId}
          planName={sharePlanName}
        />
      )}
    </div>
  );
}
