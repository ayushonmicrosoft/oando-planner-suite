"use client";

import { useState, useCallback, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

export interface PlanVersion {
  id: number;
  planId: number;
  versionNumber: number;
  name: string;
  documentJson: string;
  thumbnailUrl: string | null;
  createdAt: string;
}

const BASE = "/api";

async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${url}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(init?.headers as Record<string, string> ?? {}) },
    ...init,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `HTTP ${res.status}`);
  }
  if (res.status === 204) return null as T;
  return res.json();
}

export function usePlanVersions(planId: number | null) {
  const [versions, setVersions] = useState<PlanVersion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const fetchVersions = useCallback(async () => {
    if (!planId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<PlanVersion[]>(`/plans/${planId}/versions`);
      setVersions(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [planId]);

  useEffect(() => {
    fetchVersions();
  }, [fetchVersions]);

  const createVersion = useCallback(
    async (name?: string, documentJson?: string, thumbnailUrl?: string) => {
      if (!planId) return null;
      try {
        const body: Record<string, string | undefined> = { name };
        if (documentJson) body.documentJson = documentJson;
        if (thumbnailUrl) body.thumbnailUrl = thumbnailUrl;
        const v = await apiFetch<PlanVersion>(`/plans/${planId}/versions`, {
          method: "POST",
          body: JSON.stringify(body),
        });
        setVersions((prev) => [v, ...prev]);
        return v;
      } catch (err: any) {
        setError(err.message);
        return null;
      }
    },
    [planId],
  );

  const restoreVersion = useCallback(
    async (versionId: number) => {
      if (!planId) return null;
      try {
        const plan = await apiFetch<any>(`/plans/${planId}/versions/${versionId}/restore`, {
          method: "POST",
        });
        await fetchVersions();
        queryClient.invalidateQueries({ queryKey: [`/api/plans/${planId}`] });
        return plan;
      } catch (err: any) {
        setError(err.message);
        return null;
      }
    },
    [planId, fetchVersions, queryClient],
  );

  const getVersion = useCallback(
    async (versionId: number) => {
      if (!planId) return null;
      try {
        return await apiFetch<PlanVersion>(`/plans/${planId}/versions/${versionId}`);
      } catch (err: any) {
        setError(err.message);
        return null;
      }
    },
    [planId],
  );

  return {
    versions,
    loading,
    error,
    createVersion,
    restoreVersion,
    getVersion,
    refetch: fetchVersions,
  };
}
