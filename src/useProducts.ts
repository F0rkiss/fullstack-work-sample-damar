import { useCallback, useReducer } from 'react';
import { generateProducts } from './data';
import type { Product } from './types';

type Action = { type: 'adjustStock'; id: number; delta: number };

function reducer(products: Product[], action: Action): Product[] {
  const index = products.findIndex((p) => p.id === action.id);
  if (index === -1) return products;

  const current = products[index];
  const stock = Math.max(0, current.stock + action.delta);
  if (stock === current.stock) return products;

  // Only the touched item gets a new reference; every other row keeps its
  // identity, which is what lets React.memo skip them.
  const next = products.slice();
  next[index] = { ...current, stock };
  return next;
}

export function useProducts(initialCount: number) {
  const [products, dispatch] = useReducer(reducer, initialCount, generateProducts);

  const adjustStock = useCallback(
    (id: number, delta: number) => dispatch({ type: 'adjustStock', id, delta }),
    [],
  );

  return { products, adjustStock };
}
