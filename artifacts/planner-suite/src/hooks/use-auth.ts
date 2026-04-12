"use client";

import { useEffect, useState, useCallback } from "react";

type UserRole = "admin";
type PlanTier = "pro";

interface AuthUser {
  id: string;
  name: string;
  email: string;
  image: string | null;
  user_metadata?: Record<string, any>;
}

interface DbProfile {
  id: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  role: UserRole;
  planTier: PlanTier;
  subscriptionStatus: "active";
  currentPeriodEnd: string | null;
}

const DEFAULT_USER: AuthUser = {
  id: "admin-default",
  name: "Admin",
  email: "ayush@oando.co.in",
  image: null,
  user_metadata: { full_name: "Admin", name: "Admin" },
};

const DEFAULT_PROFILE: DbProfile = {
  id: "admin-default",
  email: "ayush@oando.co.in",
  displayName: "Admin",
  avatarUrl: null,
  role: "admin",
  planTier: "pro",
  subscriptionStatus: "active",
  currentPeriodEnd: null,
};

export function useAuth() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const signOut = useCallback(async () => {
    window.location.href = "/";
  }, []);

  const signInWithEmail = useCallback(async (_email: string, _password: string) => {}, []);
  const signUpWithEmail = useCallback(async (_email: string, _password: string) => {}, []);
  const signInWithProvider = useCallback(async (_provider: "google" | "azure" | "github") => {}, []);

  return {
    user: DEFAULT_USER,
    profile: DEFAULT_PROFILE,
    role: "admin" as UserRole,
    isAdmin: true,
    planTier: "pro" as PlanTier,
    isPro: true,
    isLoaded,
    profileLoaded: true,
    isSignedIn: true,
    signOut,
    signInWithProvider,
    signInWithEmail,
    signUpWithEmail,
  };
}
