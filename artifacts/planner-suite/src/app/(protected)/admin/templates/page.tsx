"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Search, Pencil, Trash2, LayoutTemplate, MoreHorizontal, Users2, Maximize2 } from "lucide-react";
import { useListTemplates, getListTemplatesQueryKey } from "@workspace/api-client-react";
import { adminUpdateTemplate, adminDeleteTemplate } from "@/lib/admin-api";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TemplateItem {
  id: string;
  name: string;
  description: string;
  category: string;
  roomWidthCm: number;
  roomDepthCm: number;
  furnitureCount: number;
  usageCount: number;
  layoutJson: string;
  thumbnailSvg: string | null;
  createdAt: string;
}

const categoryColors: Record<string, string> = {
  office: "bg-blue-50 text-blue-700 border-blue-200",
  meeting: "bg-violet-50 text-violet-700 border-violet-200",
  lounge: "bg-emerald-50 text-emerald-700 border-emerald-200",
  reception: "bg-amber-50 text-amber-700 border-amber-200",
  open: "bg-rose-50 text-rose-700 border-rose-200",
};

function getCategoryStyle(cat: string) {
  const key = cat.toLowerCase();
  for (const k of Object.keys(categoryColors)) {
    if (key.includes(k)) return categoryColors[k];
  }
  return "bg-gray-50 text-gray-700 border-gray-200";
}

export default function AdminTemplatesPage() {
  const { data: templates, isLoading } = useListTemplates();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<TemplateItem | null>(null);
  const [form, setForm] = useState({ name: "", description: "", category: "" });
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<TemplateItem | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { toast } = useToast();
  const qc = useQueryClient();

  const openEdit = (t: TemplateItem) => {
    setEditingTemplate(t);
    setForm({ name: t.name, description: t.description, category: t.category });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!editingTemplate || !form.name) return;
    setSaving(true);
    try {
      await adminUpdateTemplate(editingTemplate.id, {
        name: form.name,
        description: form.description,
        category: form.category,
      });
      toast({ title: "Template updated" });
      setDialogOpen(false);
      qc.invalidateQueries({ queryKey: getListTemplatesQueryKey() });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Save failed", description: e.message });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    setDeleteTarget(null);
    try {
      await adminDeleteTemplate(id);
      toast({ title: "Template deleted" });
      qc.invalidateQueries({ queryKey: getListTemplatesQueryKey() });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Delete failed", description: e.message });
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = (templates as TemplateItem[] | undefined)?.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.category.toLowerCase().includes(search.toLowerCase())
  ) ?? [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--text-subtle)]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-heading)] tracking-tight">Template Management</h1>
        <p className="text-[var(--text-muted)] mt-1">View and manage layout templates</p>
      </div>

      <div className="flex items-center gap-3">
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--surface-accent-wash)] text-[var(--text-muted)] text-sm">
          <LayoutTemplate className="w-3.5 h-3.5" />
          {(templates as TemplateItem[] | undefined)?.length ?? 0} templates
        </span>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-subtle)]" />
          <Input
            placeholder="Search templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-10 rounded-xl border-[var(--border-soft)] bg-white"
          />
        </div>
        <span className="text-sm text-[var(--text-subtle)]">{filtered.length} results</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filtered.map((t) => (
          <Card key={t.id} className="border-[var(--border-soft)] overflow-hidden group hover:shadow-[var(--shadow-soft)] transition-all duration-300">
            <div className="aspect-[16/9] bg-[var(--surface-soft)] relative flex items-center justify-center border-b border-[var(--border-soft)]">
              {t.thumbnailSvg ? (
                <div className="w-full h-full p-4" dangerouslySetInnerHTML={{ __html: t.thumbnailSvg }} />
              ) : (
                <div className="flex flex-col items-center gap-2 text-[var(--text-subtle)]">
                  <LayoutTemplate className="w-8 h-8" />
                  <span className="text-xs">No preview</span>
                </div>
              )}
              <div className="absolute top-3 right-3 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100 transition-opacity">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="secondary" size="sm" className="h-8 w-8 p-0 shadow-sm" aria-label="Template actions">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem onClick={() => openEdit(t)}>
                      <Pencil className="w-4 h-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setDeleteTarget(t)}
                      className="text-destructive focus:text-destructive"
                      disabled={deletingId === t.id}
                    >
                      {deletingId === t.id ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4 mr-2" />
                      )}
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-semibold text-sm text-[var(--text-heading)] leading-snug">{t.name}</h3>
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border shrink-0 ${getCategoryStyle(t.category)}`}>
                  {t.category}
                </span>
              </div>
              <p className="text-xs text-[var(--text-muted)] line-clamp-2 mb-3">{t.description}</p>
              <div className="flex items-center gap-4 text-xs text-[var(--text-subtle)]">
                <span className="flex items-center gap-1">
                  <Maximize2 className="w-3 h-3" />
                  {t.roomWidthCm} &times; {t.roomDepthCm} cm
                </span>
                <span className="flex items-center gap-1">
                  <LayoutTemplate className="w-3 h-3" />
                  {t.furnitureCount} items
                </span>
                <span className="flex items-center gap-1">
                  <Users2 className="w-3 h-3" />
                  {t.usageCount ?? 0} uses
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <LayoutTemplate className="w-10 h-10 mx-auto text-[var(--text-subtle)] mb-3" />
          <p className="text-sm text-[var(--text-muted)]">No templates found.</p>
        </div>
      )}

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete &ldquo;{deleteTarget?.name}&rdquo;?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this template.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTarget && handleDelete(deleteTarget.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Template</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Category</Label>
              <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Description</Label>
              <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="rounded-xl" />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)} className="rounded-xl">Cancel</Button>
              <Button onClick={handleSave} disabled={saving} className="rounded-xl">
                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
