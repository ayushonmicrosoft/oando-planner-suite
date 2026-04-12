import { useListPlans, useDeletePlan, useDuplicatePlan, getListPlansQueryKey, useGetPlan, getGetPlanQueryKey } from '@workspace/api-client-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link, useLocation } from 'wouter';
import { Trash2, Box, Clock, LayoutGrid, Loader2, Copy, Grid3X3, Pencil, Shapes, ImagePlus, FileSignature, AlertCircle, RefreshCw } from 'lucide-react';
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
    <div className="rounded-md border overflow-hidden bg-muted/20">
      <PlanThumbnail
        roomWidthCm={roomWidthCm}
        roomDepthCm={roomDepthCm}
        items={items}
        width={300}
        height={120}
        className="w-full"
      />
    </div>
  );
}

export default function Plans() {
  const [, setLocation] = useLocation();
  const { data: plans, isLoading, isError, refetch } = useListPlans();
  const deletePlan = useDeletePlan();
  const duplicatePlan = useDuplicatePlan();
  const queryClient = useQueryClient();
  const { toast } = useToast();

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

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Saved Plans</h1>
          <p className="text-muted-foreground mt-2">Manage your workspace layouts.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setLocation('/planner/blueprint')}>New Blueprint</Button>
          <Button onClick={() => setLocation('/planner/canvas')}>New Canvas</Button>
        </div>
      </div>

      {isLoading ? (
        <PlansListSkeleton />
      ) : isError ? (
        <Card className="bg-destructive/5 border-destructive/20">
          <CardContent className="flex flex-col items-center justify-center h-64 text-center space-y-4">
            <AlertCircle className="w-12 h-12 text-destructive opacity-60" />
            <p className="text-lg font-medium">Failed to load plans</p>
            <p className="text-sm text-muted-foreground">We couldn't fetch your saved plans. Please try again.</p>
            <Button variant="outline" onClick={() => refetch()} className="gap-2">
              <RefreshCw className="w-4 h-4" /> Retry
            </Button>
          </CardContent>
        </Card>
      ) : plans?.length === 0 ? (
        <Card className="bg-muted/30 border-dashed">
          <CardContent className="flex flex-col items-center justify-center h-64 text-center text-muted-foreground">
            <LayoutGrid className="w-12 h-12 mb-4 opacity-20" />
            <p className="text-lg font-medium">No plans yet</p>
            <p className="text-sm mt-1">Create your first floor plan to get started.</p>
            <div className="flex gap-4 mt-6">
              <Button onClick={() => setLocation('/planner/canvas')}>Start 2D Canvas</Button>
              <Button variant="secondary" onClick={() => setLocation('/planner/blueprint')}>Start Blueprint</Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans?.map((plan) => (
            <Card key={plan.id} className="flex flex-col hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    <CardDescription className="flex items-center gap-1.5">
                      {plannerTypeIcons[plan.plannerType] || <Box className="w-4 h-4" />}
                      {plannerTypeLabels[plan.plannerType] || plan.plannerType}
                    </CardDescription>
                  </div>
                  <div className="text-xs font-mono bg-muted px-2 py-1 rounded text-muted-foreground">
                    #{plan.id}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="py-4 space-y-3 flex-1">
                <PlanCardThumbnail planId={plan.id} roomWidthCm={plan.roomWidthCm} roomDepthCm={plan.roomDepthCm} />

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-1">
                    <span className="text-muted-foreground text-xs uppercase tracking-wider">Dimensions</span>
                    <div className="font-mono">
                      {Math.round(plan.roomWidthCm / 100)}m × {Math.round(plan.roomDepthCm / 100)}m
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-muted-foreground text-xs uppercase tracking-wider">Items</span>
                    <div className="flex items-center gap-1.5 font-medium">
                      <Box className="w-4 h-4 text-primary" /> {plan.itemCount}
                    </div>
                  </div>
                </div>

                <div className="bg-muted/50 rounded-md p-3 text-xs flex items-center justify-between mt-4">
                  <span className="text-muted-foreground">Last modified</span>
                  <span className="font-medium flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    {format(new Date(plan.updatedAt), 'MMM d, yyyy h:mm a')}
                  </span>
                </div>
              </CardContent>
              <CardFooter className="pt-0 flex justify-between gap-2">
                <Button
                  className="flex-1"
                  variant="secondary"
                  onClick={() => setLocation(`${plannerTypeRoutes[plan.plannerType] || '/planner/canvas'}?id=${plan.id}`)}
                  data-testid={`button-open-${plan.id}`}
                >
                  Open Plan
                </Button>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleDuplicate(plan.id, plan.name)}
                  disabled={duplicatePlan.isPending}
                  title="Duplicate plan"
                >
                  {duplicatePlan.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Copy className="w-4 h-4" />}
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="icon" className="text-destructive hover:bg-destructive hover:text-destructive-foreground">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
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
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
