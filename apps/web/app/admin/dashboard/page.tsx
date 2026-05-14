export default function AdminDashboardPage() {
  return (
    <main className="min-h-screen bg-[#f7f9fc] px-6 py-14 text-[#102033]">
      <section className="mx-auto max-w-6xl">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#2563eb]">
          Super admin
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight">
          Dashboard shell
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-[#526172]">
          This is the first Next.js admin route. Full admin screens will be
          rebuilt here with web components instead of React Native components.
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {["Documents", "Users", "Verification logs"].map((item) => (
            <div className="rounded-lg border border-[#d9e2ef] bg-white p-5" key={item}>
              <p className="text-sm font-semibold">{item}</p>
              <p className="mt-2 text-sm text-[#526172]">Migration placeholder</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
