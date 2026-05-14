import Link from "next/link";

const webRoutes = [
  { href: "/verify", label: "Verify document" },
  { href: "/admin/login", label: "Admin portal" },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f7f9fc] text-[#102033]">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center px-6 py-16">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#2563eb]">
          LexChain web
        </p>
        <div className="mt-5 max-w-3xl">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">
            Public verification and admin workflows now start on the web.
          </h1>
          <p className="mt-6 text-lg leading-8 text-[#526172]">
            Expo stays focused on the mobile app. This Next.js app will own the
            landing page, public verifier, invite fallback, and admin portal.
          </p>
        </div>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          {webRoutes.map((route) => (
            <Link
              className="rounded-md bg-[#102033] px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-[#1d3554]"
              href={route.href}
              key={route.href}
            >
              {route.label}
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
