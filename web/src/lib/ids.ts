const ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** True for a UUID. Used before an id goes into a file path or a database query. */
export function isId(value: string): boolean {
  return ID.test(value);
}
