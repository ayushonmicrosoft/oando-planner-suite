"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Search, Plus, Pencil, Trash2, Package, MoreHorizontal, Ruler, Crown, Star, Zap } from "lucide-react";
import { useListCatalogItems, useListSeries, getListCatalogItemsQueryKey } from "@workspace/api-client-react";
import { adminCreateCatalogItem, adminUpdateCatalogItem, adminDeleteCatalogItem } from "@/lib/admin-api";
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

interface CatalogItem {
  id: string;
  name: string;
  category: string;
  subCategory: string | null;
  widthCm: number;
  depthCm: number;
  heightCm: number;
  color: string | null;
  description: string | null;
  imageUrl: string | null;
  shape: string | null;
  seatCount: number | null;
  price: number | null;
  seriesId: string | null;
}

const TIER_ICONS: Record<string, typeof Crown> = { economy: Zap, medium: Star, premium: Crown };
const TIER_BADGE_STYLES: Record<string, string> = {
  economy: "bg-emerald-50 text-emerald-700 border-emerald-200",
  medium: "bg-blue-50 text-blue-700 border-blue-200",
  premium: "bg-amber-50 text-amber-700 border-amber-200",
};

const emptyForm = {
  name: "",
  category: "",
  subCategory: "",
  widthCm: "",
  depthCm: "",
  heightCm: "",
  color: "",
  description: "",
  imageUrl: "",
  shape: "",
  seatCount: "",
  price: "",
  seriesId: "",
};

const categoryColors: Record<string, string> = {
  workstations: "bg-blue-50 text-blue-700 border-blue-200",
  seating: "bg-emerald-50 text-emerald-700 border-emerald-200",
  "soft-seating": "bg-violet-50 text-violet-700 border-violet-200",
  tables: "bg-orange-50 text-orange-700 border-orange-200",
  storage: "bg-amber-50 text-amber-700 border-amber-200",
  education: "bg-cyan-50 text-cyan-700 border-cyan-200",
  accessories: "bg-rose-50 text-rose-700 border-rose-200",
  desk: "bg-blue-50 text-blue-700 border-blue-200",
  chair: "bg-emerald-50 text-emerald-700 border-emerald-200",
  table: "bg-violet-50 text-violet-700 border-violet-200",
  sofa: "bg-rose-50 text-rose-700 border-rose-200",
  partition: "bg-slate-50 text-slate-700 border-slate-200",
};

function getCategoryStyle(cat: string) {
  const key = cat.toLowerCase();
  return categoryColors[key] || "bg-gray-50 text-gray-700 border-gray-200";
}

