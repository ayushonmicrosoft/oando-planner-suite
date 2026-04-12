"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { Mail, Eye, EyeOff, LogIn, UserPlus, ArrowLeft } from "lucide-react";

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
    <div className="min-h-screen bg-[#070D12] flex">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-[#070D12] to-cyan-600/10" />
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 30% 40%, rgba(84,136,182,0.15) 0%, transparent 60%), radial-gradient(circle at 70% 80%, rgba(119,162,201,0.1) 0%, transparent 50%)' }} />

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <button onClick={() => router.push('/')} className="flex items-center gap-2 text-white/40 hover:text-white/70 transition-colors w-fit">
            <ArrowLeft className="w-4 h-4" />
            <img src="/logo-v2-white.webp" alt="One&Only" className="h-5 w-auto" />
          </button>

          <div className="max-w-md">
            <h2 className="text-4xl font-bold tracking-[-0.03em] text-white leading-[1.15] mb-4">
              Design your
              <br />
              <span className="bg-gradient-to-r from-[#5488B6] to-[#77A2C9] bg-clip-text text-transparent">perfect workspace</span>
            </h2>
            <p className="text-[15px] text-white/35 leading-relaxed">
              Professional-grade office planning tools. From 2D floor plans to 3D walkthroughs — everything you need in one platform.
            </p>
          </div>

          <div className="flex items-center gap-6 text-[12px] text-white/20">
            <span>2D Canvas</span>
            <span className="w-1 h-1 rounded-full bg-white/10" />
            <span>Blueprint Wizard</span>
            <span className="w-1 h-1 rounded-full bg-white/10" />
            <span>3D Viewer</span>
            <span className="w-1 h-1 rounded-full bg-white/10" />
            <span>CAD Tools</span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-[380px]">
          <div className="lg:hidden mb-8">
            <button onClick={() => router.push('/')} className="flex items-center gap-2 text-white/40 hover:text-white/70 transition-colors mb-6">
              <ArrowLeft className="w-4 h-4" />
              <img src="/logo-v2-white.webp" alt="One&Only" className="h-5 w-auto" />
            </button>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-[-0.03em] text-white mb-1.5">
              {isSignIn ? "Welcome back" : "Create your account"}
            </h1>
            <p className="text-[14px] text-white/35">
              {isSignIn ? "Sign in to continue to One&Only" : "Get started with One&Only for free"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 mb-6">
            <div>
              <label htmlFor="email" className="text-[12px] font-medium text-white/40 uppercase tracking-[0.08em] block mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  required
                  autoComplete="email"
                  className="w-full h-12 pl-11 pr-4 rounded-xl border border-white/[0.08] bg-white/[0.03] text-[14px] text-white placeholder:text-white/20 focus:outline-none focus:border-[#5488B6]/50 focus:bg-white/[0.05] transition-all"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="text-[12px] font-medium text-white/40 uppercase tracking-[0.08em] block mb-2">Password</label>
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
                  className="w-full h-12 pl-4 pr-12 rounded-xl border border-white/[0.08] bg-white/[0.03] text-[14px] text-white placeholder:text-white/20 focus:outline-none focus:border-[#5488B6]/50 focus:bg-white/[0.05] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3">
                <p className="text-[13px] text-red-400">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl bg-white text-[#0B1324] font-semibold text-[14px] hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {isSignIn ? (
                <LogIn className="w-4 h-4" />
              ) : (
                <UserPlus className="w-4 h-4" />
              )}
              {loading
                ? (isSignIn ? "Signing in..." : "Creating account...")
                : (isSignIn ? "Sign In" : "Create Account")
              }
            </button>
          </form>

          <p className="text-center text-[13px] text-white/30">
            {isSignIn ? "Don't have an account? " : "Already have an account? "}
            <button onClick={toggleMode} className="text-[#77A2C9] font-medium hover:text-[#5488B6] transition-colors">
              {isSignIn ? "Sign up" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
