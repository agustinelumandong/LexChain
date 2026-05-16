import Link from "next/link";

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F5FAFF] p-5 text-[#111827]">
      <section className="w-full max-w-[440px] rounded-[24px] border border-[#E4EEF9] bg-white p-7 shadow-[0_10px_24px_rgba(12,43,73,0.08)]">
        <div className="space-y-2">
          <p className="text-sm font-black uppercase leading-5 text-[#0985E7]">
            LexChain
          </p>
          <h1 className="text-3xl font-black leading-9 text-[#0C2B49]">
            Super Admin Login
          </h1>
          <p className="text-sm font-semibold leading-5 text-[#64748b]">
            Presentation mode opens the super admin dashboard directly.
          </p>
        </div>

        <div className="mt-6 space-y-3.5">
          <label className="block">
            <span className="text-[13px] font-black text-[#0C2B49]">Email</span>
            <input
              className="mt-2 min-h-12 w-full rounded-[14px] border border-[#E4EEF9] bg-[#F5FAFF] px-3.5 text-sm font-semibold text-[#0C2B49] outline-none"
              readOnly
              value="superadmin@lexchain.demo"
            />
          </label>
          <label className="block">
            <span className="text-[13px] font-black text-[#0C2B49]">Password</span>
            <input
              className="mt-2 min-h-12 w-full rounded-[14px] border border-[#E4EEF9] bg-[#F5FAFF] px-3.5 text-sm font-semibold text-[#0C2B49] outline-none"
              readOnly
              type="password"
              value="presentation"
            />
          </label>
        </div>

        <Link
          className="mt-6 flex min-h-[52px] items-center justify-center rounded-full bg-[#0985E7] px-5 py-3.5 text-[15px] font-black text-white transition hover:bg-[#0770c4]"
          href="/admin/dashboard"
        >
          Enter admin dashboard
        </Link>

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