export default function AdminCatalogPage() {
  const { data: items, isLoading } = useListCatalogItems();
  const { data: seriesData } = useListSeries();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CatalogItem | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<CatalogItem | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { toast } = useToast();
  const qc = useQueryClient();

  const openCreate = () => {
    setEditingItem(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (item: CatalogItem) => {
    setEditingItem(item);
    setForm({
      name: item.name,
      category: item.category,
      subCategory: item.subCategory || "",
      widthCm: String(item.widthCm),
      depthCm: String(item.depthCm),
      heightCm: String(item.heightCm),
      color: item.color || "",
      description: item.description || "",
      imageUrl: item.imageUrl || "",
      shape: item.shape || "",
      seatCount: item.seatCount != null ? String(item.seatCount) : "",
      price: item.price != null ? String(item.price) : "",
      seriesId: item.seriesId || "",
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.category || !form.widthCm || !form.depthCm || !form.heightCm) {
      toast({ variant: "destructive", title: "Missing fields", description: "Name, category, and dimensions are required." });
      return;
    }
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        name: form.name,
        category: form.category,
        subCategory: form.subCategory || null,
        widthCm: Number(form.widthCm),
        depthCm: Number(form.depthCm),
        heightCm: Number(form.heightCm),
        color: form.color || null,
        description: form.description || null,
        imageUrl: form.imageUrl || null,
        shape: form.shape || null,
        seatCount: form.seatCount ? Number(form.seatCount) : null,
        price: form.price ? Number(form.price) : null,
        seriesId: form.seriesId || null,
      };

      if (editingItem) {
        await adminUpdateCatalogItem(editingItem.id, payload);
        toast({ title: "Item updated" });
      } else {
        await adminCreateCatalogItem(payload);
        toast({ title: "Item created" });
      }
      setDialogOpen(false);
      qc.invalidateQueries({ queryKey: getListCatalogItemsQueryKey() });
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
      await adminDeleteCatalogItem(id);
      toast({ title: "Item deleted" });
      qc.invalidateQueries({ queryKey: getListCatalogItemsQueryKey() });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Delete failed", description: e.message });
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = (items as CatalogItem[] | undefined)?.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase()) ||
      (item.subCategory || "").toLowerCase().includes(search.toLowerCase())
  ) ?? [];

  const categories = [...new Set((items as CatalogItem[] | undefined)?.map((i) => i.category) ?? [])];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--text-subtle)]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-heading)] tracking-tight">Catalog Management</h1>
          <p className="text-[var(--text-muted)] mt-1">Manage furniture catalog items</p>
        </div>
        <Button onClick={openCreate} className="gap-2 rounded-xl shadow-sm">
          <Plus className="w-4 h-4" />
          Add Item
        </Button>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 text-sm">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--surface-accent-wash)] text-[var(--text-muted)]">
            <Package className="w-3.5 h-3.5" />
            {(items as CatalogItem[] | undefined)?.length ?? 0} items
          </span>
          <span className="text-[var(--text-subtle)]">&middot;</span>
          <span className="text-sm text-[var(--text-subtle)]">{categories.length} categories</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-subtle)]" />
          <Input
            placeholder="Search by name or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-10 rounded-xl border-[var(--border-soft)] bg-white"
          />
        </div>
        <span className="text-sm text-[var(--text-subtle)]">{filtered.length} results</span>
      </div>

      <Card className="border-[var(--border-soft)] overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border-soft)] bg-[var(--surface-soft)]">
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Item</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Category</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Series</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Dimensions</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Price</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Color</th>
                  <th className="text-right px-5 py-3.5 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-soft)]">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-[var(--surface-hover)] transition-colors duration-150">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-[var(--surface-accent-wash)] shrink-0">
                          <Package className="w-4 h-4 text-[var(--text-muted)]" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-sm text-[var(--text-strong)] truncate">{item.name}</p>
                          {item.description && (
                            <p className="text-xs text-[var(--text-subtle)] truncate max-w-[200px]">{item.description}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-0.5">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${getCategoryStyle(item.category)}`}>
                          {item.category}
                        </span>
                        {item.subCategory && (
                          <span className="text-[10px] text-[var(--text-subtle)] pl-1 truncate max-w-[140px]">{item.subCategory}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      {(() => {
                        const series = seriesData?.find((s: any) => s.id === (item as any).seriesId);
                        if (!series) return <span className="text-sm text-[var(--text-subtle)]">&mdash;</span>;
                        const TierIcon = TIER_ICONS[series.tier] || Star;
                        const badgeStyle = TIER_BADGE_STYLES[series.tier] || "";
                        return (
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border ${badgeStyle}`}>
                            <TierIcon className="w-3 h-3" />
                            {series.tier.charAt(0).toUpperCase() + series.tier.slice(1)}
                          </span>
                        );
                      })()}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 text-[var(--text-muted)]">
                        <Ruler className="w-3.5 h-3.5 text-[var(--text-subtle)]" />
                        <span className="text-sm">{item.widthCm} &times; {item.depthCm} &times; {item.heightCm}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      {item.price != null ? (
                        <span className="text-sm font-medium text-[var(--text-strong)]">₹{item.price.toLocaleString()}</span>
                      ) : (
                        <span className="text-sm text-[var(--text-subtle)]">&mdash;</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      {item.color ? (
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full border border-[var(--border-soft)]" style={{ backgroundColor: item.color.startsWith("#") ? item.color : undefined }} />
                          <span className="text-sm text-[var(--text-muted)]">{item.color}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-[var(--text-subtle)]">&mdash;</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" aria-label="Item actions">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem onClick={() => openEdit(item)}>
                            <Pencil className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => setDeleteTarget(item)}
                            className="text-destructive focus:text-destructive"
                            disabled={deletingId === item.id}
                          >
                            {deletingId === item.id ? (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4 mr-2" />
                            )}
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center">
                      <Package className="w-8 h-8 mx-auto text-[var(--text-subtle)] mb-2" />
                      <p className="text-sm text-[var(--text-muted)]">No catalog items found.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete &ldquo;{deleteTarget?.name}&rdquo;?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this item from the catalog.
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
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Catalog Item" : "Add Catalog Item"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Name *</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Category *</Label>
                <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="rounded-xl" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Sub-Category</Label>
              <Input value={form.subCategory} onChange={(e) => setForm({ ...form, subCategory: e.target.value })} className="rounded-xl" placeholder="e.g. Desking Series - DeskPro 1" />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Width (cm) *</Label>
                <Input type="number" value={form.widthCm} onChange={(e) => setForm({ ...form, widthCm: e.target.value })} className="rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Depth (cm) *</Label>
                <Input type="number" value={form.depthCm} onChange={(e) => setForm({ ...form, depthCm: e.target.value })} className="rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Height (cm) *</Label>
                <Input type="number" value={form.heightCm} onChange={(e) => setForm({ ...form, heightCm: e.target.value })} className="rounded-xl" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Color</Label>
                <Input value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} className="rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Shape</Label>
                <Input value={form.shape} onChange={(e) => setForm({ ...form, shape: e.target.value })} className="rounded-xl" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Price</Label>
                <Input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Seat Count</Label>
                <Input type="number" value={form.seatCount} onChange={(e) => setForm({ ...form, seatCount: e.target.value })} className="rounded-xl" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Description</Label>
              <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="rounded-xl" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Series</Label>
                <select
                  value={form.seriesId}
                  onChange={(e) => setForm({ ...form, seriesId: e.target.value })}
                  className="flex h-10 w-full rounded-xl border border-[var(--border-soft)] bg-white px-3 py-2 text-sm"
                >
                  <option value="">None (Standalone)</option>
                  {seriesData?.map((s: any) => (
                    <option key={s.id} value={s.id}>{s.tier.charAt(0).toUpperCase() + s.tier.slice(1)} — {s.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Image URL</Label>
                <Input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} className="rounded-xl" />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)} className="rounded-xl">Cancel</Button>
              <Button onClick={handleSave} disabled={saving} className="rounded-xl">
                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {editingItem ? "Save Changes" : "Create Item"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
