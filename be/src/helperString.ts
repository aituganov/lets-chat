export function pad (value: any, count: number, symbol: string) {
  const vs = value.toString();
  return vs.length < count ? vs.padStart(count, symbol) : vs;
}