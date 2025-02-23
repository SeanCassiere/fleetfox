import * as React from 'react';
import { createFileRoute, Outlet, Link } from '@tanstack/react-router';
import { Button } from '~/components/ui/button';

export const Route = createFileRoute('/_public')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <React.Fragment>
      <nav className="flex justify-between items-center">
        <ul className="p-2 flex gap-2 text-lg">
          <li>
            <Link
              to="/"
              activeProps={{
                className: 'font-bold',
              }}
              activeOptions={{
                exact: true,
                includeHash: false,
                includeSearch: false,
              }}
            >
              Home
            </Link>
          </li>
          <li>
            <Link
              to="/posts"
              activeProps={{
                className: 'font-bold',
              }}
            >
              Posts
            </Link>
          </li>
        </ul>
        <ul className="p-2 flex gap-2 text-lg">
          <li>
            <Button asChild>
              <Link to="/login">Go to login page</Link>
            </Button>
          </li>
          <li>
            <Button asChild>
              <Link to="/app">Go to app</Link>
            </Button>
          </li>
        </ul>
      </nav>
      <hr />
      <Outlet />
    </React.Fragment>
  );
}
