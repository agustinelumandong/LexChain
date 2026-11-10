"use client";

import Image from "next/image";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import { getPortalLoginRedirect } from "@/features/access";
import { AuthenticatorCodeInput } from "@/features/auth/components/authenticator-code-input";
import { queueNextNavigationToast } from "@/shared/utils/next-navigation-toast";

async function signIn(data: { email: string; password: string; rememberMe: boolean }) {
  const res = await fetch("/api/auth", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    credentials: "same-origin",
  });
  const payload = await res.json().catch(() => null);
  if (!res.ok) {
    const error = new Error(payload?.message ?? "Login failed. Check your credentials.");
    if (res.status === 401 && /^invalid credentials\.?$/i.test(error.message)) error.name = "InvalidCredentials";
    throw error;
  }
  return payload;
}

async function postMfa(path: string, body?: object) {
  const response = await fetch(`/api/auth/mfa/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    ...(body ? { body: JSON.stringify(body) } : {}),
    credentials: "same-origin",
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) throw new Error(typeof payload?.message === "string" ? payload.message : "Something went wrong. Please try again.");
  return payload;
}

function decodeJwtRole(token?: string): string {
  if (!token) return "";
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return String(payload.role ?? payload.user_role ?? payload.user_metadata?.role ?? payload.app_metadata?.role ?? "");
  } catch { return ""; }
}

export function getRedirectPath(data: Record<string, unknown> | null): string {
  if (!data) return "/login";
  const user = (data.user as Record<string, unknown>) ?? data;
  const role = String(
    user.role ??
    (user.user_metadata as Record<string, unknown> | undefined)?.role ??
    (user.app_metadata as Record<string, unknown> | undefined)?.role ??
    user.user_role ??
    decodeJwtRole(data.access_token as string) ??
    ""
  ).toLowerCase();
  return getPortalLoginRedirect(role) ?? "/login";
}

export function getPostLoginPath(data: Record<string, unknown> | null, returnPath?: string): string {
  const destination = getRedirectPath(data);
  return returnPath && destination !== "/login" ? returnPath : destination;
}

const SESSION_ENDED_MESSAGE = "Your session ended. Sign in to return to where you were. Unsaved changes were not kept.";
const SESSION_ENDED_TOAST_MS = 10_000;

export default function LoginPage({ sessionExpired = false, returnPath }: { sessionExpired?: boolean; returnPath?: string } = {}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [step, setStep] = useState<"password" | "enroll" | "verify">("password");
  const [factorId, setFactorId] = useState("");
  const [enrollment, setEnrollment] = useState<{ qr_code: string; secret: string } | null>(null);
  const [code, setCode] = useState("");
  const [mfaError, setMfaError] = useState<string | null>(null);
  const [copyMessage, setCopyMessage] = useState("");

  useEffect(() => {
    if (!sessionExpired) return;
    // The root Toaster subscribes after this page's mount effect, so wait for it.
    const timer = setTimeout(() => toast.info(SESSION_ENDED_MESSAGE, { duration: SESSION_ENDED_TOAST_MS }), 0);
    return () => clearTimeout(timer);
  }, [sessionExpired]);

  async function copySetupKey() {
    if (!enrollment) return;
    try {
      await navigator.clipboard.writeText(enrollment.secret);
      setCopyMessage("Setup key copied.");
    } catch {
      setCopyMessage("Could not copy the key. Select it and copy it manually.");
    }
  }

  function completeSignIn(data: Record<string, unknown>) {
    queueNextNavigationToast("Signed in successfully");
    window.location.href = getPostLoginPath(data, returnPath);
  }

  const enroll = useMutation({
    mutationFn: () => postMfa("enroll"),
    onSuccess: (result) => {
      setFactorId(result.factor_id);
      setEnrollment({ qr_code: result.qr_code, secret: result.secret });
      setMfaError(null);
    },
    onError: (error: Error) => setMfaError(error.message),
  });

  const verify = useMutation({
    mutationFn: () => postMfa("verify", { factor_id: factorId, code }),
    onSuccess: completeSignIn,
    onError: (error: Error) => setMfaError(error.message),
  });

  const mutation = useMutation({
    mutationFn: signIn,
    onSuccess: (data) => {
      if (data?.mfa_required === true) {
        setPassword("");
        if (data.mfa_factor_id) {
          setFactorId(data.mfa_factor_id);
          setStep("verify");
        } else {
          setStep("enroll");
          enroll.mutate();
        }
        return;
      }
      completeSignIn(data);
    },
    onError: (error: Error) => {
      if (error.name === "InvalidCredentials") setValidationError("Incorrect email or password. Please try again.");
      else toast.error(error.message, { duration: Infinity });
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setValidationError("Enter your email and password.");
      return;
    }
    setValidationError(null);
    mutation.mutate({ email: email.trim(), password, rememberMe });
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F5FAFF] p-5 text-[#111827]">
      <section className="w-full max-w-[440px] rounded-[24px] border border-[#E4EEF9] bg-white p-7 shadow-[0_10px_24px_rgba(12,43,73,0.08)]">
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-1">
            <Image src="/lexchain/logo-lexchain.svg" alt="LexChain" width={36} height={36} className="rounded-[10px]" />
            <span className="text-lg font-black text-[#0C2B49]">Lex<span className="text-[#0067B3]">Chain</span></span>
          </div>
          <h1 className="text-2xl font-black leading-9 text-[#0C2B49]">{step === "password" ? "Sign in" : step === "enroll" ? "Set up your authenticator" : "Verify your identity"}</h1>
          <p className="text-sm font-semibold leading-5 text-[#5B6F8A]">
            {step === "password" ? "For lawyers and their clients. Sign in with your credentials." : step === "enroll" ? "Download Google Authenticator or Microsoft Authenticator from your phone’s app store, then scan the QR code or enter the setup key." : "Enter the code from your authenticator app to continue."}
          </p>
        </div>

        {step === "password" ? <form className="mt-6 space-y-3.5" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="login-email" className="block text-sm font-black text-[#0C2B49]">Email</label>
            <input
              id="login-email"
              className={`mt-2 min-h-12 w-full rounded-[14px] border bg-[#F5FAFF] px-3.5 text-sm font-semibold text-[#0C2B49] outline-none ${validationError ? "border-red-700 focus:border-red-700" : "border-[#E4EEF9] focus:border-[#0067B3]"}`}
              type="email"
              required
              autoComplete="email"
              aria-invalid={validationError ? "true" : undefined}
              aria-describedby={validationError ? "login-error" : undefined}
              value={email}
              onChange={(e) => { setEmail(e.target.value); setValidationError(null); }}
            />
          </div>
          <div>
            <label htmlFor="login-password" className="block text-sm font-black text-[#0C2B49]">Password</label>
            <div className="relative mt-2">
              <input
                id="login-password"
                className={`min-h-12 w-full rounded-[14px] border bg-[#F5FAFF] pl-3.5 pr-11 text-sm font-semibold text-[#0C2B49] outline-none ${validationError ? "border-red-700 focus:border-red-700" : "border-[#E4EEF9] focus:border-[#0067B3]"}`}
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                aria-invalid={validationError ? "true" : undefined}
                aria-describedby={validationError ? "login-error" : undefined}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setValidationError(null); }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center p-1 text-[#5B6F8A] hover:text-[#0C2B49] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0067B3] rounded-lg transition"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <VisibilityOffOutlinedIcon sx={{ fontSize: 20 }} aria-hidden="true" />
                ) : (
                  <VisibilityOutlinedIcon sx={{ fontSize: 20 }} aria-hidden="true" />
                )}
              </button>
            </div>
            {validationError && <p id="login-error" role="alert" className="mt-2 text-sm font-semibold text-red-700">{validationError}</p>}
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              aria-pressed={rememberMe}
              onClick={() => setRememberMe((v) => !v)}
              className={`flex min-h-11 items-center gap-2 rounded-full px-3.5 py-2 text-xs font-black uppercase tracking-wide transition ${rememberMe ? "bg-[#EAF4FF]/60 border border-[#D7EBFF] text-[#0C2B49]" : "text-[#5B6F8A]"}`}
            >
              <span className={`inline-flex items-center justify-center w-4 h-4 rounded border-2 ${rememberMe ? "border-[#0067B3] bg-[#0067B3]" : "border-[#D7EBFF] bg-white"}`}>
                {rememberMe && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
              </span>
              Remember me
            </button>
            <Link href="/forgot-password" className="text-xs font-black text-[#0067B3]">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={mutation.isPending}
            className="mt-2 flex min-h-[52px] w-full items-center justify-center rounded-full bg-[#0067B3] px-5 py-3.5 text-[15px] font-black text-white transition hover:bg-[#005F9E] disabled:opacity-60"
          >
            {mutation.isPending ? "Signing in…" : "Sign in"}
          </button>

          <Link
            href="/register"
            className="flex min-h-[52px] w-full items-center justify-center rounded-full border-2 border-[#E4EEF9] px-5 py-3.5 text-[15px] font-black text-[#0C2B49] transition hover:bg-[#F5FAFF]"
          >
            Create an account
          </Link>
        </form> : <div className="mt-6 space-y-4">
          {step === "enroll" && (enroll.isPending ? <p role="status" className="text-sm text-[#5B6F8A]">Preparing your authenticator…</p> : enrollment ? <div className="space-y-3">
            <Image src={enrollment.qr_code.trimEnd()} alt="Authenticator setup QR code" width={200} height={200} unoptimized className="mx-auto max-w-full" />
            <p className="text-sm text-[#5B6F8A]">Can’t scan? Enter this setup key in your authenticator app:</p>
            <div className="flex items-center gap-3 rounded-lg bg-[#F5FAFF] p-3">
              <p className="min-w-0 flex-1 break-all font-mono text-sm text-[#0C2B49]">{enrollment.secret}</p>
              <button type="button" aria-label="Copy setup key" onClick={() => void copySetupKey()} className="min-h-11 shrink-0 rounded-full border border-[#D7E4F2] bg-white px-3 text-sm font-semibold text-[#0067B3] hover:bg-[#EAF4FF] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0067B3]">Copy</button>
            </div>
            {copyMessage && <p role="status" className="text-sm text-[#4B6382]">{copyMessage}</p>}
          </div> : <button type="button" onClick={() => enroll.mutate()} className="min-h-11 text-sm font-semibold text-[#0067B3] focus-visible:ring-2 focus-visible:ring-[#0067B3]">Try setup again</button>)}
          {(step === "verify" || enrollment) && <form className="space-y-3" onSubmit={(event) => { event.preventDefault(); if (!/^\d{6}$/.test(code)) { setMfaError("Enter the 6-digit code from your authenticator app."); return; } setMfaError(null); verify.mutate(); }}>
            <label htmlFor="authenticator-code" className="block text-sm font-semibold text-[#0C2B49]">Authenticator code</label>
            <AuthenticatorCodeInput id="authenticator-code" value={code} invalid={Boolean(mfaError)} describedBy={mfaError ? "mfa-error" : undefined} onChange={(nextCode) => { setCode(nextCode); setMfaError(null); }} />
            {mfaError && <p id="mfa-error" role="alert" className="text-sm font-semibold text-red-700">{mfaError}</p>}
            <button type="submit" disabled={verify.isPending} className="flex min-h-[52px] w-full items-center justify-center rounded-full bg-[#0067B3] px-5 py-3 text-base font-bold text-white hover:bg-[#005F9E] focus-visible:ring-2 focus-visible:ring-[#0067B3] disabled:opacity-60">{verify.isPending ? "Verifying…" : "Verify and sign in"}</button>
          </form>}
          {mfaError && !enrollment && step === "enroll" && <p role="alert" className="text-sm font-semibold text-red-700">{mfaError}</p>}
        </div>}

        <Link className="mt-5 block text-center text-sm font-black text-[#0067B3]" href="/">
          Return to LexChain
        </Link>
      </section>
    </main>
  );
}
