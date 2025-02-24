import {
  createFileRoute,
  Outlet,
  redirect,
  useRouter,
} from '@tanstack/react-router';
import { useServerFn } from '@tanstack/start';
import { Button } from '~/components/ui/button';
import { checkAuthServerFn, logoutServerFn } from '~/lib/auth/server';

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
  const router = useRouter();
  const logoutFn = useServerFn(logoutServerFn);
  return (
    <div>
      <p>Hello "/app"!</p>
      <Button
        onClick={() => {
          logoutFn().then(() => {
            return router.invalidate({
              filter: (match) => match.pathname.startsWith('/app'),
            });
          });
        }}
      >
        Logout
      </Button>
      <hr />
      <Outlet />
    </div>
  );
}
