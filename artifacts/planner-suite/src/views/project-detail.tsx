"use client";

import { useState } from 'react';
import {
  useGetProject,
  useUpdateProject,
  useUpdatePlan,
  useListPlans,
  getGetProjectQueryKey,
  getListProjectsQueryKey,
  getListPlansQueryKey,
} from '@workspace/api-client-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Mail, Phone, Building2, MapPin, Clock, FileText, Box, Loader2, AlertCircle, RefreshCw, Plus, Grid3X3, FileSignature, Pencil, LayoutGrid, Shapes, ImagePlus, CalendarDays, Hash, X
} from 'lucide-react';
import { format } from 'date-fns';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

const plannerTypeRoutes: Record<string, string> = {
  canvas: '/planner/canvas',
  blueprint: '/planner/blueprint',
  cad: '/tools/cad',
  floorplan: '/tools/floor-plan',
  shapes: '/tools/shapes',
  import: '/tools/import',
  'oando-site-plan': '/tools/site-plan',
};

const plannerTypeLabels: Record<string, string> = {
  canvas: '2D Canvas',
  blueprint: 'Blueprint',
  cad: 'CAD Drawing',
  floorplan: 'Floor Plan',
  shapes: 'Custom Shapes',
  import: 'Import & Scale',
  'oando-site-plan': 'Site Plan',
};

const plannerTypeIcons: Record<string, React.ReactNode> = {
  canvas: <Grid3X3 className="w-4 h-4 text-primary" />,
  blueprint: <FileSignature className="w-4 h-4 text-blue-500" />,
  cad: <Pencil className="w-4 h-4 text-blue-500" />,
  floorplan: <LayoutGrid className="w-4 h-4 text-emerald-500" />,
  shapes: <Shapes className="w-4 h-4 text-purple-500" />,
  import: <ImagePlus className="w-4 h-4 text-orange-500" />,
  'oando-site-plan': <LayoutGrid className="w-4 h-4 text-teal-500" />,
};

const statusConfig: Record<string, { label: string; className: string; dot: string }> = {
  active: { label: 'Active', className: 'bg-emerald-500/[0.08] text-emerald-700 dark:text-emerald-400 border-emerald-500/20', dot: 'bg-emerald-500' },
  completed: { label: 'Completed', className: 'bg-blue-500/[0.08] text-blue-700 dark:text-blue-400 border-blue-500/20', dot: 'bg-blue-500' },
  archived: { label: 'Archived', className: 'bg-gray-500/[0.08] text-gray-600 dark:text-gray-400 border-gray-500/20', dot: 'bg-gray-400' },
  on_hold: { label: 'On Hold', className: 'bg-amber-500/[0.08] text-amber-700 dark:text-amber-400 border-amber-500/20', dot: 'bg-amber-500' },
};

