"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Auth } from "@/lib/api";
import {
  ArrowRight,
  Lock,
  Cloud,
  Upload,
  Search,
  BarChart3,
  Smartphone,
} from "lucide-react";

const features = [
  {
    icon: <Lock className="w-6 h-6" />,
    title: "Secure Authentication",
    desc: "JWT-based authentication with bcrypt password hashing. Your data stays private and protected at all times.",
  },
  {
    icon: <Cloud className="w-6 h-6" />,
    title: "AWS S3 Storage",
    desc: "Files stored directly in AWS S3 with pre-signed URLs for secure downloads. Industry-leading 99.999999999% durability.",
  },
  {
    icon: <Upload className="w-6 h-6" />,
    title: "Drag & Drop Upload",
    desc: "Upload up to 10 files at once (max 100MB each) with real-time progress tracking and instant feedback.",
  },
  {
    icon: <Search className="w-6 h-6" />,
    title: "Smart Search",
    desc: "Find any file instantly with real-time search filtering. Filter by type — images, videos, documents, and more.",
  },
  {
    icon: <BarChart3 className="w-6 h-6" />,
    title: "Storage Analytics",
    desc: "Visual storage usage breakdown with category stats, recent uploads timeline, and file count by type.",
  },
  {
    icon: <Smartphone className="w-6 h-6" />,
    title: "Fully Responsive",
    desc: "Works beautifully on any device — desktop, tablet, or mobile — with an adaptive layout and touch support.",
  },
];

