"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, Plus, Pencil, Trash2, X } from "lucide-react";
import { useListCatalogItems, getListCatalogItemsQueryKey } from "@workspace/api-client-react";
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface CatalogItem {
  id: string;
  name: string;
  category: string;
  widthCm: number;
  depthCm: number;
  heightCm: number;
  color: string | null;
  description: string | null;
  imageUrl: string | null;
  shape: string | null;
  seatCount: number | null;
  price: number | null;
}

const emptyForm = {
  name: "",
  category: "",
  widthCm: "",
  depthCm: "",
  heightCm: "",
  color: "",
  description: "",
  imageUrl: "",
  shape: "",
  seatCount: "",
  price: "",
};

export default function AdminCatalogPage() {
  const { data: items, isLoading } = useListCatalogItems();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CatalogItem | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
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
      widthCm: String(item.widthCm),
      depthCm: String(item.depthCm),
      heightCm: String(item.heightCm),
      color: item.color || "",
      description: item.description || "",
      imageUrl: item.imageUrl || "",
      shape: item.shape || "",
      seatCount: item.seatCount != null ? String(item.seatCount) : "",
      price: item.price != null ? String(item.price) : "",
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
        widthCm: Number(form.widthCm),
        depthCm: Number(form.depthCm),
        heightCm: Number(form.heightCm),
        color: form.color || null,
        description: form.description || null,
        imageUrl: form.imageUrl || null,
        shape: form.shape || null,
        seatCount: form.seatCount ? Number(form.seatCount) : null,
        price: form.price ? Number(form.price) : null,
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
      item.category.toLowerCase().includes(search.toLowerCase())
  ) ?? [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Catalog Management</h1>
          <p className="text-muted-foreground">Manage furniture catalog items</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Add Item
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search catalog..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <span className="text-sm text-muted-foreground">{filtered.length} items</span>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-3 font-medium">Name</th>
                  <th className="text-left p-3 font-medium">Category</th>
                  <th className="text-left p-3 font-medium">Dimensions (cm)</th>
                  <th className="text-left p-3 font-medium">Price</th>
                  <th className="text-left p-3 font-medium">Color</th>
                  <th className="text-right p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="p-3 font-medium">{item.name}</td>
                    <td className="p-3">
                      <Badge variant="outline">{item.category}</Badge>
                    </td>
                    <td className="p-3 text-muted-foreground">
                      {item.widthCm} × {item.depthCm} × {item.heightCm}
                    </td>
                    <td className="p-3 text-muted-foreground">
                      {item.price != null ? `$${item.price.toFixed(2)}` : "—"}
                    </td>
                    <td className="p-3 text-muted-foreground">{item.color || "—"}</td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(item)}>
                          <Pencil className="w-3 h-3" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" disabled={deletingId === item.id}>
                              {deletingId === item.id ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Trash2 className="w-3 h-3 text-destructive" />
                              )}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete &ldquo;{item.name}&rdquo;?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently remove this item from the catalog.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(item.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                      No catalog items found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Catalog Item" : "Add Catalog Item"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Name *</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Category *</Label>
                <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label>Width (cm) *</Label>
                <Input type="number" value={form.widthCm} onChange={(e) => setForm({ ...form, widthCm: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Depth (cm) *</Label>
                <Input type="number" value={form.depthCm} onChange={(e) => setForm({ ...form, depthCm: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Height (cm) *</Label>
                <Input type="number" value={form.heightCm} onChange={(e) => setForm({ ...form, heightCm: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Color</Label>
                <Input value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Shape</Label>
                <Input value={form.shape} onChange={(e) => setForm({ ...form, shape: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Price</Label>
                <Input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Seat Count</Label>
                <Input type="number" value={form.seatCount} onChange={(e) => setForm({ ...form, seatCount: e.target.value })} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Image URL</Label>
              <Input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={saving}>
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
