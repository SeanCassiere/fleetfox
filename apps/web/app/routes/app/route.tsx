import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/app')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      <p>Hello "/app"!</p>
      <Outlet />
    </div>
  );
}
