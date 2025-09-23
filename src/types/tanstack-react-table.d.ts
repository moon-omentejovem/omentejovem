declare module '@tanstack/react-table' {
  export type ColumnDef<T> = any
  export type Header<T, TValue> = any
  export type HeaderGroup<T> = any
  export type Row<T> = any
  export type Cell<T, TValue> = any
  export type SortingState = any
  export function useReactTable<T>(options: any): any
  export function flexRender<T>(comp: any, context: any): any
  export function getCoreRowModel(): any
  export function getFilteredRowModel(): any
  export function getSortedRowModel(): any
}
