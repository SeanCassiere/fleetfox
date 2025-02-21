import { createFileRoute } from '@tanstack/react-router';
import { env } from '~/utils/env';

export const Route = createFileRoute('/_public/')({
  component: Home,
});

function Home() {
  return (
    <div className="p-2">
      <h3>Welcome Home!!!</h3>
      <p>The value below should not be shown.</p>
      <p>SECRET_VALUE: {JSON.stringify(env.SECRET_VALUE || 'undefined')}</p>
    </div>
  );
}
