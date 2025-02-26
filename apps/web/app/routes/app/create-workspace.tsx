import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/app/create-workspace')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/app/create-workspace"!</div>
}
