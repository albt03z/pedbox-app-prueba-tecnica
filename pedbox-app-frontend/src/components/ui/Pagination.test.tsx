import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Pagination } from './Pagination';

describe('Pagination', () => {
  it('no renderiza nada cuando solo hay una página', () => {
    const { container } = render(
      <Pagination page={1} totalPages={1} onPageChange={vi.fn()} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('deshabilita "Anterior" en la primera página y habilita "Siguiente"', () => {
    render(<Pagination page={1} totalPages={3} onPageChange={vi.fn()} />);

    expect(screen.getByText('Anterior')).toBeDisabled();
    expect(screen.getByText('Siguiente')).not.toBeDisabled();
  });

  it('llama a onPageChange con la página correcta al hacer click en "Siguiente"', () => {
    const onPageChange = vi.fn();
    render(<Pagination page={2} totalPages={3} onPageChange={onPageChange} />);

    fireEvent.click(screen.getByText('Siguiente'));

    expect(onPageChange).toHaveBeenCalledWith(3);
  });
});
