"use client";

import { useState } from 'react';
import {
  useListClients,
  useCreateClient,
  useDeleteClient,
  useGetClient,
  useListProjects,
  getListClientsQueryKey,
  getGetClientQueryOptions,
  getListProjectsQueryOptions,
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import {
  Plus, Users, Trash2, Loader2, AlertCircle, RefreshCw, Building2, Mail, Phone, MapPin, FolderOpen, Search, Clock
} from 'lucide-react';
import { format } from 'date-fns';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

export default function Clients() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const { data: clients, isLoading, isError, refetch } = useListClients(
    search ? { search } : undefined
  );
  const createClient = useCreateClient();
  const deleteClient = useDeleteClient();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');

  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const clientOpts = getGetClientQueryOptions(selectedClientId || 0);
  const { data: selectedClient } = useGetClient(selectedClientId || 0, {
    query: { ...clientOpts, enabled: !!selectedClientId },
  });
  const projectParams = selectedClientId ? { clientId: selectedClientId } : undefined;
  const projOpts = getListProjectsQueryOptions(projectParams);
  const { data: clientProjects } = useListProjects(
    projectParams,
    { query: { ...projOpts, enabled: !!selectedClientId } }
  );

  const handleCreate = () => {
    if (!name.trim()) return;
    createClient.mutate(
      {
        data: {
          name: name.trim(),
          company: company || undefined,
          email: email || undefined,
          phone: phone || undefined,
          address: address || undefined,
          notes: notes || undefined,
        },
      },
      {
        onSuccess: () => {
          toast({ title: "Client created", description: `"${name}" has been added.` });
          queryClient.invalidateQueries({ queryKey: getListClientsQueryKey() });
          setDialogOpen(false);
          resetForm();
        },
        onError: () => {
          toast({ title: "Error", description: "Failed to create client.", variant: "destructive" });
        },
      }
    );
  };

  const handleDelete = (id: number, clientName: string) => {
    deleteClient.mutate(
      { id },
      {
        onSuccess: () => {
          toast({ title: "Client deleted", description: `"${clientName}" has been removed.` });
          queryClient.invalidateQueries({ queryKey: getListClientsQueryKey() });
          if (selectedClientId === id) setSelectedClientId(null);
        },
        onError: () => {
          toast({ title: "Error", description: "Failed to delete client.", variant: "destructive" });
        },
      }
    );
  };

  const resetForm = () => {
    setName('');
    setCompany('');
    setEmail('');
    setPhone('');
    setAddress('');
    setNotes('');
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
          <p className="text-muted-foreground mt-1">Manage your client directory</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" /> New Client
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Client</DialogTitle>
              <DialogDescription>Add a new client to your directory.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="client-name">Name *</Label>
                <Input
                  id="client-name"
                  placeholder="Contact name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="client-company">Company</Label>
                <Input
                  id="client-company"
                  placeholder="Company name"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="client-email">Email</Label>
                  <Input
                    id="client-email"
                    type="email"
                    placeholder="email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="client-phone">Phone</Label>
                  <Input
                    id="client-phone"
                    placeholder="+1 234 567 890"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="client-address">Address</Label>
                <Input
                  id="client-address"
                  placeholder="Street, City, State"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="client-notes">Notes</Label>
                <Textarea
                  id="client-notes"
                  placeholder="Additional notes..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleCreate} disabled={!name.trim() || createClient.isPending}>
                {createClient.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Add Client
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search clients..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
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
              <span className="text-sm font-medium">Failed to load clients.</span>
            </div>
            <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
              <RefreshCw className="w-4 h-4" /> Retry
            </Button>
          </CardContent>
        </Card>
      ) : (clients || []).length === 0 ? (
        <Card className="bg-muted/30 border-dashed">
          <CardContent className="flex flex-col items-center justify-center h-48 text-center text-muted-foreground">
            <Users className="w-12 h-12 mb-4 opacity-20" />
            <p className="text-lg font-medium">{search ? 'No clients found' : 'No clients yet'}</p>
            <p className="text-sm mt-1">{search ? 'Try a different search term.' : 'Add your first client to get started.'}</p>
            {!search && (
              <Button className="mt-4 gap-2" onClick={() => setDialogOpen(true)}>
                <Plus className="w-4 h-4" /> Add Client
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(clients || []).map((client) => (
            <Card key={client.id} className="hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => setSelectedClientId(client.id)}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-base">{client.name}</CardTitle>
                  <Badge variant="secondary">{client.projectCount} project{client.projectCount !== 1 ? 's' : ''}</Badge>
                </div>
                {client.company && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5" /> {client.company}
                  </p>
                )}
              </CardHeader>
              <CardContent className="pb-2 space-y-1 text-sm text-muted-foreground">
                {client.email && (
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" /> {client.email}
                  </div>
                )}
                {client.phone && (
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5" /> {client.phone}
                  </div>
                )}
              </CardContent>
              <CardFooter className="pt-2" onClick={(e) => e.stopPropagation()}>
                <div className="flex gap-2 w-full">
                  <Button variant="secondary" className="flex-1" onClick={() => setSelectedClientId(client.id)}>
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
                        <AlertDialogTitle>Delete client?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will delete "{client.name}". Their projects will remain but will be unlinked.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(client.id, client.name)}>Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <Sheet open={!!selectedClientId} onOpenChange={(open) => !open && setSelectedClientId(null)}>
        <SheetContent className="sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{selectedClient?.name || 'Client Details'}</SheetTitle>
            <SheetDescription>
              {selectedClient?.company || 'Client information and projects'}
            </SheetDescription>
          </SheetHeader>
          {selectedClient && (
            <div className="space-y-6 mt-6">
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Contact</h3>
                {selectedClient.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <a href={`mailto:${selectedClient.email}`} className="hover:underline">{selectedClient.email}</a>
                  </div>
                )}
                {selectedClient.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span>{selectedClient.phone}</span>
                  </div>
                )}
                {selectedClient.address && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span>{selectedClient.address}</span>
                  </div>
                )}
                {selectedClient.notes && (
                  <div className="text-sm mt-2 p-3 bg-muted/50 rounded-md whitespace-pre-wrap">
                    {selectedClient.notes}
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  Projects ({clientProjects?.length || 0})
                </h3>
                {(clientProjects || []).length === 0 ? (
                  <p className="text-sm text-muted-foreground">No projects for this client yet.</p>
                ) : (
                  <div className="space-y-2">
                    {(clientProjects || []).map((p) => (
                      <Card key={p.id} className="cursor-pointer hover:bg-muted/50" onClick={() => { setSelectedClientId(null); router.push(`/projects/${p.id}`); }}>
                        <CardContent className="p-3 flex justify-between items-center">
                          <div>
                            <p className="font-medium text-sm">{p.name}</p>
                            <p className="text-xs text-muted-foreground">{p.planCount} plan{p.planCount !== 1 ? 's' : ''}</p>
                          </div>
                          <Badge variant="secondary" className="text-xs">{p.status}</Badge>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