const stats = [
  { value: "100MB", label: "Max File Size" },
  { value: "5GB", label: "Free Storage" },
  { value: "AWS S3", label: "Cloud Backend" },
  { value: "JWT", label: "Secure Auth" },
];

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    if (Auth.isAuthenticated()) {
      router.replace("/dashboard");
    }
  }, [router]);

  return (
    <div className="relative">
      {/* ── Nav ──────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 md:px-12 py-4 flex items-center justify-between bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-[10px] bg-gradient-to-br from-[#6366f1] to-[#06b6d4] flex items-center justify-center text-base">
            ☁️
          </div>
          <span className="text-lg font-extrabold gradient-text">
            CloudVault
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="secondary" size="sm" id="nav-login-btn">
              Sign In
            </Button>
          </Link>
          <Link href="/register">
            <Button size="sm" className="bg-gradient-to-br from-[#6366f1] to-[#4f46e5] text-white shadow-[0_4px_15px_rgba(99,102,241,0.25)] hover:shadow-[0_8px_25px_rgba(99,102,241,0.25)] hover:-translate-y-0.5 transition-all" id="nav-register-btn">
              Get Started
            </Button>
          </Link>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="min-h-screen flex items-center justify-center text-center px-6 pt-28 pb-20 relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(99,102,241,0.18),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_30%_at_80%_80%,rgba(6,182,212,0.1),transparent_60%)]" />
        </div>
        <div className="hero-grid-bg absolute inset-0 opacity-40" />

        <div className="relative max-w-[800px] mx-auto">
          <div className="inline-flex items-center gap-2 bg-[rgba(99,102,241,0.25)] border border-[rgba(99,102,241,0.3)] rounded-full px-5 py-1.5 text-sm font-semibold text-[#818cf8] mb-7 animate-fade-in">
            <span>🚀</span>
            <span>Powered by AWS S3 &amp; MongoDB</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-[1.1] mb-6 animate-slide-up">
            Your Files.
            <br />
            <span className="gradient-text">Always in the Cloud.</span>
          </h1>

          <p className="text-base md:text-lg text-muted-foreground max-w-[560px] mx-auto mb-10 animate-slide-up [animation-delay:100ms]">
            Store, manage, and access all your files from anywhere.
            Enterprise-grade security with a beautiful, intuitive interface.
          </p>

          <div className="flex gap-3.5 justify-center flex-wrap animate-slide-up [animation-delay:200ms]">
            <Link href="/register">
              <Button
                size="lg"
                className="bg-gradient-to-br from-[#6366f1] to-[#4f46e5] text-white shadow-[0_4px_15px_rgba(99,102,241,0.25)] hover:shadow-[0_8px_25px_rgba(99,102,241,0.25)] hover:-translate-y-0.5 transition-all px-8 py-4 text-base rounded-2xl"
                id="hero-register-btn"
              >
                Start Free Today
                <ArrowRight className="w-4.5 h-4.5 ml-1" />
              </Button>
            </Link>
            <Link href="/login">
              <Button
                variant="outline"
                size="lg"
                className="border-[#6366f1] text-[#818cf8] hover:bg-[rgba(99,102,241,0.25)] px-8 py-4 text-base rounded-2xl transition-all hover:-translate-y-0.5"
                id="hero-login-btn"
              >
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats Strip ──────────────────────────────────────── */}
      <div className="flex justify-center gap-12 md:gap-16 flex-wrap py-14 border-y border-border">
        {stats.map((s) => (
          <div key={s.label} className="text-center">
            <div className="text-3xl md:text-4xl font-black gradient-text">
              {s.value}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* ── Features ─────────────────────────────────────────── */}
      <section className="py-24 px-6 max-w-[1400px] mx-auto">
        <div className="text-center">
          <span className="inline-block bg-[rgba(99,102,241,0.25)] border border-[rgba(99,102,241,0.25)] rounded-full px-3.5 py-1 text-xs font-bold text-[#818cf8] uppercase tracking-wider mb-4">
            Features
          </span>
          <h2 className="text-2xl md:text-3xl font-bold">
            Everything you need to manage files
          </h2>
          <p className="max-w-[520px] mx-auto mt-3 text-muted-foreground">
            A complete cloud storage solution built with modern technologies for
            performance and security.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
          {features.map((f) => (
            <div
              key={f.title}
              className="group bg-card border border-border rounded-3xl p-8 transition-all duration-300 relative overflow-hidden hover:-translate-y-1.5 hover:border-[rgba(255,255,255,0.15)] hover:shadow-[0_10px_40px_rgba(0,0,0,0.5)]"
            >
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#6366f1] to-[#06b6d4] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
              <div className="w-14 h-14 bg-[rgba(99,102,241,0.25)] border border-[rgba(99,102,241,0.2)] rounded-2xl flex items-center justify-center mb-5 text-[#818cf8]">
                {f.icon}
              </div>
              <h3 className="text-base font-bold mb-2.5">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="py-20 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_70%_at_50%_50%,rgba(99,102,241,0.12),transparent)]" />
        <div className="relative max-w-[600px] mx-auto bg-card border border-[rgba(99,102,241,0.25)] rounded-3xl p-12 md:p-16 shadow-[0_0_30px_rgba(99,102,241,0.2)]">
          <div className="text-5xl mb-5">☁️</div>
          <h2 className="text-2xl font-bold mb-3">Start storing for free</h2>
          <p className="text-muted-foreground mb-8">
            Join thousands of users who trust CloudVault for secure cloud file
            storage. No credit card required.
          </p>
          <Link href="/register" className="block">
            <Button
              size="lg"
              className="w-full bg-gradient-to-br from-[#6366f1] to-[#4f46e5] text-white shadow-[0_4px_15px_rgba(99,102,241,0.25)] hover:shadow-[0_8px_25px_rgba(99,102,241,0.25)] justify-center py-4 text-base rounded-2xl transition-all hover:-translate-y-0.5"
              id="cta-register-btn"
            >
              Create Free Account
            </Button>
          </Link>
          <p className="mt-4 text-xs text-muted-foreground">
            5 GB free storage • No credit card required
          </p>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer className="py-8 px-6 md:px-12 border-t border-border flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-[10px] bg-gradient-to-br from-[#6366f1] to-[#06b6d4] flex items-center justify-center text-sm">
            ☁️
          </div>
          <span className="text-sm font-extrabold gradient-text">
            CloudVault
          </span>
        </div>
        <p className="text-sm text-muted-foreground">
          © 2024 CloudVault. Cloud Based File Storage System.
        </p>
        <div className="flex gap-4">
          <Link
            href="/login"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Register
          </Link>
        </div>
      </footer>
    </div>
  );
}
