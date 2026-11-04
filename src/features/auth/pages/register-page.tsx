"use client";

import Image from 'next/image';
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";

import { getEmailFromInviteToken } from "@/shared/utils/invite-token";
import { authEmailSchema, signUpNameSchema, signUpPasswordSchema, signUpResponseSchema } from "@/features/auth/schemas/auth";

const registerSchema = z.object({
  firstName: signUpNameSchema,
  lastName: signUpNameSchema,
  email: authEmailSchema,
  password: signUpPasswordSchema,
  confirmPassword: z.string().min(1, "Confirm your password."),
}).refine((v) => v.password === v.confirmPassword, { message: "Passwords do not match.", path: ["confirmPassword"] });

type RegisterForm = z.infer<typeof registerSchema>;

type CreatedAccount = {
  email: string;
  isInvitationSignup: boolean;
  isDocumentInvite: boolean;
  requiresEmailConfirmation: boolean;
  message?: string;
};

async function signUp(data: RegisterForm) {
  const res = await fetch("/api/portal/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: data.email,
      password: data.password,
      f_name: data.firstName,
      l_name: data.lastName,
    }),
  });
  const payload: unknown = await res.json().catch(() => null);
  const parsed = signUpResponseSchema.safeParse(payload);
  if (!res.ok) {
    const message = typeof payload === "object" && payload !== null && "message" in payload && typeof payload.message === "string"
      ? payload.message
      : "Sign up failed. Check your details and try again.";
    throw new Error(message);
  }
  if (!parsed.success) throw new Error("Sign up returned an unexpected response.");
  return parsed.data;
}

