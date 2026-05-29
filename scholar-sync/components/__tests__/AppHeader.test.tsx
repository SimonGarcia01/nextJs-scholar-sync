import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

describe('AppHeader', () => {
  it('renders login and signup when not authenticated', async () => {
    vi.resetModules();
    vi.doMock('@/_store/authStore', () => ({
      default: () => ({ token: null, clearAuth: vi.fn() }),
    }));

    const { default: AppHeader } = await import('../AppHeader');

    render(<AppHeader />);

    expect(screen.getByText(/Scholar Sync/i)).toBeInTheDocument();
    expect(screen.getByText(/Login/i)).toBeInTheDocument();
    expect(screen.getByText(/Sign up/i)).toBeInTheDocument();
  });

  it('renders logout when authenticated and calls clearAuth on click', async () => {
    vi.resetModules();
    const clearAuth = vi.fn();
    vi.doMock('@/_store/authStore', () => ({
      default: () => ({ token: 'token', clearAuth }),
    }));

    const { default: AppHeader } = await import('../AppHeader');

    render(<AppHeader />);

    const btn = screen.getByRole('button', { name: /Logout/i });
    expect(btn).toBeInTheDocument();

    fireEvent.click(btn);

    expect(clearAuth).toHaveBeenCalled();
  });
});
