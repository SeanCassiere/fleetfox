import { createFileRoute } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/start';
import { env } from '~/lib/utils/env';

const getSecretKey = createServerFn().handler(() => {
  const SECRET_KEY = env.SECRET_VALUE;
  return { SECRET_KEY };
});

export const Route = createFileRoute('/_public/posts/')({
  loader: () => getSecretKey(),
  component: PostsIndexComponent,
});

function PostsIndexComponent() {
  const loaderData = Route.useLoaderData();
  return (
    <div>
      <p>Select a post.</p>
      <p>Your test secret key is: {JSON.stringify(loaderData.SECRET_KEY)}.</p>
    </div>
  );
}
