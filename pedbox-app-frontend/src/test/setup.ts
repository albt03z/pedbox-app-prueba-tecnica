import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

// RTL no detecta un afterEach global sin `test.globals: true` en la
// config de Vitest — se limpia el DOM explícitamente para que cada test
// arranque desde cero (si no, las queries encuentran nodos del test anterior).
afterEach(() => {
  cleanup();
});
