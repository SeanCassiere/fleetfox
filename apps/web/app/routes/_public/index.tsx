import { createFileRoute } from '@tanstack/react-router';
import { DEPLOY_URL } from '~/utils/env';

export const Route = createFileRoute('/_public/')({
  component: Home,
});

function Home() {
  return (
    <div className="p-2">
      <h3>Welcome Home!!!</h3>
      <p>{DEPLOY_URL}</p>
    </div>
  );
}