function RegisterPageContent() {
  const searchParams = useSearchParams();
  const inviteToken = searchParams.get("token")?.trim() ?? "";
  const inviteEmail = searchParams.get("email")?.trim() || getEmailFromInviteToken(inviteToken);
  const isTokenInvite = Boolean(inviteToken);
  const isDocumentInvite = Boolean(inviteEmail) && !inviteToken;
  const hasInviteEmail = inviteEmail.length > 0;
  const [createdAccount, setCreatedAccount] = useState<CreatedAccount | null>(null);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: inviteEmail,
    },
  });

  const mutation = useMutation({
    mutationFn: signUp,
    onSuccess: (response, values) => {
      const requiresEmailConfirmation = response.requires_email_confirmation;
      setCreatedAccount({
        email: values.email,
        isInvitationSignup: isTokenInvite,
        isDocumentInvite,
        requiresEmailConfirmation,
        message: response.message?.trim() || undefined,
      });
    },
    onError: (error: Error) => setSubmissionError(error.message),
  });

  const onSubmit = handleSubmit((values) => {
    setSubmissionError(null);
    mutation.mutate(values);
  });
  const inputClass = "mt-2 min-h-12 w-full rounded-[14px] border border-[#E4EEF9] bg-[#F5FAFF] px-3.5 text-sm font-semibold text-[#0C2B49] outline-none focus:border-[#0067B3]";
  const emailInputClass = isTokenInvite && hasInviteEmail
    ? `${inputClass} cursor-default bg-[#EEF4FB] text-[#4B6382]`
    : inputClass;

  useEffect(() => {
    if (inviteEmail) {
      setValue("email", inviteEmail, { shouldValidate: true });
    }
  }, [inviteEmail, setValue]);

  if (createdAccount) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F5FAFF] p-5 text-[#111827]">
        <section className="w-full max-w-[440px] rounded-[24px] border border-[#E4EEF9] bg-white p-7 shadow-[0_10px_24px_rgba(12,43,73,0.08)]">
          <div className="flex items-center gap-2">
            <Image src="/lexchain/logo-lexchain.svg" alt="LexChain" width={36} height={36} className="rounded-[10px]" />
            <span className="text-lg font-black text-[#0C2B49]">Lex<span className="text-[#0067B3]">Chain</span></span>
          </div>
          <div className="mt-7 rounded-[20px] bg-[#EAF6FF] p-5">
            <h1 className="text-3xl font-black leading-9 text-[#0C2B49]">
              {createdAccount.requiresEmailConfirmation ? "Check your email" : "Account created"}
            </h1>
            <p className="mt-3 text-sm font-semibold leading-5 text-[#4B6382]">
              {createdAccount.isDocumentInvite
                ? "Confirm your email, then sign in. The document you were invited to will be waiting for you."
                : createdAccount.requiresEmailConfirmation
                  ? createdAccount.message ?? `Your account for ${createdAccount.email} was created. Check your email to verify it before signing in.`
                  : createdAccount.message ?? `Your account for ${createdAccount.email} is ready. You can now sign in.`}
            </p>
          </div>
          {createdAccount.isInvitationSignup ? (
            <p role="status" className="mt-4 rounded-[14px] border border-[#F2D4A7] bg-[#FFF8EA] p-3 text-sm font-semibold leading-5 text-[#74521A]">
              This is a standard account. The invitation has not been accepted and does not grant access to invited documents.
            </p>
          ) : null}
          <Link
            href="/login"
            className="mt-6 flex min-h-[52px] w-full items-center justify-center rounded-full bg-[#0067B3] px-5 py-3.5 text-[15px] font-black text-white transition hover:bg-[#005F9E]"
          >
            Go to login
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F5FAFF] p-5 text-[#111827]">
      <section className="w-full max-w-[440px] rounded-[24px] border border-[#E4EEF9] bg-white p-7 shadow-[0_10px_24px_rgba(12,43,73,0.08)]">
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-1">
            <Image src="/lexchain/logo-lexchain.svg" alt="LexChain" width={36} height={36} className="rounded-[10px]" />
            <span className="text-lg font-black text-[#0C2B49]">Lex<span className="text-[#0067B3]">Chain</span></span>
          </div>
          <h1 className="text-3xl font-black leading-9 text-[#0C2B49]">Create account</h1>
          <p className="text-sm font-semibold leading-5 text-[#5B6F8A]">
            {isTokenInvite
              ? hasInviteEmail
                ? "Create a standard LexChain account with the email from your invitation."
                : "Create a standard LexChain account using the email address from your invitation."
              : isDocumentInvite
                ? "Create an account to access the document you were invited to."
                : "Register to access your documents."}
          </p>
        </div>

        {inviteToken ? (
          <div role="status" className="mt-4 rounded-[14px] border border-[#F2D4A7] bg-[#FFF8EA] p-3 text-sm font-semibold leading-5 text-[#74521A]">
            <p>This creates an account only. It does not accept the invitation or grant access to invited documents.</p>
          </div>
        ) : null}

        <form className="mt-6 space-y-3.5" onSubmit={onSubmit} noValidate>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-[13px] font-black text-[#0C2B49]">First Name</span>
              <input {...register("firstName")} placeholder="John" className={inputClass} aria-invalid={errors.firstName ? "true" : undefined} aria-describedby={errors.firstName ? "first-name-error" : undefined} />
              {errors.firstName && <p id="first-name-error" className="text-xs text-red-700 mt-1">{errors.firstName.message}</p>}
            </label>
            <label className="block">
              <span className="text-[13px] font-black text-[#0C2B49]">Last Name</span>
              <input {...register("lastName")} placeholder="Doe" className={inputClass} aria-invalid={errors.lastName ? "true" : undefined} aria-describedby={errors.lastName ? "last-name-error" : undefined} />
              {errors.lastName && <p id="last-name-error" className="text-xs text-red-700 mt-1">{errors.lastName.message}</p>}
            </label>
          </div>

          <div>
            <label className="block">
              <span className="text-[13px] font-black text-[#0C2B49]">Email</span>
              <input
                {...register("email")}
                type="email"
                autoComplete="email"
                defaultValue={inviteEmail}
                className={emailInputClass}
                readOnly={Boolean(isTokenInvite && hasInviteEmail)}
                aria-invalid={errors.email ? "true" : undefined}
                aria-describedby={[
                  hasInviteEmail ? "invite-email-help" : null,
                  errors.email ? "email-error" : null,
                ].filter(Boolean).join(" ") || undefined}
              />
              {errors.email && <p id="email-error" className="text-xs text-red-700 mt-1">{errors.email.message}</p>}
            </label>
            {isTokenInvite && hasInviteEmail ? (
              <p id="invite-email-help" className="mt-1 text-xs font-medium text-[#5B6F8A]">Email from your invitation; it cannot be changed here.</p>
            ) : isDocumentInvite ? (
              <p id="invite-email-help" className="mt-1 text-xs font-medium text-[#5B6F8A]">The document is only added if you sign up with this exact address.</p>
            ) : null}
          </div>

          <div>
            <label htmlFor="register-password" className="block text-[13px] font-black text-[#0C2B49]">Password</label>
            <span id="password-help" className="block text-xs font-medium text-[#5B6F8A]">At least 8 characters, with uppercase, lowercase, and a number.</span>
            <div className="relative mt-2">
              <input
                id="register-password"
                {...register("password")}
                type={showPassword ? "text" : "password"}
                className={`${inputClass} mt-0 pr-11`}
                aria-invalid={errors.password ? "true" : undefined}
                aria-describedby={errors.password ? "password-help password-error" : "password-help"}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
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
            {errors.password && <p id="password-error" className="text-xs text-red-700 mt-1">{errors.password.message}</p>}
          </div>

          <div>
            <label htmlFor="register-confirm-password" className="block text-[13px] font-black text-[#0C2B49]">Confirm Password</label>
            <div className="relative mt-2">
              <input
                id="register-confirm-password"
                {...register("confirmPassword")}
                type={showConfirmPassword ? "text" : "password"}
                className={`${inputClass} mt-0 pr-11`}
                aria-invalid={errors.confirmPassword ? "true" : undefined}
                aria-describedby={errors.confirmPassword ? "confirm-password-error" : undefined}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center p-1 text-[#5B6F8A] hover:text-[#0C2B49] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0067B3] rounded-lg transition"
                aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
              >
                {showConfirmPassword ? (
                  <VisibilityOffOutlinedIcon sx={{ fontSize: 20 }} aria-hidden="true" />
                ) : (
                  <VisibilityOutlinedIcon sx={{ fontSize: 20 }} aria-hidden="true" />
                )}
              </button>
            </div>
            {errors.confirmPassword && <p id="confirm-password-error" className="text-xs text-red-700 mt-1">{errors.confirmPassword.message}</p>}
          </div>

          {submissionError ? <p role="alert" className="text-sm font-semibold text-red-700">{submissionError}</p> : null}

          <button
            type="submit"
            disabled={mutation.isPending}
            className="mt-2 flex min-h-[52px] w-full items-center justify-center rounded-full bg-[#0067B3] px-5 py-3.5 text-[15px] font-black text-white transition hover:bg-[#005F9E] disabled:opacity-60"
          >
            {mutation.isPending ? "Creating account…" : "Create account"}
          </button>

          <Link
            href="/login"
            className="flex min-h-[52px] w-full items-center justify-center rounded-full border-2 border-[#E4EEF9] px-5 py-3.5 text-[15px] font-black text-[#0C2B49] transition hover:bg-[#F5FAFF]"
          >
            I already have an account
          </Link>
        </form>
      </section>
    </main>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#F5FAFF] p-5 text-[#111827]">
          <section className="w-full max-w-[440px] rounded-[24px] border border-[#E4EEF9] bg-white p-7 shadow-[0_10px_24px_rgba(12,43,73,0.08)]">
            <p className="text-sm font-black text-[#0C2B49]">Loading sign-up</p>
          </section>
        </main>
      }
    >
      <RegisterPageContent />
    </Suspense>
  );
}
