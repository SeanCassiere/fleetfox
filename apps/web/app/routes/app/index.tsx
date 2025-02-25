import { createFileRoute, useLoaderData } from '@tanstack/react-router';
import { seo } from '~/lib/utils';

export const Route = createFileRoute('/app/')({
  component: RouteComponent,
  head: () => ({
    meta: seo({ title: 'Dashboard | Fleetfox' }),
  }),
});

function RouteComponent() {
  const appLoaderData = useLoaderData({ from: '/app' });
  return (
    <div className="p-6">
      <div>
        <code>
          <pre>{JSON.stringify(appLoaderData, null, 2)}</pre>
        </code>
      </div>
    </div>
  );
}
