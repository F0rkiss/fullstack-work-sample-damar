import { useMemo, type ComponentPropsWithRef } from 'react';
import { FixedSizeList, type ListChildComponentProps } from 'react-window';
import type { Product } from '../types';
import { ProductRow } from './ProductRow';

const ROW_HEIGHT = 56;
const LIST_HEIGHT = 560;
const OVERSCAN = 10;
const HEADER_ROW_COUNT = 1;

interface RowData {
  products: Product[];
  onAdjustStock: (id: number, delta: number) => void;
}

function Row({ index, style, data }: ListChildComponentProps<RowData>) {
  return (
    <ProductRow
      product={data.products[index]}
      rowIndex={index + HEADER_ROW_COUNT + 1}
      style={style}
      onAdjustStock={data.onAdjustStock}
    />
  );
}

// Focusable so keyboard users can scroll the list with the arrow keys.
function Scroller(props: ComponentPropsWithRef<'div'>) {
  return <div {...props} tabIndex={0} />;
}

function RowGroup(props: ComponentPropsWithRef<'div'>) {
  return <div {...props} role="rowgroup" />;
}

interface ProductTableProps {
  products: Product[];
  onAdjustStock: (id: number, delta: number) => void;
}

export function ProductTable({ products, onAdjustStock }: ProductTableProps) {
  const itemData = useMemo(() => ({ products, onAdjustStock }), [products, onAdjustStock]);

  return (
    <div
      role="table"
      aria-label="Daftar produk"
      aria-rowcount={products.length + HEADER_ROW_COUNT}
      className="table"
    >
      <div role="row" aria-rowindex={1} className="row row-header">
        <div role="columnheader" className="cell">Produk</div>
        <div role="columnheader" className="cell">SKU</div>
        <div role="columnheader" className="cell cell-number">Harga</div>
        <div role="columnheader" className="cell">Status</div>
        <div role="columnheader" className="cell">Stok</div>
      </div>
      <FixedSizeList
        height={LIST_HEIGHT}
        width="100%"
        itemCount={products.length}
        itemSize={ROW_HEIGHT}
        itemData={itemData}
        itemKey={(index, data) => data.products[index].id}
        overscanCount={OVERSCAN}
        outerElementType={Scroller}
        innerElementType={RowGroup}
      >
        {Row}
      </FixedSizeList>
    </div>
  );
}
