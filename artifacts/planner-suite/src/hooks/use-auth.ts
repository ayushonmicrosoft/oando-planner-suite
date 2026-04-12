"use client";

import { useEffect, useState, useCallback } from "react";
import { authClient } from "@/lib/auth-client";

type UserRole = "user" | "admin";
type PlanTier = "free" | "pro";
type SubscriptionStatus = "active" | "cancelled" | "past_due" | "expired" | "pending" | null;

interface AuthUser {
  id: string;
  name: string;
  email: string;
  image: string | null;
}

interface DbProfile {
  id: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  role: UserRole;
  planTier: PlanTier;
  subscriptionStatus: SubscriptionStatus;
  currentPeriodEnd: string | null;
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<DbProfile | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);

  const syncAndFetchProfile = useCallback(async () => {
    try {
      const apiBase = typeof window !== "undefined"
        ? `${window.location.origin}/api`
        : "/api";

      await fetch(`${apiBase}/users/sync`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      const res = await fetch(`${apiBase}/users/me`, {
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        setProfile(data);
      }
    } catch {
    } finally {
      setProfileLoaded(true);
    }
  }, []);

  useEffect(() => {
    async function loadSession() {
      try {
        const { data } = await authClient.getSession();
        if (data?.user) {
          setUser(data.user as AuthUser);
          setIsLoaded(true);
          await syncAndFetchProfile();
        } else {
          setUser(null);
          setIsLoaded(true);
          setProfileLoaded(true);
        }
      } catch {
        setUser(null);
        setIsLoaded(true);
        setProfileLoaded(true);
      }
    }
    loadSession();
  }, [syncAndFetchProfile]);

  const signOut = useCallback(async () => {
    await authClient.signOut();
    setUser(null);
    setProfile(null);
    window.location.href = "/";
  }, []);

  const signInWithEmail = useCallback(
    async (email: string, password: string) => {
      const { data, error } = await authClient.signIn.email({ email, password });
      if (error) throw new Error(error.message || "Invalid email or password");
      if (data?.user) {
        setUser(data.user as AuthUser);
        await syncAndFetchProfile();
      }
    },
    [syncAndFetchProfile]
  );

  const signUpWithEmail = useCallback(
    async (email: string, password: string) => {
      const { data, error } = await authClient.signUp.email({
        email,
        password,
        name: email.split("@")[0],
      });
      if (error) throw new Error(error.message || "Failed to create account");
      if (data?.user) {
        setUser(data.user as AuthUser);
        await syncAndFetchProfile();
      }
    },
    [syncAndFetchProfile]
  );

  const signInWithProvider = useCallback(
    async (provider: "google" | "azure" | "github") => {
      const providerMap: Record<string, string> = {
        google: "google",
        azure: "microsoft",
        github: "github",
      };
      await authClient.signIn.social({
        provider: providerMap[provider] as any,
        callbackURL: "/",
      });
    },
    []
  );

  return {
    user,
    profile,
    role: profile?.role ?? "user",
    isAdmin: profile?.role === "admin",
    planTier: (profile?.planTier ?? "free") as PlanTier,
    isPro: profile?.planTier === "pro" &&
      (profile?.subscriptionStatus === "active" ||
        (profile?.subscriptionStatus === "cancelled" &&
          profile?.currentPeriodEnd != null &&
          new Date(profile.currentPeriodEnd) > new Date())),
    isLoaded,
    profileLoaded,
    isSignedIn: !!user,
    signOut,
    signInWithProvider,
    signInWithEmail,
    signUpWithEmail,
  };
}
