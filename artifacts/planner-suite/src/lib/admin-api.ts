"use client";

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
  const res = await fetch(`${apiBase()}/admin/stats`, { credentials: "include" });
  return handleResponse(res);
}

export async function adminGetUsers() {
  const res = await fetch(`${apiBase()}/admin/users`, { credentials: "include" });
  return handleResponse(res);
}

export async function adminUpdateUserRole(userId: string, role: "user" | "admin") {
  const res = await fetch(`${apiBase()}/admin/users/${userId}/role`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ role }),
  });
  return handleResponse(res);
}

export async function adminCreateCatalogItem(data: Record<string, unknown>) {
  const res = await fetch(`${apiBase()}/admin/catalog`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function adminUpdateCatalogItem(id: string, data: Record<string, unknown>) {
  const res = await fetch(`${apiBase()}/admin/catalog/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function adminDeleteCatalogItem(id: string) {
  const res = await fetch(`${apiBase()}/admin/catalog/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  return handleResponse(res);
}

export async function adminUpdateTemplate(id: string, data: Record<string, unknown>) {
  const res = await fetch(`${apiBase()}/admin/templates/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function adminDeleteTemplate(id: string) {
  const res = await fetch(`${apiBase()}/admin/templates/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  return handleResponse(res);
}

export async function adminUploadFile(
  file: File,
  uploadType: "image" | "model"
): Promise<{ url: string; fileName: string; originalName: string; size: number; type: string }> {
  const buffer = await file.arrayBuffer();
  const base64 = btoa(
    new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), "")
  );

  const res = await fetch(`${apiBase()}/admin/upload`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      fileName: file.name,
      fileData: base64,
      fileType: file.type,
      uploadType,
    }),
  });
  return handleResponse(res);
}
