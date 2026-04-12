"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Loader2, Search, Shield, ShieldOff, MoreHorizontal, UserCircle } from "lucide-react";
import { adminGetUsers, adminUpdateUserRole } from "@/lib/admin-api";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface UserRow {
  id: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  role: "user" | "admin";
  createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [confirmUser, setConfirmUser] = useState<UserRow | null>(null);
  const { profile } = useAuth();
  const { toast } = useToast();

  const fetchUsers = useCallback(async () => {
    try {
      const data = await adminGetUsers();
      setUsers(data);
    } catch (e: any) {
      toast({ variant: "destructive", title: "Failed to load users", description: e.message });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const toggleRole = async (user: UserRow) => {
    const newRole = user.role === "admin" ? "user" : "admin";
    setTogglingId(user.id);
    setConfirmUser(null);
    try {
      await adminUpdateUserRole(user.id, newRole);
      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, role: newRole } : u)));
      toast({ title: "Role updated", description: `${user.email} is now ${newRole}` });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Failed to update role", description: e.message });
    } finally {
      setTogglingId(null);
    }
  };

  const filtered = users.filter(
    (u) =>
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.displayName || "").toLowerCase().includes(search.toLowerCase())
  );

  const adminCount = users.filter((u) => u.role === "admin").length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--text-subtle)]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-heading)] tracking-tight">User Management</h1>
        <p className="text-[var(--text-muted)] mt-1">Manage user accounts and roles</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-sm">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--surface-accent-wash)] text-[var(--text-muted)]">
            <UserCircle className="w-3.5 h-3.5" />
            {users.length} total
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--color-primary)]/8 text-[var(--color-primary)]">
            <Shield className="w-3.5 h-3.5" />
            {adminCount} admins
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-subtle)]" />
          <Input
            placeholder="Search by name or email..."
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
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">User</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Role</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Joined</th>
                  <th className="text-right px-5 py-3.5 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-soft)]">
                {filtered.map((user) => (
                  <tr key={user.id} className="hover:bg-[var(--surface-hover)] transition-colors duration-150">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-9 h-9 rounded-full bg-[var(--surface-accent-wash)] text-[var(--text-muted)] text-sm font-semibold shrink-0">
                          {(user.displayName || user.email).charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-sm text-[var(--text-strong)] truncate">
                            {user.displayName || "—"}
                            {user.id === profile?.id && (
                              <span className="ml-1.5 text-[10px] text-[var(--text-subtle)] font-normal">(you)</span>
                            )}
                          </p>
                          <p className="text-xs text-[var(--text-subtle)] truncate">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <Badge
                        variant={user.role === "admin" ? "default" : "secondary"}
                        className={user.role === "admin"
                          ? "bg-[var(--color-primary)] text-white text-[10px] uppercase tracking-wider font-semibold"
                          : "text-[10px] uppercase tracking-wider font-semibold"}
                      >
                        {user.role === "admin" && <Shield className="w-3 h-3 mr-1" />}
                        {user.role}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 text-sm text-[var(--text-muted)]">
                      {format(new Date(user.createdAt), "MMM d, yyyy")}
                    </td>
                    <td className="px-5 py-4 text-right">
                      {user.id === profile?.id ? (
                        <span className="text-xs text-[var(--text-subtle)]">Current user</span>
                      ) : (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" aria-label="User actions">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem
                              onClick={() => setConfirmUser(user)}
                              disabled={togglingId === user.id}
                            >
                              {user.role === "admin" ? (
                                <>
                                  <ShieldOff className="w-4 h-4 mr-2" />
                                  Demote to User
                                </>
                              ) : (
                                <>
                                  <Shield className="w-4 h-4 mr-2" />
                                  Promote to Admin
                                </>
                              )}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-5 py-12 text-center">
                      <UserCircle className="w-8 h-8 mx-auto text-[var(--text-subtle)] mb-2" />
                      <p className="text-sm text-[var(--text-muted)]">No users found.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={!!confirmUser} onOpenChange={(open) => !open && setConfirmUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmUser?.role === "admin" ? "Demote to User?" : "Promote to Admin?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmUser?.role === "admin"
                ? `This will remove admin privileges from ${confirmUser?.email}.`
                : `This will grant admin privileges to ${confirmUser?.email}.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => confirmUser && toggleRole(confirmUser)}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
