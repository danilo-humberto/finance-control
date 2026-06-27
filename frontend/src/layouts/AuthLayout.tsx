import { Outlet } from 'react-router-dom';

export function AuthLayout() {
  return (
    <main className="min-h-screen bg-app-bg px-3 py-4 text-app-text sm:px-4 sm:py-6">
      <div className="mx-auto w-full max-w-md">
        <Outlet />
      </div>
    </main>
  );
}
