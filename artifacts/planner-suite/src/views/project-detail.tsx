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
  ArrowLeft, Mail, Phone, Building2, MapPin, Clock, FileText, Box, Loader2, AlertCircle, RefreshCw, Plus, Grid3X3, FileSignature, Pencil, LayoutGrid, Shapes, ImagePlus
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

const statusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  archived: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
  on_hold: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
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

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push('/projects')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
            <Badge className={statusColors[project.status] || statusColors.active} variant="outline">
              {project.status.replace('_', ' ')}
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1 flex items-center gap-1">
            <Clock className="w-4 h-4" /> Updated {format(new Date(project.updatedAt), 'MMM d, yyyy')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-4">
          {project.client && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Client</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">{project.client.name}</span>
                </div>
                {project.client.company && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Building2 className="w-4 h-4" />
                    <span>{project.client.company}</span>
                  </div>
                )}
                {project.client.email && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="w-4 h-4" />
                    <a href={`mailto:${project.client.email}`} className="hover:underline">{project.client.email}</a>
                  </div>
                )}
                {project.client.phone && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="w-4 h-4" />
                    <span>{project.client.phone}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Project Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Total Plans</span>
                <span className="font-medium">{project.planCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Created</span>
                <span className="font-medium">{format(new Date(project.createdAt), 'MMM d, yyyy')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Last Updated</span>
                <span className="font-medium">{format(new Date(project.updatedAt), 'MMM d, yyyy')}</span>
              </div>
            </CardContent>
          </Card>

          {project.notes && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{project.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Plans</h2>
            <Dialog open={moveDialogOpen} onOpenChange={setMoveDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2" size="sm">
                  <Plus className="w-4 h-4" /> Add Existing Plan
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

          {project.plans.length === 0 ? (
            <Card className="bg-muted/30 border-dashed">
              <CardContent className="flex flex-col items-center justify-center h-48 text-center text-muted-foreground">
                <FileText className="w-12 h-12 mb-4 opacity-20" />
                <p className="text-lg font-medium">No plans in this project</p>
                <p className="text-sm mt-1">Add existing plans or create new ones to get started.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {project.plans.map((plan) => (
                <Card key={plan.id} className="hover:bg-muted/50 transition-colors">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-base">{plan.name}</CardTitle>
                      <div className="text-xs text-muted-foreground font-mono">#{plan.id}</div>
                    </div>
                    <CardDescription>
                      {plannerTypeLabels[plan.plannerType] || plan.plannerType}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2 text-sm text-muted-foreground flex justify-between">
                    <div className="flex items-center gap-1">
                      <Box className="w-4 h-4" /> {plan.itemCount} items
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" /> {format(new Date(plan.updatedAt), 'MMM d')}
                    </div>
                  </CardContent>
                  <CardFooter className="gap-2">
                    <Button
                      variant="secondary"
                      className="flex-1"
                      onClick={() => router.push(`${plannerTypeRoutes[plan.plannerType] || '/planner/canvas'}?id=${plan.id}`)}
                    >
                      Open Plan
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemovePlan(plan.id)}
                    >
                      Remove
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
