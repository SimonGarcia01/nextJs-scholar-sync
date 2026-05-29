import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Sidebar from '../dashboard/Sidebar';

describe('Sidebar', () => {
  const items = [
    { id: 'a', label: 'Item A' },
    { id: 'b', label: 'Item B' },
  ];

  it('renders menu title when not collapsed', () => {
    render(
      <Sidebar
        isOpen={true}
        isCollapsed={false}
        items={items}
        selectedId={'a'}
        onSelect={() => {}}
        onToggleCollapse={() => {}}
      />
    );

    expect(screen.getByText(/Menu/i)).toBeInTheDocument();
  });

  it('calls onToggleCollapse when collapse button clicked', () => {
    const onToggleCollapse = vi.fn();
    render(
      <Sidebar
        isOpen={true}
        isCollapsed={false}
        items={items}
        selectedId={'a'}
        onSelect={() => {}}
        onToggleCollapse={onToggleCollapse}
      />
    );

    const btn = screen.getByRole('button', { name: /Collapse menu/i });
    fireEvent.click(btn);
    expect(onToggleCollapse).toHaveBeenCalled();
  });

  it('calls onSelect when an item is clicked', () => {
    const onSelect = vi.fn();
    render(
      <Sidebar
        isOpen={true}
        isCollapsed={false}
        items={items}
        selectedId={''}
        onSelect={onSelect}
        onToggleCollapse={() => {}}
      />
    );

    fireEvent.click(screen.getByText('Item B'));
    expect(onSelect).toHaveBeenCalledWith('b');
  });
});
