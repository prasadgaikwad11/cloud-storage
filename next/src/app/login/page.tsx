"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authAPI, Auth } from "@/lib/api";
import { toast } from "sonner";
import { Eye, EyeOff, AtSign, Lock, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (Auth.isAuthenticated()) {
      router.replace("/dashboard");
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.warning("Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      const data = await authAPI.login({ email, password });
      Auth.setSession(data.token, data.user);
      toast.success("Welcome back! Redirecting…");
      setTimeout(() => router.push("/dashboard"), 800);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Login failed. Please try again.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-6">
      {/* Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_20%_50%,rgba(99,102,241,0.12),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_50%_at_80%_20%,rgba(6,182,212,0.08),transparent_60%)]" />
      </div>
      <div className="hero-grid-bg fixed inset-0 opacity-30" />

      <div className="relative z-10 w-full max-w-[460px]">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center justify-center gap-2.5 mb-9 no-underline"
          id="back-to-home"
        >
          <div className="w-[42px] h-[42px] bg-gradient-to-br from-[#6366f1] to-[#06b6d4] rounded-xl flex items-center justify-center text-xl">
            ☁️
          </div>
          <span className="text-xl font-extrabold gradient-text">
            CloudVault
          </span>
        </Link>

        {/* Card */}
        <div className="bg-card border border-border rounded-3xl p-8 sm:p-10 shadow-[0_10px_40px_rgba(0,0,0,0.5)] animate-slide-up">
          <h1 className="text-2xl font-extrabold mb-1.5">Welcome back</h1>
          <p className="text-sm text-muted-foreground mb-8">
            Sign in to access your cloud storage
          </p>

          <form onSubmit={handleSubmit} noValidate>
            {/* Email */}
            <div className="mb-5">
              <Label
                htmlFor="email"
                className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block"
              >
                Email Address
              </Label>
              <div className="relative">
                <AtSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <Input
                  type="email"
                  id="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-11 h-12 bg-[#1a1d2e] border-border text-foreground placeholder:text-muted-foreground focus:border-[#6366f1] focus:ring-[rgba(99,102,241,0.25)]"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="mb-5">
              <div className="flex justify-between items-center mb-1.5">
                <Label
                  htmlFor="password"
                  className="text-xs font-semibold text-muted-foreground uppercase tracking-wide"
                >
                  Password
                </Label>
                <span className="text-xs text-muted-foreground cursor-pointer hover:text-[#818cf8] transition-colors">
                  Forgot password?
                </span>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <Input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-11 pr-11 h-12 bg-[#1a1d2e] border-border text-foreground placeholder:text-muted-foreground focus:border-[#6366f1] focus:ring-[rgba(99,102,241,0.25)]"
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                  onClick={() => setShowPassword(!showPassword)}
                  id="toggle-pw-btn"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full justify-center mt-2 h-12 bg-gradient-to-br from-[#6366f1] to-[#4f46e5] text-white shadow-[0_4px_15px_rgba(99,102,241,0.25)] hover:shadow-[0_8px_25px_rgba(99,102,241,0.25)] transition-all"
              id="login-btn"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Signing in…
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-border" />
            <span className="text-sm text-muted-foreground">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <div className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="text-[#818cf8] font-semibold hover:underline"
              id="go-register"
            >
              Create one free
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
