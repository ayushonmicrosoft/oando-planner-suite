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
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, FolderOpen, Clock, FileText, Trash2, Loader2, AlertCircle, RefreshCw, Building2, Users } from 'lucide-react';
import { format } from 'date-fns';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

const statusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  archived: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
  on_hold: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
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

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground mt-1">Manage your office planning projects</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
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
        <Card className="bg-muted/30 border-dashed">
          <CardContent className="flex flex-col items-center justify-center h-48 text-center text-muted-foreground">
            <FolderOpen className="w-12 h-12 mb-4 opacity-20" />
            <p className="text-lg font-medium">No projects yet</p>
            <p className="text-sm mt-1">Create your first project to organize your plans.</p>
            <Button className="mt-4 gap-2" onClick={() => setDialogOpen(true)}>
              <Plus className="w-4 h-4" /> Create Project
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {sortedGroups.map(([groupName, groupProjects]) => (
            <div key={groupName}>
              <div className="flex items-center gap-2 mb-4">
                {groupName === 'Unassigned' ? (
                  <FolderOpen className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <Building2 className="w-5 h-5 text-primary" />
                )}
                <h2 className="text-xl font-semibold">{groupName}</h2>
                <Badge variant="secondary" className="ml-1">{groupProjects!.length}</Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groupProjects!.map((project) => (
                  <Card key={project.id} className="hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => router.push(`/projects/${project.id}`)}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-base">{project.name}</CardTitle>
                        <Badge className={statusColors[project.status] || statusColors.active} variant="outline">
                          {project.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      {project.clientName && (
                        <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5" /> {project.clientName}
                        </p>
                      )}
                    </CardHeader>
                    <CardContent className="pb-2 text-sm text-muted-foreground flex justify-between">
                      <div className="flex items-center gap-1">
                        <FileText className="w-4 h-4" /> {project.planCount} plan{project.planCount !== 1 ? 's' : ''}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" /> {format(new Date(project.updatedAt), 'MMM d, yyyy')}
                      </div>
                    </CardContent>
                    <CardFooter className="pt-2">
                      <div className="flex gap-2 w-full" onClick={(e) => e.stopPropagation()}>
                        <Button variant="secondary" className="flex-1" onClick={() => router.push(`/projects/${project.id}`)}>
                          View Details
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                              <Trash2 className="w-4 h-4" />
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
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
