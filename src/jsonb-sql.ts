/**
 * Return the jsonb key selector in PostgreSQL by given array of object key.
 * @param keyPaths The array of object key
 */
function getPglJsonbKeyPath(keyPath: string[]): string {
  return `{${keyPath.join(",")}}`;
}

export function concatenate(object: Record<string, unknown>): string {
  return `object || '${JSON.stringify(object || {})}'::jsonb`;
}

export function incrumentIntAt(keyPath: string[], increment: number): string {
  const pglKeyPath = getPglJsonbKeyPath(keyPath);
  return `jsonb_set(object, '${pglKeyPath}',(COALESCE(object#>>'${pglKeyPath}','0')::int + (${increment}))::text::jsonb, false)`;
}

export function incrumentFloatAt(keyPath: string[], increment: number): string {
  const pglKeyPath = getPglJsonbKeyPath(keyPath);
  return `jsonb_set(object, '${pglKeyPath}',(COALESCE(object#>>'${pglKeyPath}','0')::real + (${increment}))::text::jsonb, false)`;
}
