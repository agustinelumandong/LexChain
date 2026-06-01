"use client";

import Image from 'next/image';
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSent, setHasSent] = useState(false);
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (!hasSent) return;
    if (countdown === 0) { router.push("/login"); return; }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [hasSent, countdown, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email.trim())) {
      toast.warning("Enter a valid email address");
      return;
    }
    setIsSubmitting(true);
    await fetch("/api/portal/signup", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: email.trim(), action: "reset_password" }) }).catch(() => {});
    setIsSubmitting(false);
    setHasSent(true);
    toast.success("Reset link sent");
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F5FAFF] p-5 text-[#111827]">
      <section className="w-full max-w-[440px] rounded-[24px] border border-[#E4EEF9] bg-white p-7 shadow-[0_10px_24px_rgba(12,43,73,0.08)]">
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-1">
            <Image src="/lexchain/logo-lexchain.svg" alt="LexChain" width={36} height={36} className="rounded-[10px]" />
            <span className="text-lg font-black text-[#0C2B49]">Lex<span className="text-[#0985E7]">Chain</span></span>
          </div>
          <h1 className="text-3xl font-black leading-9 text-[#0C2B49]">Forgot password?</h1>
          <p className="text-sm font-semibold leading-5 text-[#64748b]">
            Enter account email and we will send reset instructions.
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
              onChange={(e) => { setEmail(e.target.value); setHasSent(false); }}
            />
          </label>

          {hasSent && (
            <div className="rounded-xl bg-green-50 px-4 py-3 border border-green-200">
              <p className="text-sm font-black text-[#0C2B49]">Reset email sent</p>
              <p className="text-xs font-semibold text-[#64748b] mt-1">Check your inbox and spam folder.</p>
              <p className="text-xs font-semibold text-[#64748b] mt-1">Returning to sign in in {countdown}s.</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || hasSent}
            className="mt-2 flex min-h-[52px] w-full items-center justify-center rounded-full bg-[#0985E7] px-5 py-3.5 text-[15px] font-black text-white transition hover:bg-[#0770c4] disabled:opacity-60"
          >
            {isSubmitting ? "Sending…" : "Send reset link"}
          </button>

          <Link
            href="/login"
            className="flex min-h-[52px] w-full items-center justify-center rounded-full border-2 border-[#E4EEF9] px-5 py-3.5 text-[15px] font-black text-[#0C2B49] transition hover:bg-[#F5FAFF]"
          >
            Back to sign in
          </Link>
        </form>
      </section>
    </main>
  );
}
