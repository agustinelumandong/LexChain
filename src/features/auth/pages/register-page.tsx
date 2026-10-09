"use client";

import Image from 'next/image';
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";

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
  const hasInviteEmail = inviteEmail.length > 0;
  const [createdAccount, setCreatedAccount] = useState<CreatedAccount | null>(null);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
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
        isInvitationSignup: Boolean(inviteToken),
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
  const inputClass = "mt-2 min-h-12 w-full rounded-[14px] border border-[#E4EEF9] bg-[#F5FAFF] px-3.5 text-sm font-semibold text-[#0C2B49] outline-none focus:border-[#0985E7]";
  const emailInputClass = hasInviteEmail
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
            <span className="text-lg font-black text-[#0C2B49]">Lex<span className="text-[#0985E7]">Chain</span></span>
          </div>
          <div className="mt-7 rounded-[20px] bg-[#EAF6FF] p-5">
            <h1 className="text-3xl font-black leading-9 text-[#0C2B49]">
              {createdAccount.requiresEmailConfirmation ? "Check your email" : "Account created"}
            </h1>
            <p className="mt-3 text-sm font-semibold leading-5 text-[#4B6382]">
              {createdAccount.requiresEmailConfirmation
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
            className="mt-6 flex min-h-[52px] w-full items-center justify-center rounded-full bg-[#0985E7] px-5 py-3.5 text-[15px] font-black text-white transition hover:bg-[#0770c4]"
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
            <span className="text-lg font-black text-[#0C2B49]">Lex<span className="text-[#0985E7]">Chain</span></span>
          </div>
          <h1 className="text-3xl font-black leading-9 text-[#0C2B49]">Create account</h1>
          <p className="text-sm font-semibold leading-5 text-[#64748b]">
            {inviteToken
              ? hasInviteEmail
                ? "Create a standard LexChain account with the email from your invitation."
                : "Create a standard LexChain account using the email address from your invitation."
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
              <input {...register("firstName")} placeholder="John" className={inputClass} />
              {errors.firstName && <p className="text-xs text-red-500 mt-1">{errors.firstName.message}</p>}
            </label>
            <label className="block">
              <span className="text-[13px] font-black text-[#0C2B49]">Last Name</span>
              <input {...register("lastName")} placeholder="Doe" className={inputClass} />
              {errors.lastName && <p className="text-xs text-red-500 mt-1">{errors.lastName.message}</p>}
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
                readOnly={hasInviteEmail}
                aria-describedby={hasInviteEmail ? "invite-email-help" : undefined}
              />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
            </label>
            {hasInviteEmail ? <p id="invite-email-help" className="mt-1 text-xs font-medium text-[#64748b]">Email from your invitation; it cannot be changed here.</p> : null}
          </div>

          <label className="block">
            <span className="text-[13px] font-black text-[#0C2B49]">Password</span>
            <span className="block text-xs font-medium text-[#64748b]">At least 8 characters, with uppercase, lowercase, and a number.</span>
            <input {...register("password")} type="password" className={inputClass} />
            {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
          </label>

          <label className="block">
            <span className="text-[13px] font-black text-[#0C2B49]">Confirm Password</span>
            <input {...register("confirmPassword")} type="password" className={inputClass} />
            {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword.message}</p>}
          </label>

          {submissionError ? <p role="alert" className="text-sm font-semibold text-red-700">{submissionError}</p> : null}

          <button
            type="submit"
            disabled={mutation.isPending}
            className="mt-2 flex min-h-[52px] w-full items-center justify-center rounded-full bg-[#0985E7] px-5 py-3.5 text-[15px] font-black text-white transition hover:bg-[#0770c4] disabled:opacity-60"
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
