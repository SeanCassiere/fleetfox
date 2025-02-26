import {
  createFileRoute,
  Link,
  Outlet,
  redirect,
} from '@tanstack/react-router';
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
      <div className="px-6 pb-6 flex gap-2">
        <Button asChild>
          <Link to="/app/workspace/select">Select Workspace</Link>
        </Button>
        <Button asChild>
          <Link to="/app/workspace/create">Create Workspace</Link>
        </Button>
        <form action="/api/auth/logout" method="GET">
          <Button>Logout</Button>
        </form>
      </div>
      <hr />
      <Outlet />
    </main>
  );
}
