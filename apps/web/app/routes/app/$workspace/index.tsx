import { createFileRoute } from '@tanstack/react-router';
import { seo } from '~/lib/utils';

export const Route = createFileRoute('/app/$workspace/')({
  component: RouteComponent,
  head: () => ({
    meta: seo({ title: 'Dashboard | Fleetfox' }),
  }),
});

function RouteComponent() {
  const workspaceId = Route.useParams({ select: (s) => s.workspace });
  return <div>Hello "/app/{workspaceId}/"!</div>;
}
