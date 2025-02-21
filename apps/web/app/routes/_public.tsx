import * as React from 'react';
import { createFileRoute, Outlet, Link } from '@tanstack/react-router';

export const Route = createFileRoute('/_public')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <React.Fragment>
      <div className="p-2 flex gap-2 text-lg">
        <Link
          to="/"
          activeProps={{
            className: 'font-bold',
          }}
          activeOptions={{ exact: true }}
        >
          Home
        </Link>
        <Link
          to="/posts"
          activeProps={{
            className: 'font-bold',
          }}
        >
          Posts
        </Link>
      </div>
      <hr />
      <Outlet />
    </React.Fragment>
  );
}
