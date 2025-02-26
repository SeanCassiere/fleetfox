import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/app/workspace/create')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      <h2>Create workspace form</h2>
      <p>TODO: Add a form to create a workspace.</p>
    </div>
  );
}
