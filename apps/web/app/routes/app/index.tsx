import { createFileRoute, useLoaderData } from '@tanstack/react-router';

export const Route = createFileRoute('/app/')({
  component: RouteComponent,
});

function RouteComponent() {
  const appLoaderData = useLoaderData({ from: '/app' });
  return (
    <div>
      <div>Hello "/app/" index!</div>
      <div>
        <code>
          <pre>{JSON.stringify(appLoaderData, null, 2)}</pre>
        </code>
      </div>
    </div>
  );
}
