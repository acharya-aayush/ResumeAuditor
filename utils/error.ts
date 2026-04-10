export const getErrorMessage = (
  error: unknown,
  fallback = 'An error occurred. Please try again.'
): string => {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (typeof error === 'string' && error.trim().length > 0) {
    return error;
  }

  return fallback;
};