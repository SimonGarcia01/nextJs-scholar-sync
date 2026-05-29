import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SidebarItem from '../dashboard/SidebarItem';

describe('SidebarItem', () => {
  it('renders label when not collapsed', () => {
    const onClick = vi.fn();
    render(
      <SidebarItem label="Test" isActive={false} isCollapsed={false} onClick={onClick} />
    );

    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  it('does not render label when collapsed', () => {
    const onClick = vi.fn();
    render(
      <SidebarItem label="Test" isActive={false} isCollapsed={true} onClick={onClick} />
    );

    expect(screen.queryByText('Test')).toBeNull();
  });

  it('calls onClick when clicked', () => {
    const onClick = vi.fn();
    render(
      <SidebarItem label="ClickMe" isActive={false} isCollapsed={false} onClick={onClick} />
    );

    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalled();
  });

  it('applies active class when isActive is true', () => {
    const onClick = vi.fn();
    render(
      <SidebarItem label="Active" isActive={true} isCollapsed={false} onClick={onClick} />
    );

    const btn = screen.getByRole('button');
    expect(btn.className).toContain('bg-blue-50');
  });
});
