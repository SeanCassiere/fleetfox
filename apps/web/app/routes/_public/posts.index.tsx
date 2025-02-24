import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_public/posts/')({
  component: PostsIndexComponent,
});

function PostsIndexComponent() {
  return (
    <div>
      <p>Select a post.</p>
    </div>
  );
}
