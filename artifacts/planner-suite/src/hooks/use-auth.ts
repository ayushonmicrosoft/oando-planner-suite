"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

type UserRole = "user" | "admin";

interface DbProfile {
  id: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  role: UserRole;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<DbProfile | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const supabase = createClient();

  const syncAndFetchProfile = useCallback(async (session: { access_token: string } | null) => {
    if (!session) {
      setProfile(null);
      setProfileLoaded(true);
      return;
    }

    try {
      const apiBase = typeof window !== "undefined"
        ? `${window.location.origin}/api`
        : "/api";

      await fetch(`${apiBase}/users/sync`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
      });

      const res = await fetch(`${apiBase}/users/me`, {
        headers: { "Authorization": `Bearer ${session.access_token}` },
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
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setIsLoaded(true);
      if (!session) {
        setProfileLoaded(true);
      }
      syncAndFetchProfile(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setIsLoaded(true);
      syncAndFetchProfile(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setProfile(null);
    window.location.href = "/";
  }, []);

  const signInWithProvider = useCallback(
    async (provider: "google" | "azure" | "github") => {
      const redirectTo = `${window.location.origin}/auth/callback`;
      await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo },
      });
    },
    []
  );

  const signInWithEmail = useCallback(
    async (email: string, password: string) => {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    },
    []
  );

  const signUpWithEmail = useCallback(
    async (email: string, password: string) => {
      const redirectTo = `${window.location.origin}/auth/callback`;
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: redirectTo },
      });
      if (error) throw error;
    },
    []
  );

  return {
    user,
    profile,
    role: profile?.role ?? "user",
    isAdmin: profile?.role === "admin",
    isLoaded,
    profileLoaded,
    isSignedIn: !!user,
    signOut,
    signInWithProvider,
    signInWithEmail,
    signUpWithEmail,
  };
}
