import type { getWorkspacesForAccount } from '../db/workspace';

export function getRedirectUrlForWorkspace(
  workspaces: Awaited<ReturnType<typeof getWorkspacesForAccount>>,
  attemptedWorkspace: string | undefined,
): { workspace: string | undefined; redirectPath: string } {
  let currentWorkspace;
  let href;

  // No workspaces are available, so redirect to workspace creation flow.
  if (workspaces.length === 0) {
    return {
      workspace: undefined,
      redirectPath: '/app/workspace/create',
    };
  }

  if (!attemptedWorkspace) {
    // No attempted workspace is set, so redirect to workspace selection flow.
    currentWorkspace = undefined;
    href = '/app/workspace/select';
  } else {
    const found = workspaces.find((w) => w.workspace === attemptedWorkspace);

    // The attempted workspace is not accessible, so redirect to workspace selection flow.
    if (!found) {
      currentWorkspace = undefined;
      href = '/app/workspace/select';
    } else {
      // The current workspace is accessible, so keep it as is
      currentWorkspace = found.workspace;
      href = `/app/${currentWorkspace}`;
    }
  }

  return {
    workspace: currentWorkspace,
    redirectPath: href,
  };
}
