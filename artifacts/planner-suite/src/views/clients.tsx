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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useRouter } from 'next/navigation';
import {
  Plus, Users, Trash2, Loader2, AlertCircle, RefreshCw, Building2, Mail, Phone, MapPin, FolderOpen, Search, Clock, ArrowRight, Eye
} from 'lucide-react';
import { format } from 'date-fns';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

function ClientAvatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' }) {
  const initials = name
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
  const sizeClasses = size === 'sm' ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm';
  return (
    <div className={`${sizeClasses} rounded-full bg-primary/[0.06] flex items-center justify-center text-primary font-semibold shrink-0`}>
      {initials}
    </div>
  );
}

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

  const totalClients = (clients || []).length;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.12em] font-semibold text-muted-foreground mb-1">Management</p>
          <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
          <p className="text-muted-foreground mt-1.5 text-sm">
            {totalClients > 0 ? `${totalClients} client${totalClients !== 1 ? 's' : ''} in your directory` : 'Manage your client directory'}
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 shadow-sm">
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
          placeholder="Search by name, company, or email..."
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
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/[0.06] flex items-center justify-center mb-5">
              <Users className="w-8 h-8 text-primary/40" />
            </div>
            <p className="text-lg font-semibold">{search ? 'No clients found' : 'No clients yet'}</p>
            <p className="text-sm text-muted-foreground mt-1.5 max-w-sm">
              {search ? 'Try a different search term.' : 'Add your first client to start building your directory.'}
            </p>
            {!search && (
              <Button className="mt-6 gap-2" onClick={() => setDialogOpen(true)}>
                <Plus className="w-4 h-4" /> Add Client
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border/60">
          <div className="overflow-hidden rounded-lg">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead className="pl-4 w-[280px]">Client</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead className="text-center w-[100px]">Projects</TableHead>
                  <TableHead className="text-right pr-4 w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(clients || []).map((client) => (
                  <TableRow
                    key={client.id}
                    className="cursor-pointer group"
                    onClick={() => setSelectedClientId(client.id)}
                  >
                    <TableCell className="pl-4">
                      <div className="flex items-center gap-3">
                        <ClientAvatar name={client.name} />
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate">{client.name}</p>
                          {client.company && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1 truncate">
                              <Building2 className="w-3 h-3 opacity-60 shrink-0" /> {client.company}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {client.email && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1.5 truncate">
                            <Mail className="w-3 h-3 opacity-60 shrink-0" /> {client.email}
                          </p>
                        )}
                        {client.phone && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                            <Phone className="w-3 h-3 opacity-60 shrink-0" /> {client.phone}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary" className="text-xs font-mono">
                        {client.projectCount}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right pr-4" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          onClick={() => setSelectedClientId(client.id)}
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                              <Trash2 className="w-3.5 h-3.5" />
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
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      <Sheet open={!!selectedClientId} onOpenChange={(open) => !open && setSelectedClientId(null)}>
        <SheetContent className="sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-3">
              {selectedClient && <ClientAvatar name={selectedClient.name} />}
              <div>
                <span>{selectedClient?.name || 'Client Details'}</span>
                {selectedClient?.company && (
                  <p className="text-sm font-normal text-muted-foreground">{selectedClient.company}</p>
                )}
              </div>
            </SheetTitle>
            <SheetDescription className="sr-only">
              Client information and projects
            </SheetDescription>
          </SheetHeader>
          {selectedClient && (
            <div className="space-y-6 mt-6">
              <div className="space-y-4">
                <p className="text-[10px] uppercase tracking-[0.12em] font-semibold text-muted-foreground">Contact Information</p>
                <div className="space-y-3 bg-muted/30 rounded-lg p-4">
                  {selectedClient.email && (
                    <div className="flex items-center gap-2.5 text-sm">
                      <Mail className="w-4 h-4 text-muted-foreground opacity-60" />
                      <a href={`mailto:${selectedClient.email}`} className="hover:underline text-foreground">{selectedClient.email}</a>
                    </div>
                  )}
                  {selectedClient.phone && (
                    <div className="flex items-center gap-2.5 text-sm">
                      <Phone className="w-4 h-4 text-muted-foreground opacity-60" />
                      <span>{selectedClient.phone}</span>
                    </div>
                  )}
                  {selectedClient.address && (
                    <div className="flex items-center gap-2.5 text-sm">
                      <MapPin className="w-4 h-4 text-muted-foreground opacity-60" />
                      <span>{selectedClient.address}</span>
                    </div>
                  )}
                  {!selectedClient.email && !selectedClient.phone && !selectedClient.address && (
                    <p className="text-sm text-muted-foreground">No contact details added.</p>
                  )}
                </div>
                {selectedClient.notes && (
                  <div className="text-sm p-4 bg-muted/30 rounded-lg whitespace-pre-wrap leading-relaxed text-muted-foreground">
                    {selectedClient.notes}
                  </div>
                )}
              </div>

              <Separator />

              <div className="space-y-4">
                <p className="text-[10px] uppercase tracking-[0.12em] font-semibold text-muted-foreground">
                  Projects ({clientProjects?.length || 0})
                </p>
                {(clientProjects || []).length === 0 ? (
                  <div className="text-center py-8 bg-muted/20 rounded-lg">
                    <FolderOpen className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No projects for this client yet.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {(clientProjects || []).map((p) => (
                      <Card
                        key={p.id}
                        className="cursor-pointer hover:shadow-sm hover:border-border transition-all"
                        onClick={() => { setSelectedClientId(null); router.push(`/projects/${p.id}`); }}
                      >
                        <CardContent className="p-3 flex justify-between items-center">
                          <div>
                            <p className="font-medium text-sm">{p.name}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{p.planCount} plan{p.planCount !== 1 ? 's' : ''}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-[10px]">{p.status.replace('_', ' ')}</Badge>
                            <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
                          </div>
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