export default function ProjectDetail({ projectId }: { projectId: number }) {
  const router = useRouter();
  const { data: project, isLoading, isError, refetch } = useGetProject(projectId);
  const { data: allPlans } = useListPlans();
  const updateProject = useUpdateProject();
  const updatePlan = useUpdatePlan();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [moveDialogOpen, setMoveDialogOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');

  const unassignedPlans = (allPlans || []).filter((p) => !p.projectId || p.projectId !== projectId);

  const handleAddPlan = () => {
    if (!selectedPlanId) return;
    const planId = parseInt(selectedPlanId, 10);
    updatePlan.mutate(
      { id: planId, data: { projectId } },
      {
        onSuccess: () => {
          toast({ title: "Plan added", description: "Plan has been assigned to this project." });
          queryClient.invalidateQueries({ queryKey: getGetProjectQueryKey(projectId) });
          queryClient.invalidateQueries({ queryKey: getListPlansQueryKey() });
          queryClient.invalidateQueries({ queryKey: getListProjectsQueryKey() });
          setMoveDialogOpen(false);
          setSelectedPlanId('');
        },
        onError: () => {
          toast({ title: "Error", description: "Failed to add plan.", variant: "destructive" });
        },
      }
    );
  };

  const handleRemovePlan = (planId: number) => {
    updatePlan.mutate(
      { id: planId, data: { projectId: null } },
      {
        onSuccess: () => {
          toast({ title: "Plan removed", description: "Plan has been unassigned from this project." });
          queryClient.invalidateQueries({ queryKey: getGetProjectQueryKey(projectId) });
          queryClient.invalidateQueries({ queryKey: getListPlansQueryKey() });
          queryClient.invalidateQueries({ queryKey: getListProjectsQueryKey() });
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || !project) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <Card className="bg-destructive/5 border-destructive/20">
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-destructive" />
              <span className="text-sm font-medium">Failed to load project.</span>
            </div>
            <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
              <RefreshCw className="w-4 h-4" /> Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const sc = statusConfig[project.status] || statusConfig.active;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-start gap-4">
        <Button variant="ghost" size="icon" className="mt-1 shrink-0" onClick={() => router.push('/projects')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] uppercase tracking-[0.12em] font-semibold text-muted-foreground mb-1">Project Detail</p>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
            <Badge variant="outline" className={`${sc.className} text-[10px] font-medium gap-1.5`}>
              <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
              {sc.label}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1.5 flex items-center gap-1.5">
            <CalendarDays className="w-3.5 h-3.5 opacity-60" /> Updated {format(new Date(project.updatedAt), 'MMM d, yyyy')}
          </p>
        </div>
        <Dialog open={moveDialogOpen} onOpenChange={setMoveDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="gap-2 shadow-sm shrink-0" size="sm">
              <Plus className="w-4 h-4" /> Add Plan
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Plan to Project</DialogTitle>
              <DialogDescription>Select a plan to assign to this project.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Select value={selectedPlanId} onValueChange={setSelectedPlanId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a plan..." />
                </SelectTrigger>
                <SelectContent>
                  {unassignedPlans.map((p) => (
                    <SelectItem key={p.id} value={String(p.id)}>
                      {p.name} ({plannerTypeLabels[p.plannerType] || p.plannerType})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setMoveDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleAddPlan} disabled={!selectedPlanId || updatePlan.isPending}>
                {updatePlan.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Add Plan
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-5">
          {project.client && (
            <Card className="border-border/60">
              <CardHeader className="pb-2">
                <p className="text-[10px] uppercase tracking-[0.12em] font-semibold text-muted-foreground">Client</p>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/[0.06] flex items-center justify-center text-primary font-semibold text-sm">
                    {project.client.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{project.client.name}</p>
                    {project.client.company && (
                      <p className="text-xs text-muted-foreground">{project.client.company}</p>
                    )}
                  </div>
                </div>
                <Separator />
                <div className="space-y-2.5">
                  {project.client.email && (
                    <div className="flex items-center gap-2.5 text-sm">
                      <Mail className="w-3.5 h-3.5 text-muted-foreground opacity-60" />
                      <a href={`mailto:${project.client.email}`} className="hover:underline text-muted-foreground hover:text-foreground transition-colors">{project.client.email}</a>
                    </div>
                  )}
                  {project.client.phone && (
                    <div className="flex items-center gap-2.5 text-sm">
                      <Phone className="w-3.5 h-3.5 text-muted-foreground opacity-60" />
                      <span className="text-muted-foreground">{project.client.phone}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="border-border/60">
            <CardHeader className="pb-2">
              <p className="text-[10px] uppercase tracking-[0.12em] font-semibold text-muted-foreground">Project Stats</p>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Plans</span>
                <span className="text-sm font-semibold font-mono">{project.planCount}</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Created</span>
                <span className="text-sm font-medium">{format(new Date(project.createdAt), 'MMM d, yyyy')}</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Updated</span>
                <span className="text-sm font-medium">{format(new Date(project.updatedAt), 'MMM d, yyyy')}</span>
              </div>
            </CardContent>
          </Card>

          {project.notes && (
            <Card className="border-border/60">
              <CardHeader className="pb-2">
                <p className="text-[10px] uppercase tracking-[0.12em] font-semibold text-muted-foreground">Notes</p>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap leading-relaxed text-muted-foreground">{project.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="lg:col-span-2 space-y-5">
          <div>
            <p className="text-[10px] uppercase tracking-[0.12em] font-semibold text-muted-foreground mb-0.5">Floor Plans</p>
            <h2 className="text-lg font-semibold">{project.plans.length} Plan{project.plans.length !== 1 ? 's' : ''}</h2>
          </div>

          {project.plans.length === 0 ? (
            <Card className="border-dashed border-2">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-2xl bg-primary/[0.06] flex items-center justify-center mb-5">
                  <FileText className="w-8 h-8 text-primary/40" />
                </div>
                <p className="text-lg font-semibold">No plans in this project</p>
                <p className="text-sm text-muted-foreground mt-1.5 max-w-sm">Add existing plans or create new ones to get started.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {project.plans.map((plan) => (
                <Card key={plan.id} className="group hover:shadow-md transition-all duration-200 border-border/60 hover:border-border">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                          {plannerTypeIcons[plan.plannerType] || <Box className="w-4 h-4" />}
                        </div>
                        <div>
                          <CardTitle className="text-sm font-semibold">{plan.name}</CardTitle>
                          <CardDescription className="text-xs">
                            {plannerTypeLabels[plan.plannerType] || plan.plannerType}
                          </CardDescription>
                        </div>
                      </div>
                      <span className="text-[10px] text-muted-foreground font-mono bg-muted px-1.5 py-0.5 rounded">#{plan.id}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <Separator className="mb-3" />
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Box className="w-3.5 h-3.5 opacity-60" /> {plan.itemCount} items
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 opacity-60" /> {format(new Date(plan.updatedAt), 'MMM d')}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="gap-2 pt-1">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="flex-1 text-xs"
                      onClick={() => router.push(`${plannerTypeRoutes[plan.plannerType] || '/planner/canvas'}?id=${plan.id}`)}
                    >
                      Open Plan
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => handleRemovePlan(plan.id)}
                    >
                      <X className="w-3.5 h-3.5" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
