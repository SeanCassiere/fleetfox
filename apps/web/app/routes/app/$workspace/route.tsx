import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/app/$workspace')({
  beforeLoad: () => {
    const workspace = 'default';
    return { workspace };
  },
  preloadStaleTime: 30_000,
});
