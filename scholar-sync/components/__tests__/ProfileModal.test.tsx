import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ProfileModal from '../dashboard/ProfileModal';

describe('ProfileModal', () => {
  it('does not render when isOpen is false', () => {
    const onClose = vi.fn();
    const { container } = render(
      <ProfileModal isOpen={false} userId={null} userEmail="a@b.com" roles={[]} onClose={onClose} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders when isOpen is true and calls onClose on button and Escape', () => {
    const onClose = vi.fn();
    render(
      <ProfileModal isOpen={true} userId={null} userEmail="me@here.com" roles={["User"]} onClose={onClose} />
    );

    // Close button
    const btn = screen.getByRole('button', { name: /Cerrar/i });
    fireEvent.click(btn);
    expect(onClose).toHaveBeenCalledTimes(1);

    // Escape key
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(2);
  });
});
