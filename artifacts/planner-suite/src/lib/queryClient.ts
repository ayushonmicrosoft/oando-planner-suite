import { QueryClient, QueryCache, MutationCache } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import React from "react";

interface ApiErrorShape {
  status: number;
  data?: { error?: string } | null;
}

function isApiError(err: unknown): err is Error & ApiErrorShape {
  return (
    err instanceof Error &&
    "status" in err &&
    typeof (err as Record<string, unknown>).status === "number"
  );
}

function isUnauthorizedError(error: unknown): boolean {
  return isApiError(error) && error.status === 401;
}

function handleUnauthorized(error: unknown) {
  if (isUnauthorizedError(error)) {
    const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");
    const signInPath = `${basePath}/sign-in`;
    if (!window.location.pathname.startsWith(signInPath)) {
      window.location.href = signInPath;
    }
  }
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    if (error.message.includes("Failed to fetch") || error.message.includes("NetworkError")) {
      return "Network error. Please check your connection and try again.";
    }
    if (isApiError(error)) {
      if (error.status >= 500) return "Server error. Please try again later.";
      if (error.status === 404) return "The requested resource was not found.";
      if (error.status === 400) {
        const data = error.data;
        if (data && typeof data === "object" && "error" in data && typeof data.error === "string") {
          return data.error;
        }
        return "Invalid request.";
      }
    }
    return error.message;
  }
  return "An unexpected error occurred.";
}

function makeRetryAction(retryFn: () => void) {
  return React.createElement(ToastAction, { altText: "Retry", onClick: retryFn }, "Retry") as any;
}

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      handleUnauthorized(error);
      if (!isUnauthorizedError(error)) {
        toast({
          variant: "destructive",
          title: query.state.data !== undefined ? "Background refresh failed" : "Failed to load data",
          description: getErrorMessage(error),
          action: makeRetryAction(() => query.fetch()),
        });
      }
    },
  }),
  mutationCache: new MutationCache({
    onError: (error) => {
      handleUnauthorized(error);
      if (!isUnauthorizedError(error)) {
        toast({
          variant: "destructive",
          title: "Action failed",
          description: getErrorMessage(error),
        });
      }
    },
  }),
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
});
