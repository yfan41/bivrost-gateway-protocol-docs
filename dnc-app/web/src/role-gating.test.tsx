import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AuthContext, EngineerOnly } from './auth';
import type { User } from './api';

function withRole(role: User['role'], ui: React.ReactNode) {
  const user: User = { id: 1, username: 'test', role, isActive: true };
  return render(
    <AuthContext.Provider value={{ user, loading: false, login: async () => undefined, logout: async () => undefined }}>
      {ui}
    </AuthContext.Provider>,
  );
}

describe('role-dependent UI gating', () => {
  it('shows engineer-only actions to engineers', () => {
    withRole('engineer', (
      <EngineerOnly>
        <button>Release</button>
      </EngineerOnly>
    ));
    expect(screen.getByText('Release')).toBeTruthy();
  });

  it('hides engineer-only actions from operators', () => {
    withRole('operator', (
      <EngineerOnly>
        <button>Release</button>
      </EngineerOnly>
    ));
    expect(screen.queryByText('Release')).toBeNull();
  });

  it('renders the operator fallback when provided', () => {
    withRole('operator', (
      <EngineerOnly fallback={<span>Ask an engineer</span>}>
        <button>Delete file</button>
      </EngineerOnly>
    ));
    expect(screen.queryByText('Delete file')).toBeNull();
    expect(screen.getByText('Ask an engineer')).toBeTruthy();
  });
});
