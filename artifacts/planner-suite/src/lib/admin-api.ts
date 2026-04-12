"use client";

import { createClient } from "@/lib/supabase/client";

async function getAuthHeaders(): Promise<Record<string, string>> {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) throw new Error("Not authenticated");
  return {
    "Authorization": `Bearer ${session.access_token}`,
    "Content-Type": "application/json",
  };
}

function apiBase(): string {
  return typeof window !== "undefined" ? `${window.location.origin}/api` : "/api";
}

async function handleResponse(res: Response) {
  if (res.status === 204) return null;
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

export async function adminGetStats() {
  const headers = await getAuthHeaders();
  const res = await fetch(`${apiBase()}/admin/stats`, { headers });
  return handleResponse(res);
}

export async function adminGetUsers() {
  const headers = await getAuthHeaders();
  const res = await fetch(`${apiBase()}/admin/users`, { headers });
  return handleResponse(res);
}

export async function adminUpdateUserRole(userId: string, role: "user" | "admin") {
  const headers = await getAuthHeaders();
  const res = await fetch(`${apiBase()}/admin/users/${userId}/role`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({ role }),
  });
  return handleResponse(res);
}

export async function adminCreateCatalogItem(data: Record<string, unknown>) {
  const headers = await getAuthHeaders();
  const res = await fetch(`${apiBase()}/admin/catalog`, {
    method: "POST",
    headers,
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function adminUpdateCatalogItem(id: string, data: Record<string, unknown>) {
  const headers = await getAuthHeaders();
  const res = await fetch(`${apiBase()}/admin/catalog/${id}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function adminDeleteCatalogItem(id: string) {
  const headers = await getAuthHeaders();
  const res = await fetch(`${apiBase()}/admin/catalog/${id}`, {
    method: "DELETE",
    headers,
  });
  return handleResponse(res);
}

export async function adminUpdateTemplate(id: string, data: Record<string, unknown>) {
  const headers = await getAuthHeaders();
  const res = await fetch(`${apiBase()}/admin/templates/${id}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function adminDeleteTemplate(id: string) {
  const headers = await getAuthHeaders();
  const res = await fetch(`${apiBase()}/admin/templates/${id}`, {
    method: "DELETE",
    headers,
  });
  return handleResponse(res);
}
