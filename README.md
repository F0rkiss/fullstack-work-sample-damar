# Work Sample Test — Fullstack Development & Business Systems

**Kandidat:** Damar Pradnyana · **Posisi:** Senior Fullstack JavaScript / React Engineer

Kode fungsional untuk Soal #1 ada di folder [`src/`](./src). Jawaban Soal #2–#5 menyusul.

## Daftar isi

- [Cara menjalankan](#cara-menjalankan)
- [Catatan prioritisasi waktu](#catatan-prioritisasi-waktu)
- [Soal #1 — Optimasi performa & state management React](#soal-1--optimasi-performa--state-management-react)
- [Soal #2 — Arsitektur backend, JWT, & high-concurrency](#soal-2--arsitektur-backend-jwt--high-concurrency)
- [Soal #3 — Webhook reliability & resiliency](#soal-3--webhook-reliability--resiliency)
- [Soal #4 — TCO: monolith vs microservices](#soal-4--tco-monolith-vs-microservices)
- [Soal #5 — Prioritisasi fitur, LTV/CAC, & tech debt](#soal-5--prioritisasi-fitur-ltvcac--tech-debt)

## Cara menjalankan

Membutuhkan Node.js 20.19+ (dibutuhkan Vite 8).

```bash
npm install
npm start          # dev server Vite, buka URL yang dicetak di terminal
npm run build      # typecheck (tsc) + production build
npm run preview    # serve hasil build produksi
```

Di aplikasi: centang **Tampilkan render counter**, lalu klik **+** / **−** pada satu baris. Hanya
counter baris itu yang bertambah (`×1 → ×2`); baris lain tetap.

## Catatan prioritisasi waktu

Bobot rubrik: Soal #1 dan #2 masing-masing 25%, #3 20%, #4 dan #5 masing-masing 15%.

Keputusan scope Soal #1: satu pendekatan yang bersih (virtualization + memoization + state yang
stabil), bukan semua teknik sekaligus. Lebih mudah dijelaskan dan dibuktikan.

---

## Soal #1 — Optimasi performa & state management React

### Diagnosis: kenapa satu perubahan kecil me-render ulang seluruh dashboard?

Kondisi awal yang umum: array 5.000 produk disimpan di `useState` pada komponen dashboard, dan satu
item diubah lewat `setProducts(prev => prev.map(...))`.

1. **Render menjalar ke bawah secara default.** Saat state di root berubah, React memanggil ulang
   fungsi komponen root dan, tanpa `React.memo`, seluruh turunannya: 5.000 × `ProductRow`, beserta
   reconciliation-nya. Yang mahal bukan update DOM-nya (React hanya menyentuh yang berubah),
   melainkan memanggil dan membandingkan 5.000 komponen di main thread dalam satu frame.
2. **Identitas prop tidak stabil, sehingga `React.memo` percuma.** Callback inline
   (`onUpdate={() => ...}`), objek literal baru, atau `map` yang membuat objek baru untuk *semua*
   item membuat shallow-compare selalu gagal. Memoization hanya bekerja kalau item yang tidak
   berubah mempertahankan referensinya.
3. **Biaya DOM.** 5.000 baris × ±6 node ≈ 30.000 node. Layout, paint, dan memori mahal walaupun
   React-nya efisien; ini tidak bisa diselesaikan dengan memoization saja.
4. **Context / derived value yang berubah identitas.** `value={{ ... }}` pada Provider atau hasil
   turunan yang dihitung ulang tiap render memaksa semua consumer ikut render.

Cara membuktikannya: React DevTools Profiler (*Record why each component rendered*) menunjukkan
5.000 baris dengan alasan "parent rendered", dan panel Performance menunjukkan long task di fase
render + layout.

### Solusi

Tiga lapis, masing-masing menyerang satu penyebab di atas:

| Penyebab | Solusi | File |
|---|---|---|
| Terlalu banyak komponen / node | Virtualization dengan `react-window` (`FixedSizeList`): hanya ±20 baris yang ter-mount | [`ProductTable.tsx`](./src/components/ProductTable.tsx) |
| Semua baris render ulang | `React.memo` pada baris + referensi item yang tidak berubah tetap sama | [`ProductRow.tsx`](./src/components/ProductRow.tsx), [`useProducts.ts`](./src/useProducts.ts) |
| Callback / prop tidak stabil | `dispatch` dari `useReducer` + `useCallback([])` sehingga `onAdjustStock` stabil | [`useProducts.ts`](./src/useProducts.ts) |

**Reducer yang menjaga referensi** ([`useProducts.ts`](./src/useProducts.ts)):

```ts
function reducer(products: Product[], action: Action): Product[] {
  const index = products.findIndex((p) => p.id === action.id);
  if (index === -1) return products;

  const current = products[index];
  const stock = Math.max(0, current.stock + action.delta);
  if (stock === current.stock) return products; // no-op: tidak memicu render sama sekali

  const next = products.slice();
  next[index] = { ...current, stock }; // hanya item ini yang dapat referensi baru
  return next;
}
```

**Baris yang di-memo** ([`ProductRow.tsx`](./src/components/ProductRow.tsx)):

```tsx
export const ProductRow = memo(function ProductRow({ product, rowIndex, style, onAdjustStock }: ProductRowProps) {
  // ...
});
```

`style` aman untuk shallow-compare karena `react-window` meng-cache objek style per index.

**Virtualized list** ([`ProductTable.tsx`](./src/components/ProductTable.tsx)):

```tsx
// level modul: identitas stabil, jadi FixedSizeList (PureComponent) bisa melewati render
const getItemKey = (index: number, data: RowData) => data.products[index].id;

<FixedSizeList
  height={560} width="100%" itemSize={56} overscanCount={10}
  itemCount={products.length}
  itemData={itemData}        // di-memo dengan useMemo
  itemKey={getItemKey}       // key stabil: id, bukan index
  outerElementType={Scroller} // focusable, bisa di-scroll dengan keyboard
  innerElementType={RowGroup} // role="rowgroup"
>
  {Row}
</FixedSizeList>
```

### Strategi state management agar update satu item tidak memicu render global

1. **Update immutable dengan structural sharing.** Hanya item yang berubah mendapat objek baru;
   sisanya mempertahankan referensi, jadi `React.memo` bisa memutuskan "skip" dengan murah.
2. **Callback yang stabil.** Aksi dikirim lewat `dispatch` (stabil seumur komponen), bukan closure
   yang dibuat ulang tiap render. Tidak ada `setProducts(prev => ...)` yang dilempar ke bawah.
3. **Data turunan di-`useMemo`, bukan disimpan sebagai state kedua.** `StockSummary` menghitung
   ringkasan dari `products` dan di-memo, sehingga mengetik di kolom pencarian (yang tidak mengubah
   `products`) tidak menghitung ulang ringkasan.
4. **Input yang cepat dipisah dari kerja yang mahal.** Query pencarian memakai `useDeferredValue`,
   jadi mengetik tetap responsif walau filter 5.000 item berjalan.
5. **Jangan jadikan semuanya satu state global.** State UI lokal (query, toggle) tidak perlu
   menyentuh data produk.

**Kapan naik level?** Pada contoh ini state tinggal di satu komponen, dan induknya tetap render
ringan karena virtualization (hanya ±20 baris yang dievaluasi). Jika banyak konsumen berbeda
mengakses item yang sama atau data masuk real-time lewat WebSocket, saya akan memindahkan ke store
dengan **selector per item** (Zustand, atau Redux Toolkit `createEntityAdapter` + `useSelector`,
atau `useSyncExternalStore`), sehingga tiap baris berlangganan `byId[id]` dan induk tidak render
sama sekali. Untuk update beruntun, buffer pesan dan flush per frame (`requestAnimationFrame` /
`startTransition`). Trade-off-nya: tambahan dependency dan indireksi yang belum sebanding di skala
komponen ini.

### Bukti

Diukur di build produksi (`vite preview`) dengan skrip di browser:

| Pengukuran | Hasil |
|---|---|
| Baris logis (`aria-rowcount`, termasuk header) | 5.001 |
| Baris ter-mount di DOM | 20 |
| Klik **+** pada satu baris: `ProductRow` yang dieksekusi ulang | 1 dari 20 (counter `×1 → ×2`, stok 93 → 94) |
| Pencarian `sku-00042` | 1 baris hasil (`aria-rowcount` = 2) |

Transparansi soal apa yang tetap berjalan per klik: `App`, `StockSummary` (totalnya memang
berubah), `ProductTable`, `FixedSizeList`, dan ±20 wrapper `Row` yang tipis ikut dievaluasi. Yang
dilindungi `React.memo` adalah `ProductRow`, yaitu bagian yang mahal; biaya sisanya konstan terhadap
jumlah baris yang terlihat, bukan terhadap 5.000 item.

### Trade-off & batasan yang saya sadari

- **Virtualization vs. aksesibilitas dasar.** Baris di luar layar tidak ada di DOM, jadi tidak bisa
  di-Tab atau ditemukan dengan Ctrl+F sampai ter-scroll masuk. Mitigasi: kolom pencarian, role
  ARIA `table` / `row` / `cell` / `columnheader` dengan `aria-rowindex` + `aria-rowcount` agar
  screen reader tahu total baris, dan scroller yang focusable.
- **Tinggi baris tetap.** Dipilih agar scroll terasa native dan perhitungan murah; baris dengan tinggi
  dinamis butuh `VariableSizeList` + pengukuran dan di luar kebutuhan soal ini.
- **`react-window` dipin ke v1** agar API-nya sama dengan snippet `FixedSizeList` di soal.
- **Render counter** hanya alat bantu evaluator; ia menulis ke DOM dari effect dan disembunyikan
  lewat CSS, jadi menampilkannya tidak menyebabkan render.

---

## Soal #2 — Arsitektur backend, JWT, & high-concurrency

_Jawaban menyusul._

---

## Soal #3 — Webhook reliability & resiliency

_Jawaban menyusul._

---

## Soal #4 — TCO: monolith vs microservices

_Jawaban menyusul._

---

## Soal #5 — Prioritisasi fitur, LTV/CAC, & tech debt

_Jawaban menyusul._
