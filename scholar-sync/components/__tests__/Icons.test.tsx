import React from 'react';
import { render, screen } from '@testing-library/react';
import { MenuIcon } from '../dashboard/Icons';

describe('Icons', () => {
  it('renders MenuIcon svg', () => {
    render(<MenuIcon data-testid="menu" />);
    const svg = screen.getByTestId('menu');
    expect(svg.tagName.toLowerCase()).toBe('svg');
  });
});
