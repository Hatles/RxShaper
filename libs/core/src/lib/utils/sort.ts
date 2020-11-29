
export function sort<T = any>(items: T[], propertyFn: (item: T) => any): T[] {
  return items.sort((a, b) => {
    const aValue = propertyFn(a);
    const bValue = propertyFn(b);
    return (aValue > bValue) ? 1 : (aValue === bValue) ? 0 : -1;
  });
}
