type Result<T, E> = { data: T; error: null } | { data: null; error: E };

export function tryCatch<T, E = Error>(
  input: Promise<T> | (() => T | Promise<T>),
): Result<T, E> | Promise<Result<T, E>> {
  try {
    const result = typeof input === "function" ? input() : input;

    if (result instanceof Promise) {
      return result.then(
        (data): Result<T, E> => ({ data, error: null }),
        (error): Result<T, E> => ({ data: null, error: error as E }),
      );
    }

    return { data: result, error: null };
  } catch (error) {
    return { data: null, error: error as E };
  }
}
