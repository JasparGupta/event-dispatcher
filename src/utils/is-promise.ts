export default function isPromise<T = unknown>(value: unknown): value is Promise<T> {
  return Boolean(value)
    && typeof value === 'object'
    && 'then' in value!
    && typeof value.then === 'function';
}
