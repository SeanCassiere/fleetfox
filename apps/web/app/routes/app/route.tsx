import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { Button } from '~/components/ui/button';
import { checkAuthServerFn } from '~/lib/auth/server';

export const Route = createFileRoute('/app')({
  loader: async () => {
    const auth = await checkAuthServerFn();
    if (auth.status === 'login') {
      throw redirect({ to: '/login' });
    }
    return { account: auth.account };
  },
  staleTime: 30_000, // 30 seconds
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <main className="py-6">
      <div className="px-6 pb-6">
        <form action="/api/auth/logout" method="GET">
          <Button>Logout</Button>
        </form>
      </div>
      <hr />
      <Outlet />
    </main>
  );
}
