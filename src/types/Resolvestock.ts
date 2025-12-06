export function resolveStock(p: any): number {
  return Number(
    p.stocks ??  // backend CORRECT FIELD
    p.stock ??   // fallback older FE
    p.inStock ?? // fallback older FE version
    0
  );
}
