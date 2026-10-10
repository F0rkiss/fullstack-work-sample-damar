import { useDeferredValue, useMemo, useState } from 'react';
import { ProductTable } from './components/ProductTable';
import { StockSummary } from './components/StockSummary';
import type { Product } from './types';
import { useProducts } from './useProducts';

const PRODUCT_COUNT = 5_000;

function filterProducts(products: Product[], query: string) {
  const needle = query.trim().toLowerCase();
  if (!needle) return products;
  return products.filter(
    (p) => p.name.toLowerCase().includes(needle) || p.sku.toLowerCase().includes(needle),
  );
}

export default function App() {
  const { products, adjustStock } = useProducts(PRODUCT_COUNT);
  const [query, setQuery] = useState('');
  const [showRenders, setShowRenders] = useState(false);

  const deferredQuery = useDeferredValue(query);
  const visibleProducts = useMemo(
    () => filterProducts(products, deferredQuery),
    [products, deferredQuery],
  );
  const isEmpty = visibleProducts.length === 0;

  return (
    <main className="dashboard" data-show-renders={showRenders || undefined}>
      <h1>Dashboard Produk</h1>

      <StockSummary products={products} />

      <div className="toolbar">
        <input
          type="search"
          name="query"
          aria-label="Cari produk"
          placeholder="Cari nama atau SKU…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <label className="toggle">
          <input
            type="checkbox"
            name="showRenders"
            checked={showRenders}
            onChange={(event) => setShowRenders(event.target.checked)}
          />
          Tampilkan render counter
        </label>
      </div>

      {/* Always mounted so screen readers announce the text when it appears. */}
      <p role="status" className="status">
        {isEmpty ? `Tidak ada produk yang cocok dengan “${deferredQuery}”.` : null}
      </p>

      {!isEmpty && (
        // Keyed by query so a new search starts at the top instead of keeping
        // the previous scroll offset.
        <ProductTable key={deferredQuery} products={visibleProducts} onAdjustStock={adjustStock} />
      )}
    </main>
  );
}
