import { createFileRoute } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/start';
import { DEPLOY_URL } from '~/utils/env';

const getTestSecretKey = createServerFn().handler(() => {
  const secretKey = DEPLOY_URL;
  return { secretKey };
});

export const Route = createFileRoute('/_public/posts/')({
  loader: () => getTestSecretKey(),
  component: PostsIndexComponent,
});

function PostsIndexComponent() {
  const secretKey = Route.useLoaderData({ select: (s) => s.secretKey });
  return (
    <div>
      <p>Select a post.</p>
      <p>Your test secret key is: {secretKey}.</p>
    </div>
  );
}
