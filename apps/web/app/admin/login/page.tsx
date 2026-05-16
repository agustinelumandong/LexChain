"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setError(data?.message ?? "Login failed. Check your credentials.");
        return;
      }

      router.push("/admin/dashboard");
    } catch {
      setError("Unable to reach the server. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F5FAFF] p-5 text-[#111827]">
      <section className="w-full max-w-[440px] rounded-[24px] border border-[#E4EEF9] bg-white p-7 shadow-[0_10px_24px_rgba(12,43,73,0.08)]">
        <div className="space-y-2">
          <p className="text-sm font-black uppercase leading-5 text-[#0985E7]">LexChain</p>
          <h1 className="text-3xl font-black leading-9 text-[#0C2B49]">Super Admin Login</h1>
          <p className="text-sm font-semibold leading-5 text-[#64748b]">
            Sign in with your admin credentials.
          </p>
        </div>

        <form className="mt-6 space-y-3.5" onSubmit={handleSubmit}>
          <label className="block">
            <span className="text-[13px] font-black text-[#0C2B49]">Email</span>
            <input
              className="mt-2 min-h-12 w-full rounded-[14px] border border-[#E4EEF9] bg-[#F5FAFF] px-3.5 text-sm font-semibold text-[#0C2B49] outline-none focus:border-[#0985E7]"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label className="block">
            <span className="text-[13px] font-black text-[#0C2B49]">Password</span>
            <input
              className="mt-2 min-h-12 w-full rounded-[14px] border border-[#E4EEF9] bg-[#F5FAFF] px-3.5 text-sm font-semibold text-[#0C2B49] outline-none focus:border-[#0985E7]"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>

          {error && (
            <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 flex min-h-[52px] w-full items-center justify-center rounded-full bg-[#0985E7] px-5 py-3.5 text-[15px] font-black text-white transition hover:bg-[#0770c4] disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <Link
          className="mt-5 block text-center text-[13px] font-black text-[#0985E7]"
          href="/"
        >
          Return to LexChain
        </Link>
      </section>
    </main>
  );
}
