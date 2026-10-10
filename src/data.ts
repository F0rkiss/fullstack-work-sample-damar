import type { Product } from './types';

const CATEGORIES = ['Kaos', 'Celana', 'Sepatu', 'Tas', 'Topi', 'Jaket', 'Jam Tangan', 'Kacamata'];

export function generateProducts(count: number): Product[] {
  return Array.from({ length: count }, (_, i) => {
    const n = i + 1;
    return {
      id: n,
      name: `${CATEGORIES[i % CATEGORIES.length]} Seri ${String(n).padStart(4, '0')}`,
      sku: `SKU-${String(n).padStart(5, '0')}`,
      price: 49_000 + ((i * 7919) % 951) * 1_000,
      stock: (i * 31) % 120,
    };
  });
}
