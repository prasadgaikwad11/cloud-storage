"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authAPI, Auth } from "@/lib/api";
import { toast } from "sonner";
import { Eye, EyeOff, User, Mail, Lock, ShieldCheck, Loader2 } from "lucide-react";

const perks = ["5 GB free storage", "AWS S3 backed", "End-to-end secure", "No credit card"];

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (Auth.isAuthenticated()) {
      router.replace("/dashboard");
    }
  }, [router]);

  // Password strength
  const strength = useMemo(() => {
    let s = 0;
    if (password.length >= 6) s++;
    if (password.length >= 10) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return s;
  }, [password]);

  const strengthConfig = [
    { label: "", color: "transparent", width: "0%" },
    { label: "Very Weak", color: "#ef4444", width: "20%" },
    { label: "Weak", color: "#f59e0b", width: "40%" },
    { label: "Fair", color: "#f59e0b", width: "60%" },
    { label: "Strong", color: "#10b981", width: "80%" },
    { label: "Very Strong", color: "#10b981", width: "100%" },
  ];

  const currentStrength = strengthConfig[Math.min(strength, 5)];

  const confirmMatch = useMemo(() => {
    if (!confirmPassword) return null;
    return password === confirmPassword;
  }, [password, confirmPassword]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !password || !confirmPassword) {
      toast.warning("Please fill in all fields.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      toast.warning("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const data = await authAPI.register({ name, email, password });
      Auth.setSession(data.token, data.user);
      toast.success("Account created! Welcome aboard 🎉");
      setTimeout(() => router.push("/dashboard"), 900);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Registration failed. Please try again.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-6">
      {/* Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_80%_50%,rgba(6,182,212,0.1),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_50%_at_20%_30%,rgba(99,102,241,0.1),transparent_60%)]" />
      </div>
      <div className="hero-grid-bg fixed inset-0 opacity-30" />

      <div className="relative z-10 w-full max-w-[480px]">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center justify-center gap-2.5 mb-8 no-underline"
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
          <h1 className="text-2xl font-extrabold mb-1.5">Create your account</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Get 5 GB free cloud storage — no credit card needed
          </p>

          {/* Perks */}
          <div className="flex flex-wrap gap-2 mb-6">
            {perks.map((p) => (
              <div
                key={p}
                className="flex items-center gap-1.5 text-xs text-muted-foreground"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-[#10b981] shrink-0" />
                {p}
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} noValidate>
            {/* Name */}
            <div className="mb-5">
              <Label htmlFor="name" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">
                Full Name
              </Label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <Input
                  type="text"
                  id="name"
                  placeholder="John Doe"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-11 h-12 bg-[#1a1d2e] border-border text-foreground placeholder:text-muted-foreground focus:border-[#6366f1] focus:ring-[rgba(99,102,241,0.25)]"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="mb-5">
              <Label htmlFor="email" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
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
              <Label htmlFor="password" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <Input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  placeholder="Min. 6 characters"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-11 pr-11 h-12 bg-[#1a1d2e] border-border text-foreground placeholder:text-muted-foreground focus:border-[#6366f1] focus:ring-[rgba(99,102,241,0.25)]"
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {/* Strength bar */}
              {password && (
                <div className="mt-2">
                  <div className="h-1 rounded-full bg-[#1a1d2e] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-400"
                      style={{
                        width: currentStrength.width,
                        background: currentStrength.color,
                      }}
                    />
                  </div>
                  <span
                    className="text-xs font-semibold mt-1 inline-block"
                    style={{ color: currentStrength.color }}
                  >
                    {currentStrength.label}
                  </span>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="mb-5">
              <Label htmlFor="confirm-password" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">
                Confirm Password
              </Label>
              <div className="relative">
                <ShieldCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <Input
                  type={showConfirm ? "text" : "password"}
                  id="confirm-password"
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-11 pr-11 h-12 bg-[#1a1d2e] border-border text-foreground placeholder:text-muted-foreground focus:border-[#6366f1] focus:ring-[rgba(99,102,241,0.25)]"
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                  onClick={() => setShowConfirm(!showConfirm)}
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {confirmMatch !== null && (
                <span
                  className="text-xs font-semibold mt-1 inline-block"
                  style={{ color: confirmMatch ? "#10b981" : "#ef4444" }}
                >
                  {confirmMatch ? "✓ Passwords match" : "✗ Passwords do not match"}
                </span>
              )}
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full justify-center mt-1 h-12 bg-gradient-to-br from-[#6366f1] to-[#4f46e5] text-white shadow-[0_4px_15px_rgba(99,102,241,0.25)] hover:shadow-[0_8px_25px_rgba(99,102,241,0.25)] transition-all"
              id="register-btn"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Creating account…
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          <div className="text-center mt-5 text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-[#818cf8] font-semibold hover:underline"
              id="go-login"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
