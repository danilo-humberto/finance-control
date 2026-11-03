import { Outlet } from 'react-router-dom';

export function AuthLayout() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-app-bg px-3 py-4 text-app-text sm:px-4 sm:py-6 lg:flex lg:items-center lg:justify-center lg:bg-[#040907] lg:px-10 lg:py-10">
      {/* Desktop full-bleed ambient emerald glows matching Option C */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 top-1/4 hidden h-[420px] w-[420px] rounded-full bg-[#19d86b]/10 blur-[130px] lg:block"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-[10%] top-1/2 hidden h-[500px] w-[500px] -translate-y-1/2 rounded-full bg-[#19d86b]/12 blur-[150px] lg:block"
      />

      <div className="relative z-10 mx-auto w-full max-w-md lg:max-w-[1140px]">
        <Outlet />
      </div>
    </main>
  );
}
