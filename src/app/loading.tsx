export default function Loading() {
  return (
    <div
      className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="h-44 w-full animate-pulse rounded-[2.5rem] border-2 border-[var(--color-border-subtle)] bg-gradient-to-r from-[var(--color-bg-card-photo)] via-[var(--color-mint-bg-alt)] to-[var(--color-sun-cream)]" />
      <div className="mt-6 h-24 w-full animate-pulse rounded-3xl border-2 border-[var(--color-border-subtle)] bg-white" />
      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="cute-card h-80 animate-pulse p-4"
          >
            <div className="h-40 w-full rounded-2xl bg-[var(--color-bg-card-photo)]" />
            <div className="mt-4 h-5 w-3/4 rounded-full bg-[var(--color-bg-aqua-fade)]" />
            <div className="mt-2 h-4 w-full rounded-full bg-[var(--color-mint-bg-alt)]" />
            <div className="mt-6 h-10 w-full rounded-2xl bg-[var(--color-sun-cream)]" />
          </div>
        ))}
      </div>
      <span className="sr-only">กำลังโหลดข้อมูลทริป...</span>
    </div>
  );
}
