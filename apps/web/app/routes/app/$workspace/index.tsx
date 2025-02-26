import { createFileRoute } from '@tanstack/react-router';
import { seo } from '~/lib/utils';

export const Route = createFileRoute('/app/$workspace/')({
  component: RouteComponent,
  head: ({
    match: {
      context: { workspace },
    },
  }) => {
    return {
      meta: seo({ title: `Dashboard ${workspace.workspace} | Fleetfox` }),
    };
  },
});

function RouteComponent() {
  const workspaceId = Route.useParams({ select: (s) => s.workspace });
  return (
    <div className="px-6 pt-6">
      You are on the workspace page for {workspaceId}.
    </div>
  );
}
