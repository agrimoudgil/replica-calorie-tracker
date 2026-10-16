/** "3 phulka", "1.5 katori dal tadka", "200 g paneer bhurji", "1 glass masala chai". */
export function portionText(quantity: number, unit: string, name: string): string {
  const n = name.toLowerCase();
  return unit === "piece" ? `${quantity} ${n}` : `${quantity} ${unit} ${n}`;
}
