"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState, type ReactNode } from "react";
import { demoResetToken, webResetPasswordSchema } from "@/features/auth/schemas/auth";


export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const tokens = searchParams.getAll("token");
  const hashes = searchParams.getAll("token_hash");
  const types = searchParams.getAll("type");
  const isDemoMode = process.env.NEXT_PUBLIC_USE_MOCK_API === "true";
  const hasValidToken = isDemoMode ? tokens.length === 1 && tokens[0] === demoResetToken : hashes.length === 1 && hashes[0].length > 0 && types.length === 1 && types[0] === "recovery";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [linkSpent, setLinkSpent] = useState(false);

  if (!hasValidToken) {
    return (
      <ResetPasswordShell description="A valid reset link is required before you can update your password.">
        <div className="mt-6 space-y-4">
          <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            This password reset link is invalid or has expired.
          </p>
          <Link href="/login" className="flex min-h-[52px] w-full items-center justify-center rounded-full border-2 border-[#E4EEF9] px-5 py-3.5 text-[15px] font-black text-[#0C2B49] transition hover:bg-[#F5FAFF]">
            Back to sign in
          </Link>
        </div>
      </ResetPasswordShell>
    );
  }

  if (isComplete) {
    return (
      <ResetPasswordShell description={isDemoMode ? "This local demo checks the reset form without changing a real account password." : "Your password has been reset."}>
        <div className="mt-6 space-y-4">
          <p className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-black text-[#0C2B49]">
            {isDemoMode ? "Demo complete — no real password was changed." : "Your password has been updated. Please sign in."}
          </p>
          <Link href="/login" className="flex min-h-[52px] w-full items-center justify-center rounded-full bg-[#0067B3] px-5 py-3.5 text-[15px] font-black text-white transition hover:bg-[#005F9E]">
            Back to sign in
          </Link>
        </div>
      </ResetPasswordShell>
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = webResetPasswordSchema.safeParse({ password, confirmPassword });

    if (!parsed.success) {
      setErrors(parsed.error.issues.map((issue) => issue.message));
      return;
    }

    setErrors([]);
    if (isDemoMode) {
      setIsComplete(true);
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/auth/password-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token_hash: hashes[0], new_password: password }),
      });
      if (response.ok) {
        setIsComplete(true);
      } else if (response.status === 422) {
        setErrors(["The password does not meet the password policy. Please check it and try again."]);
      } else if (response.status === 429) {
        setErrors(["Too many requests. Please wait before trying again."]);
      } else {
        setLinkSpent(true);
      }
    } catch {
      setLinkSpent(true);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (linkSpent) {
    return (
      <ResetPasswordShell description="Your reset could not be completed.">
        <p role="alert" className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">This link may no longer work. Please request a new reset link.</p>
        <Link href="/forgot-password" className="mt-4 flex min-h-[52px] items-center justify-center rounded-full bg-[#0067B3] px-5 text-white">Request a new link</Link>
      </ResetPasswordShell>
    );
  }

  return (
    <ResetPasswordShell description={isDemoMode ? "Try the password reset form in this local demo. Submitting it will not change a real account password." : "Choose a new password for your account."}>
      <form noValidate className="mt-6 space-y-3.5" onSubmit={handleSubmit}>
        <label className="block">
          <span className="text-[13px] font-black text-[#0C2B49]">New password</span>
          <input
            className="mt-2 min-h-12 w-full rounded-[14px] border border-[#E4EEF9] bg-[#F5FAFF] px-3.5 text-sm font-semibold text-[#0C2B49] outline-none focus:border-[#0067B3]"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>
        <label className="block">
          <span className="text-[13px] font-black text-[#0C2B49]">Confirm new password</span>
          <input
            className="mt-2 min-h-12 w-full rounded-[14px] border border-[#E4EEF9] bg-[#F5FAFF] px-3.5 text-sm font-semibold text-[#0C2B49] outline-none focus:border-[#0067B3]"
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
          />
        </label>
        {errors.length > 0 && (
          <ul role="alert" className="rounded-xl bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700">
            {errors.map((error) => <li key={error}>{error}</li>)}
          </ul>
        )}
        <button type="submit" disabled={isSubmitting} className="mt-2 flex min-h-[52px] w-full items-center justify-center rounded-full bg-[#0067B3] px-5 py-3.5 text-[15px] font-black text-white transition hover:bg-[#005F9E]">
          {isSubmitting ? "Resetting…" : "Reset password"}
        </button>
      </form>
    </ResetPasswordShell>
  );
}

function ResetPasswordShell({ children, description }: { children: ReactNode; description: string }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F5FAFF] p-5 text-[#111827]">
      <section className="w-full max-w-[440px] rounded-[24px] border border-[#E4EEF9] bg-white p-7 shadow-[0_10px_24px_rgba(12,43,73,0.08)]">
        <div className="space-y-2">
          <div className="mb-1 flex items-center gap-2">
            <Image src="/lexchain/logo-lexchain.svg" alt="LexChain" width={36} height={36} className="rounded-[10px]" />
            <span className="text-lg font-black text-[#0C2B49]">Lex<span className="text-[#0067B3]">Chain</span></span>
          </div>
          <h1 className="text-3xl font-black leading-9 text-[#0C2B49]">Reset password</h1>
          <p className="text-sm font-semibold leading-5 text-[#5B6F8A]">{description}</p>
        </div>
        {children}
      </section>
    </main>
  );
}
