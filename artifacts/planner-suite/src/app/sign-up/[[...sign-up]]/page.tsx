"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { Mail, Eye, EyeOff, ArrowRight, ArrowLeft } from "lucide-react";

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
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-[480px] xl:w-[560px] relative overflow-hidden bg-[var(--color-primary)]">
        <div className="absolute inset-0 opacity-[0.07]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20" />
        <div className="relative z-10 flex flex-col justify-between p-10 text-white w-full">
          <div>
            <button onClick={() => router.push('/')} className="flex items-center gap-2 text-white/60 hover:text-white/90 transition-colors w-fit">
              <ArrowLeft className="w-4 h-4" />
              <img src="/logo-v2-white.webp" alt="One&Only" className="h-7" />
            </button>
          </div>
          <div className="space-y-6">
            <h2 className="text-3xl font-bold leading-tight tracking-tight">
              Plan spaces that<br />inspire great work.
            </h2>
            <p className="text-white/70 text-base leading-relaxed max-w-sm">
              Professional office planning tools with 2D layouts, 3D visualization, furniture catalogs, and client-ready exports.
            </p>
            <div className="flex items-center gap-6 pt-4">
              {[
                { num: "500+", label: "Furniture items" },
                { num: "50+", label: "Templates" },
                { num: "PDF/SVG", label: "Export" },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="text-xl font-bold">{stat.num}</div>
                  <div className="text-xs text-white/50 uppercase tracking-wider">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="text-xs text-white/30">
            &copy; {new Date().getFullYear()} One&Only. All rights reserved.
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center bg-page px-6">
        <div className="w-full max-w-[400px]">
          <div className="lg:hidden mb-8">
            <button onClick={() => router.push('/')} className="flex items-center gap-2 mb-4">
              <ArrowLeft className="w-4 h-4 text-[var(--text-muted)]" />
              <img src="/logo-v2-white.webp" alt="One&Only" className="h-7 invert" />
            </button>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-[var(--text-heading)] tracking-tight">
              {isSignIn ? "Welcome back" : "Create your account"}
            </h1>
            <p className="text-sm text-[var(--text-muted)] mt-1.5">
              {isSignIn ? "Sign in to continue to your workspace" : "Get started with your free account"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 mb-6">
            <div>
              <label htmlFor="email" className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider block mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-subtle)]" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  required
                  autoComplete="email"
                  className="w-full h-12 pl-11 pr-4 rounded-xl border border-[var(--border-soft)] bg-white text-sm text-[var(--text-body)] placeholder:text-[var(--text-subtle)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-all duration-200"
                />
              </div>
            </div>
            <div>
              <label htmlFor="password" className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider block mb-2">
                Password
              </label>
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
                  className="w-full h-12 pl-4 pr-12 rounded-xl border border-[var(--border-soft)] bg-white text-sm text-[var(--text-body)] placeholder:text-[var(--text-subtle)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-subtle)] hover:text-[var(--text-body)] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-100">
                <p className="text-xs text-red-600 leading-relaxed">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl bg-[var(--color-primary)] text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-lift)] hover:bg-[var(--color-primary-hover)] transition-all duration-200 disabled:opacity-50"
            >
              {loading
                ? (isSignIn ? "Signing in..." : "Creating account...")
                : (
                  <>
                    {isSignIn ? "Sign In" : "Create Account"}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )
              }
            </button>
          </form>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[var(--border-soft)]" />
            </div>
          </div>

          <p className="text-center text-sm text-[var(--text-muted)]">
            {isSignIn ? "Don't have an account? " : "Already have an account? "}
            <button onClick={toggleMode} className="text-[var(--color-primary)] font-semibold hover:underline underline-offset-2 transition-colors">
              {isSignIn ? "Sign up" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
