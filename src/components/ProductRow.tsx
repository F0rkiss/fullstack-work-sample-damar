import { memo, type CSSProperties } from 'react';
import type { Product } from '../types';
import { useRenderCounter } from '../useRenderCounter';

const LOW_STOCK_THRESHOLD = 10;

const priceFormatter = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
});

export function stockStatus(stock: number) {
  if (stock === 0) return { label: 'Habis', tone: 'out' } as const;
  if (stock < LOW_STOCK_THRESHOLD) return { label: 'Menipis', tone: 'low' } as const;
  return { label: 'Tersedia', tone: 'ok' } as const;
}

interface ProductRowProps {
  product: Product;
  rowIndex: number;
  style: CSSProperties;
  onAdjustStock: (id: number, delta: number) => void;
}

export const ProductRow = memo(function ProductRow({
  product,
  rowIndex,
  style,
  onAdjustStock,
}: ProductRowProps) {
  const renderBadge = useRenderCounter();
  const status = stockStatus(product.stock);

  return (
    <div role="row" aria-rowindex={rowIndex} className="row" style={style}>
      <div role="cell" className="cell cell-name">
        <span>{product.name}</span>
        <span className="render-count" ref={renderBadge} />
      </div>
      <div role="cell" className="cell cell-muted">
        {product.sku}
      </div>
      <div role="cell" className="cell cell-number">
        {priceFormatter.format(product.price)}
      </div>
      <div role="cell" className="cell">
        <span className={`badge badge-${status.tone}`}>{status.label}</span>
      </div>
      <div role="cell" className="cell cell-stepper">
        <button
          type="button"
          aria-label={`Kurangi stok ${product.name}`}
          disabled={product.stock === 0}
          onClick={() => onAdjustStock(product.id, -1)}
        >
          −
        </button>
        <span className="qty">{product.stock}</span>
        <button
          type="button"
          aria-label={`Tambah stok ${product.name}`}
          onClick={() => onAdjustStock(product.id, 1)}
        >
          +
        </button>
      </div>
    </div>
  );
});
