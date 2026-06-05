export function formatFieldError(error: unknown): string | null {
  if (Error.isError(error)) {
    const { message } = error;

    return typeof message === "string" ? message : null;
  }

  if (typeof error === "string") {
    return error;
  }

  return null;
}
