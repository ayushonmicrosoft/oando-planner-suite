"use client";

import { useState } from 'react';
import {
  useListProjects,
  useCreateProject,
  useDeleteProject,
  useListClients,
  getListProjectsQueryKey,
} from '@workspace/api-client-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, FolderOpen, Clock, FileText, Trash2, Loader2, AlertCircle, RefreshCw, Building2, Users, ArrowRight, CalendarDays } from 'lucide-react';
import { format } from 'date-fns';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

const statusConfig: Record<string, { label: string; className: string; dot: string }> = {
  active: { label: 'Active', className: 'bg-emerald-500/[0.08] text-emerald-700 dark:text-emerald-400 border-emerald-500/20', dot: 'bg-emerald-500' },
  completed: { label: 'Completed', className: 'bg-blue-500/[0.08] text-blue-700 dark:text-blue-400 border-blue-500/20', dot: 'bg-blue-500' },
  archived: { label: 'Archived', className: 'bg-gray-500/[0.08] text-gray-600 dark:text-gray-400 border-gray-500/20', dot: 'bg-gray-400' },
  on_hold: { label: 'On Hold', className: 'bg-amber-500/[0.08] text-amber-700 dark:text-amber-400 border-amber-500/20', dot: 'bg-amber-500' },
};

export default function Projects() {
  const router = useRouter();
  const { data: projects, isLoading, isError, refetch } = useListProjects();
  const { data: clients } = useListClients();
  const createProject = useCreateProject();
  const deleteProject = useDeleteProject();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [name, setName] = useState('');
  const [clientId, setClientId] = useState<string>('');
  const [status, setStatus] = useState('active');
  const [notes, setNotes] = useState('');

  const handleCreate = () => {
    if (!name.trim()) return;
    const parsedClientId = clientId && clientId !== 'none' ? parseInt(clientId, 10) : undefined;
    createProject.mutate(
      {
        data: {
          name: name.trim(),
          clientId: parsedClientId && !isNaN(parsedClientId) ? parsedClientId : undefined,
          status,
          notes: notes || undefined,
        },
      },
      {
        onSuccess: () => {
          toast({ title: "Project created", description: `"${name}" has been created.` });
          queryClient.invalidateQueries({ queryKey: getListProjectsQueryKey() });
          setDialogOpen(false);
          setName('');
          setClientId('');
          setStatus('active');
          setNotes('');
        },
        onError: () => {
          toast({ title: "Error", description: "Failed to create project.", variant: "destructive" });
        },
      }
    );
  };

  const handleDelete = (id: number, projectName: string) => {
    deleteProject.mutate(
      { id },
      {
        onSuccess: () => {
          toast({ title: "Project deleted", description: `"${projectName}" has been removed.` });
          queryClient.invalidateQueries({ queryKey: getListProjectsQueryKey() });
        },
        onError: () => {
          toast({ title: "Error", description: "Failed to delete project.", variant: "destructive" });
        },
      }
    );
  };

  const grouped = (projects || []).reduce((acc, p) => {
    const key = p.clientName || 'Unassigned';
    if (!acc[key]) acc[key] = [];
    acc[key].push(p);
    return acc;
  }, {} as Record<string, typeof projects>);

  const sortedGroups = Object.entries(grouped).sort(([a], [b]) => {
    if (a === 'Unassigned') return 1;
    if (b === 'Unassigned') return -1;
    return a.localeCompare(b);
  });

  const totalProjects = (projects || []).length;
  const activeCount = (projects || []).filter(p => p.status === 'active').length;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.12em] font-semibold text-muted-foreground mb-1">Management</p>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground mt-1.5 text-sm">
            {totalProjects > 0
              ? `${totalProjects} project${totalProjects !== 1 ? 's' : ''} · ${activeCount} active`
              : 'Manage your office planning projects'}
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 shadow-sm">
              <Plus className="w-4 h-4" /> New Project
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Project</DialogTitle>
              <DialogDescription>Set up a new project with client details.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="project-name">Project Name</Label>
                <Input
                  id="project-name"
                  placeholder="e.g. Office Renovation Phase 2"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="project-client">Client</Label>
                <Select value={clientId} onValueChange={setClientId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a client (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No client</SelectItem>
                    {(clients || []).map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.name}{c.company ? ` (${c.company})` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="project-status">Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="on_hold">On Hold</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="project-notes">Notes</Label>
                <Textarea
                  id="project-notes"
                  placeholder="Project notes..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleCreate} disabled={!name.trim() || createProject.isPending}>
                {createProject.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Create Project
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : isError ? (
        <Card className="bg-destructive/5 border-destructive/20">
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-destructive" />
              <span className="text-sm font-medium">Failed to load projects.</span>
            </div>
            <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
              <RefreshCw className="w-4 h-4" /> Retry
            </Button>
          </CardContent>
        </Card>
      ) : (projects || []).length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/[0.06] flex items-center justify-center mb-5">
              <FolderOpen className="w-8 h-8 text-primary/40" />
            </div>
            <p className="text-lg font-semibold">No projects yet</p>
            <p className="text-sm text-muted-foreground mt-1.5 max-w-sm">Create your first project to organize your plans and keep track of client work.</p>
            <Button className="mt-6 gap-2" onClick={() => setDialogOpen(true)}>
              <Plus className="w-4 h-4" /> Create Project
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-10">
          {sortedGroups.map(([groupName, groupProjects]) => (
            <div key={groupName}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${groupName === 'Unassigned' ? 'bg-muted' : 'bg-primary/[0.06]'}`}>
                  {groupName === 'Unassigned' ? (
                    <FolderOpen className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <Building2 className="w-4 h-4 text-primary" />
                  )}
                </div>
                <div>
                  <h2 className="text-base font-semibold">{groupName}</h2>
                  <p className="text-xs text-muted-foreground">{groupProjects!.length} project{groupProjects!.length !== 1 ? 's' : ''}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groupProjects!.map((project) => {
                  const sc = statusConfig[project.status] || statusConfig.active;
                  return (
                    <Card
                      key={project.id}
                      className="group hover:shadow-md transition-all duration-200 cursor-pointer border-border/60 hover:border-border"
                      onClick={() => router.push(`/projects/${project.id}`)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start gap-2">
                          <CardTitle className="text-base leading-snug">{project.name}</CardTitle>
                          <Badge variant="outline" className={`${sc.className} text-[10px] font-medium shrink-0 gap-1.5`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                            {sc.label}
                          </Badge>
                        </div>
                        {project.clientName && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1">
                            <Users className="w-3 h-3 opacity-60" /> {project.clientName}
                          </p>
                        )}
                      </CardHeader>
                      <CardContent className="pb-3">
                        <Separator className="mb-3" />
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5 opacity-60" />
                            <span>{project.planCount} plan{project.planCount !== 1 ? 's' : ''}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <CalendarDays className="w-3.5 h-3.5 opacity-60" />
                            <span>{format(new Date(project.updatedAt), 'MMM d, yyyy')}</span>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="pt-0 pb-3">
                        <div className="flex gap-2 w-full" onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="secondary"
                            size="sm"
                            className="flex-1 text-xs gap-1.5 group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                            onClick={() => router.push(`/projects/${project.id}`)}
                          >
                            View Details
                            <ArrowRight className="w-3 h-3" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete project?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will delete "{project.name}". Plans in this project will be unassigned but not deleted.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(project.id, project.name)}>Delete</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
