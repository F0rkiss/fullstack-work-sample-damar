import { memo, useMemo } from 'react';
import type { Product } from '../types';
import { stockStatus } from './ProductRow';

function summarize(products: Product[]) {
  const totals = { ok: 0, low: 0, out: 0 };
  for (const product of products) totals[stockStatus(product.stock).tone] += 1;
  return totals;
}

// Skips re-rendering (and re-counting) when only the search query changes.
export const StockSummary = memo(function StockSummary({ products }: { products: Product[] }) {
  const totals = useMemo(() => summarize(products), [products]);

  return (
    <dl className="summary">
      <div>
        <dt>Total produk</dt>
        <dd>{products.length.toLocaleString('id-ID')}</dd>
      </div>
      <div>
        <dt>Tersedia</dt>
        <dd>{totals.ok.toLocaleString('id-ID')}</dd>
      </div>
      <div>
        <dt>Menipis</dt>
        <dd>{totals.low.toLocaleString('id-ID')}</dd>
      </div>
      <div>
        <dt>Habis</dt>
        <dd>{totals.out.toLocaleString('id-ID')}</dd>
      </div>
    </dl>
  );
});
