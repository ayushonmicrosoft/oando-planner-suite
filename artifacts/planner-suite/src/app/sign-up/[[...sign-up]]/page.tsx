"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Mail, Eye, EyeOff, LogIn, UserPlus } from "lucide-react";

export default function AuthPage() {
  const { signUpWithEmail, signInWithEmail } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "sign-up") {
        await signUpWithEmail(email, password);
      } else {
        await signInWithEmail(email, password);
      }
      router.push("/");
    } catch (err: any) {
      setError(err.message || (mode === "sign-up" ? "Failed to create account" : "Invalid email or password"));
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(mode === "sign-in" ? "sign-up" : "sign-in");
    setError("");
  };

  const isSignIn = mode === "sign-in";

  return (
    <div className="min-h-screen flex items-center justify-center bg-page">
      <div className="w-full max-w-sm mx-auto p-8 rounded-xl border border-soft bg-panel shadow-theme-panel">
        <div className="text-center mb-8">
          <img src="/logo-v2-white.webp" alt="One&Only" className="h-8 mx-auto mb-4 invert" />
          <h1 className="text-xl font-semibold text-strong">
            {isSignIn ? "Welcome back" : "Create your account"}
          </h1>
          <p className="text-sm text-muted mt-1">
            {isSignIn ? "Sign in to One&Only" : "Get started with One&Only"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 mb-4">
          <div>
            <label htmlFor="email" className="text-xs font-medium text-muted block mb-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
                autoComplete="email"
                className="w-full h-11 pl-10 pr-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
          <div>
            <label htmlFor="password" className="text-xs font-medium text-muted block mb-1">Password</label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isSignIn ? "Enter your password" : "Min 8 characters"}
                required
                minLength={isSignIn ? undefined : 8}
                autoComplete={isSignIn ? "current-password" : "new-password"}
                className="w-full h-11 pl-3 pr-10 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-xs text-destructive">{error}</p>
          )}

          <Button type="submit" className="w-full h-11 gap-2" disabled={loading}>
            {isSignIn ? (
              <LogIn className="w-4 h-4" />
            ) : (
              <UserPlus className="w-4 h-4" />
            )}
            {loading
              ? (isSignIn ? "Signing in..." : "Creating account...")
              : (isSignIn ? "Sign In" : "Create Account")
            }
          </Button>
        </form>

        <p className="text-center text-xs text-muted mt-6">
          {isSignIn ? "Don't have an account? " : "Already have an account? "}
          <button onClick={toggleMode} className="text-brand font-medium hover:underline">
            {isSignIn ? "Sign up" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
}
