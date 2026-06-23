import { Outlet } from 'react-router-dom';

export function AuthLayout() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-app-bg px-4 py-10 text-app-text">
      <div className="w-full max-w-sm">
        <Outlet />
      </div>
    </main>
  );
}
